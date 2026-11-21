import { expect, it } from "vitest";
import { pilot } from "../../lab-content/src/pilot";
import { labSchema } from "@securelab/lab-schema";
import { runLab, solutionFor } from "./index";

it("evaluates a validated policy without mutating fixtures", () => {
  const lab = labSchema.parse(pilot);
  const before = JSON.stringify(lab);
  const result = runLab(lab, solutionFor(lab), lab.correctReason);
  expect(result).toMatchObject({ score: 100, passed: true });
  expect(runLab(lab, solutionFor(lab), lab.correctReason)).toEqual(result);
  expect(JSON.stringify(lab)).toBe(before);
});

it("separates reason points from required behavior", () => {
  expect(runLab(pilot, solutionFor(pilot), "")).toMatchObject({
    score: 90,
    passed: true,
  });
  expect(
    runLab(pilot, { primary: "owners-only" }, pilot.correctReason),
  ).toMatchObject({ score: 30, passed: false });
  expect(runLab(pilot, {}, "")).toMatchObject({ score: 20, passed: false });
});
