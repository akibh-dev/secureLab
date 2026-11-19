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
