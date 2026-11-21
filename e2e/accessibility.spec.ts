import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("checks learner entry points for WCAG A and AA rules", async ({
  page,
}, info) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 960 },
  ]) {
    await page.setViewportSize(viewport);
    for (const [name, path] of Object.entries({
      home: "/",
      curriculum: "/learn/",
      progress: "/progress/",
      lab: "/labs/authentication-is-not-authorization/",
    })) {
      await page.goto(path);
      if (name === "lab") {
        await expect(
          page.getByRole("button", { name: "Hints", exact: true }),
        ).toBeVisible();
        if (viewport.width < 1100)
          await page.getByRole("tab", { name: "Fix" }).click();
      }
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map(({ id, nodes }) => ({
          id,
          targets: nodes.map((node) => node.target),
        })),
        `${name} at ${viewport.width}px`,
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`${name}-${viewport.width}.png`),
        fullPage: true,
      });
    }
  }
});
