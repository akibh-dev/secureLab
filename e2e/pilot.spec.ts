import { expect, test } from "@playwright/test";

test("pilot supports keyboard tabs, feedback, hints, draft restore and offline grading", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/labs/authentication-is-not-authorization/");
  await expect(page.getByText("Available offline")).toBeVisible();
  const brief = page.getByRole("tab", { name: "Brief" });
  await brief.focus();
  await brief.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Fix" })).toBeFocused();
  await page.getByRole("radio", { name: /Require the project owner/ }).check();
  await page.getByRole("button", { name: "Run tests" }).click();
  await expect(page.getByText(/Review the failed checks/)).toBeVisible();
  await page.getByRole("button", { name: "Hints", exact: true }).click();
  await page.getByRole("button", { name: "Reveal hint 1" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByText(
        "Think about the relationship between the verified actor and this project.",
      ),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Hints", exact: true }),
  ).toBeFocused();
  await page.reload();
  await page.getByRole("tab", { name: "Fix" }).click();
  await expect(
    page.getByRole("radio", { name: /Require the project owner/ }),
  ).toBeChecked();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("tab", { name: "Fix" }).click();
  await page
    .getByRole("radio", { name: /Require verified project membership/ })
    .check();
  await page.getByRole("button", { name: "Run tests" }).click();
  await expect(
    page.getByText("4 of 4 tests passed. Lab complete."),
  ).toBeVisible();
});
