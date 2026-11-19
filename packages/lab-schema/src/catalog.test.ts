import { expect, it } from "vitest";
import { catalogSchema } from "./index";

const project = {
  id: "MVP-01",
  slug: "project-membership",
  title: "Project membership",
};

it("accepts a unique catalog entry", () => {
  expect(catalogSchema.parse([project])).toEqual([project]);
});

it("identifies duplicate IDs and slugs at the conflicting entry", () => {
  const result = catalogSchema.safeParse([project, project]);
  expect(result.error?.issues.map((issue) => issue.path)).toEqual([
    [1, "id"],
    [1, "slug"],
  ]);
});
