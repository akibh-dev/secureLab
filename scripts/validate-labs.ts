import { publishedLabs } from "../packages/lab-content/src/index";
import { catalogSchema, labSchema } from "../packages/lab-schema/src/index";
import { runLab, solutionFor } from "../packages/core/src/index";

const labs = publishedLabs.map((lab, index) => {
  const parsed = labSchema.safeParse(lab);
  if (!parsed.success)
    throw new Error(
      `packages/lab-content entry ${index}: ${parsed.error.message}`,
    );
  return parsed.data;
});
catalogSchema.parse(labs.map(({ id, slug, title }) => ({ id, slug, title })));
for (const lab of labs) {
  const assert = (condition: unknown, field: string) => {
    if (!condition) throw new Error(`packages/lab-content ${lab.id}: ${field}`);
  };
  const visit = (id: string, ancestors: string[]) => {
    assert(!ancestors.includes(id), `Prerequisite cycle at ${id}`);
    const dependency = labs.find((entry) => entry.id === id);
    assert(dependency, `Missing prerequisite ${id}`);
    dependency?.prerequisites.forEach((next) =>
      visit(next, [...ancestors, id]),
    );
  };
  lab.prerequisites.forEach((next) => visit(next, [lab.id]));
  assert(
    new Set(lab.cases.map((test) => test.id)).size === lab.cases.length,
    "Duplicate case ID",
  );
  assert(
    lab.cases.every((test) => Object.hasOwn(lab.invariants, test.invariant)),
    "Unknown invariant",
  );
  assert(
    lab.cases.some((test) => test.group === "behavior") &&
      lab.cases.some((test) => test.group === "boundary"),
    "Both score groups required",
  );
  assert(
    lab.reasoning.some((reason) => reason.id === lab.correctReason),
    "Unknown reasoning solution",
  );
  assert(
    new Set(lab.reasoning.map((reason) => reason.id)).size ===
      lab.reasoning.length,
    "Duplicate reasoning ID",
  );
  const solution = solutionFor(lab);
  assert(
    runLab(lab, solution, lab.correctReason).score === 100 &&
      runLab(lab, solution, lab.correctReason).passed,
    "Solution failed",
  );
  const groups =
    lab.mode === "choose-fix"
      ? [{ action: "primary", options: lab.options }]
      : lab.rules;
  assert(
    new Set(groups.map((group) => group.action)).size === groups.length,
    "Duplicate rule action",
  );
  for (const { action, options } of groups) {
    assert(
      new Set(options.map((option) => option.id)).size === options.length,
      "Duplicate choice ID",
    );
    for (const option of options.filter(
      (option) => option.id !== solution[action],
    )) {
      assert(
        !runLab(lab, { ...solution, [action]: option.id }, lab.correctReason)
          .passed,
        `Distractor passes: ${option.id}`,
      );
    }
  }
}
console.log(`Validated ${labs.length} published labs.`);
