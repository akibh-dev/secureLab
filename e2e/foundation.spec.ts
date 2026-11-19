import { expect, test } from "@playwright/test";

test("home and missing-page recovery work in the static build", async ({
  page,
}) => {
  expect((await page.goto("/absent-foundation-page"))?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to SecureLab" }).click();
  await expect(
    page.getByRole("heading", { name: "Interactive API Security Academy" }),
  ).toBeVisible();
});
