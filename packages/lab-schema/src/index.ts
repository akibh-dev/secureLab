import { z } from "zod";

export const labSummarySchema = z.strictObject({
  id: z.string().regex(/^MVP-\d{2}$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1),
});
export type LabSummary = z.infer<typeof labSummarySchema>;

export const catalogSchema = z
  .array(labSummarySchema)
  .superRefine((labs, ctx) => {
    for (const field of ["id", "slug"] as const) {
      const seen = new Set<string>();
      labs.forEach((lab, index) => {
        if (seen.has(lab[field]))
          ctx.addIssue({
            code: "custom",
            path: [index, field],
            message: "Duplicate " + field,
          });
        seen.add(lab[field]);
      });
    }
  });

const identifier = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const prose = z.string().trim().min(1);
export const actions = ["read", "close", "edit", "share", "list"] as const;
export const conditions = [
  "signed-in",
  "member",
  "tenant",
  "owner",
  "visible",
  "permission",
  "open",
  "valid-page",
] as const;
const variant = z.strictObject({
  id: identifier,
  label: prose,
  checks: z.array(z.enum(conditions)).min(1),
  effect: z.enum(["access", "profile", "page", "update"]),
  profile: z.enum(["public", "by-audience"]).optional(),
});
export const fixtureSchema = z.strictObject({
  actor: z
    .strictObject({
      id: identifier,
      tenant: identifier.optional(),
      permissions: z.array(z.enum(actions)),
    })
    .nullable(),
  resource: z
    .strictObject({
      tenant: identifier,
      owner: identifier,
      members: z.array(identifier),
      visibility: z.enum(["private", "team"]),
      open: z.boolean(),
    })
    .nullable(),
  page: z.string().optional(),
  size: z.string().optional(),
  suppliedTenant: identifier.optional(),
});
export const observationSchema = z.discriminatedUnion("outcome", [
  z.strictObject({ outcome: z.literal("restricted") }),
  z.strictObject({ outcome: z.literal("invalid-input"), reads: z.literal(0) }),
  z.strictObject({
    outcome: z.literal("allowed"),
    fields: z.array(identifier).optional(),
    page: z.number().int().optional(),
    size: z.number().int().optional(),
    state: z.enum(["closed", "edited", "shared"]).optional(),
  }),
]);
const assessmentCase = z.strictObject({
  id: identifier,
  label: prose,
  invariant: identifier,
  action: z.enum(actions),
  fixture: fixtureSchema,
  expected: observationSchema,
  group: z.enum(["behavior", "boundary"]),
  weight: z.number().int().min(1).max(100),
});
const common = labSummarySchema.extend({
  version: z.number().int().positive(),
  module: identifier,
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  minutes: z.number().int().positive(),
  prerequisites: z.array(z.string().regex(/^MVP-\d{2}$/)),
  objective: prose,
  scenario: prose,
  routes: z.array(prose).min(1),
  invariants: z.record(identifier, prose),
  hints: z.tuple([prose, prose, prose]),
  cases: z.array(assessmentCase).min(3),
  explanation: prose,
  references: z
    .array(
      z.strictObject({ label: prose, url: z.url({ protocol: /^https$/ }) }),
    )
    .min(1),
  reasoning: z.array(z.strictObject({ id: identifier, label: prose })).min(2),
  correctReason: identifier,
});
export const labSchema = z.discriminatedUnion("mode", [
  common.extend({
    mode: z.literal("choose-fix"),
    options: z.array(variant).min(2),
    solution: identifier,
  }),
  common.extend({
    mode: z.literal("policy-editor"),
    rules: z
      .array(
        z.strictObject({
          action: z.enum(actions),
          options: z.array(variant).min(2),
          solution: identifier,
        }),
      )
      .min(1),
  }),
]);

export type Lab = z.infer<typeof labSchema>;
export type Variant = z.infer<typeof variant>;
export type AssessmentCase = z.infer<typeof assessmentCase>;
export type Observation = z.infer<typeof observationSchema>;
export type Selection = Readonly<Record<string, string>>;
