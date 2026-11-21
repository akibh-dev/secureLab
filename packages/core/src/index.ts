import {
  type AssessmentCase,
  type Lab,
  type Observation,
  type Selection,
  type Variant,
} from "@securelab/lab-schema";

export const contractVersion = 1;

function pageNumber(raw: string | undefined, fallback: number, max: number) {
  if (raw === undefined) return fallback;
  if (!/^[1-9][0-9]{0,3}$/.test(raw)) return null;
  const value = Number(raw);
  return value <= max ? value : null;
}

function evaluate(test: AssessmentCase, policy: Variant | undefined) {
  const {
    action,
    fixture: { actor, resource },
  } = test;
  const page = pageNumber(test.fixture.page, 1, 1000);
  const size = pageNumber(test.fixture.size, 20, 50);
  const owner = !!actor && resource?.owner === actor.id;
  const checks = {
    "signed-in": [!!actor, "Verified identity"],
    member: [
      !!actor && !!resource?.members.includes(actor.id),
      "Membership confirmed",
    ],
    tenant: [
      !!actor?.tenant && actor.tenant === resource?.tenant,
      "Verified tenant matches",
    ],
    owner: [owner, "Resource owner confirmed"],
    visible: [
      !!actor && (owner || resource?.visibility === "team"),
      "Audience has access",
    ],
    permission: [
      !!actor?.permissions.includes(action),
      "Action permission confirmed",
    ],
    open: [!!resource?.open, "Record is open"],
    "valid-page": [
      page !== null && size !== null,
      "Pagination is within bounds",
    ],
  } as const;
  const trace: { label: string; passed: boolean }[] = [];
  const restricted: Observation = { outcome: "restricted" };
  if (!policy || !actor || (!resource && policy.effect !== "page")) {
    return {
      observed: restricted,
      trace: [{ label: "Required context available", passed: false }],
    };
  }

  for (const check of policy.checks) {
    const [passed, label] = checks[check];
    trace.push({ label, passed });
    if (!passed) {
      const observed: Observation =
        check === "valid-page"
          ? { outcome: "invalid-input", reads: 0 }
          : restricted;
      return { observed, trace };
    }
  }

  const observed: Observation = { outcome: "allowed" };
  switch (policy.effect) {
    case "profile":
      observed.fields =
        policy.profile === "by-audience" && owner
          ? ["display-name", "bio", "contact-preference"]
          : ["display-name", "bio"];
      break;
    case "page":
      if (page === null || size === null)
        return { observed: restricted, trace };
      observed.page = page;
      observed.size = size;
      break;
    case "update":
      if (action === "close") observed.state = "closed";
      if (action === "edit") observed.state = "edited";
      if (action === "share") observed.state = "shared";
      break;
  }
  return { observed, trace };
}

export function solutionFor(lab: Lab): Selection {
  return lab.mode === "choose-fix"
    ? { primary: lab.solution }
    : Object.fromEntries(
        lab.rules.map(({ action, solution }) => [action, solution]),
      );
}

export function runLab(lab: Lab, selection: Selection, reasoning: string) {
  const results = lab.cases.map((test) => {
    const rule =
      lab.mode === "policy-editor"
        ? lab.rules.find((rule) => rule.action === test.action)
        : undefined;
    const options = lab.mode === "choose-fix" ? lab.options : rule?.options;
    const policy = options?.find(
      (option) => option.id === selection[rule?.action ?? "primary"],
    );
    const result = evaluate(test, policy);
    const passed =
      Object.keys(test.expected).length ===
        Object.keys(result.observed).length &&
      Object.entries(test.expected).every(
        ([key, value]) =>
          JSON.stringify(value) ===
          JSON.stringify(Reflect.get(result.observed, key)),
      );
    return {
      id: test.id,
      label: test.label,
      invariant: lab.invariants[test.invariant],
      expected: test.expected,
      group: test.group,
      weight: test.weight,
      passed,
      ...result,
    };
  });
  function subtotal(group: AssessmentCase["group"], max: number) {
    const cases = results.filter((test) => test.group === group);
    const weight = cases.reduce((total, item) => total + item.weight, 0);
    const earned = cases.reduce(
      (total, item) => total + (item.passed ? item.weight : 0),
      0,
    );
    return weight ? Math.round((max * earned) / weight) : 0;
  }
  const behavior = subtotal("behavior", 70);
  const boundary = subtotal("boundary", 20);
  const reason = reasoning === lab.correctReason ? 10 : 0;
  const ready = Object.entries(solutionFor(lab)).every(([key]) => {
    const options =
      lab.mode === "choose-fix"
        ? lab.options
        : lab.rules.find((rule) => rule.action === key)?.options;
    return options?.some((option) => option.id === selection[key]);
  });
  return {
    labId: lab.id,
    version: lab.version,
    passed: ready && results.every((test) => test.passed),
    score: behavior + boundary + reason,
    breakdown: { behavior, boundary, reasoning: reason },
    results,
  };
}
export type LabResult = ReturnType<typeof runLab>;
