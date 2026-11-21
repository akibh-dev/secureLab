import type { AssessmentCase, Lab, Variant } from "@securelab/lab-schema";

export const member = {
  id: "reader-a",
  tenant: "north",
  permissions: ["read", "list"] as LabAction[],
};
export const outsider = {
  id: "reader-b",
  tenant: "south",
  permissions: ["read"] as LabAction[],
};
export const resource = {
  tenant: "north",
  owner: "owner-a",
  members: ["reader-a", "owner-a"],
  visibility: "team",
  open: true,
} as const;
export const project: AssessmentCase["fixture"]["resource"] = {
  ...resource,
  members: [...resource.members],
};
type LabAction = AssessmentCase["action"];

export function example(
  id: string,
  label: string,
  action: LabAction,
  fixture: AssessmentCase["fixture"],
  expected: AssessmentCase["expected"] = { outcome: "allowed" },
  group: AssessmentCase["group"] = "behavior",
  weight = 1,
): AssessmentCase {
  return {
    id,
    label,
    invariant: "rule",
    action,
    fixture,
    expected,
    group,
    weight,
  };
}

export const restricted = { outcome: "restricted" } as const;
export function option(
  id: string,
  label: string,
  checks: Variant["checks"],
  effect: Variant["effect"] = "access",
  profile?: Variant["profile"],
): Variant {
  return { id, label, checks, effect, ...(profile && { profile }) };
}

export function lesson(
  id: number,
  slug: string,
  title: string,
  module: string,
  objective: string,
  category: string,
) {
  const labId = (number: number) => "MVP-0" + number;
  return {
    id: labId(id),
    slug,
    title,
    module,
    objective,
    version: 1,
    minutes: id === 6 ? 25 : 12,
    difficulty: (id === 6
      ? "Advanced"
      : id >= 3
        ? "Intermediate"
        : "Beginner") as Lab["difficulty"],
    prerequisites: id === 1 ? [] : [labId(id - 1)],
    invariants: { rule: objective },
    references: [
      {
        label: `OWASP API Security Top 10 (2023) · ${category}`,
        url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/",
      },
    ],
  };
}
