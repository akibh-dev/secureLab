import { expect, test } from "@playwright/test";
import { publishedLabs } from "../packages/lab-content/src/index";
import { solutionFor } from "../packages/core/src/index";

for (const width of [390, 1440]) {
  test(`complete the full curriculum at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const origin = new URL(
      test.info().project.use.baseURL ?? "http://127.0.0.1:4322",
    ).origin;
    const mutations: string[] = [];
    page.on("request", (request) => {
      if (
        new URL(request.url()).origin !== origin ||
        request.method() !== "GET"
      )
        mutations.push(request.url());
    });
    await page.goto("/labs/least-privilege-capstone/");
    await expect(
      page.getByText("This lab unlocks after completing", { exact: false }),
    ).toBeVisible();
    await page.goto("/");
    await page.getByRole("link", { name: "Start learning" }).click();

    for (const [index, lab] of publishedLabs.entries()) {
      await expect(page).toHaveURL(new RegExp(`/labs/${lab.slug}/$`));
      if (width < 1100) await page.getByRole("tab", { name: "Fix" }).click();
      for (const id of Object.values(solutionFor(lab))) {
        await page.locator(`input[value="${id}"]`).check();
      }
      await page
        .getByLabel("Why does your policy work?")
        .selectOption(lab.correctReason);
      await page.getByRole("button", { name: "Run tests" }).click();
      await expect(
        page.getByText(
          `${lab.cases.length} of ${lab.cases.length} tests passed. Lab complete.`,
        ),
      ).toBeVisible();
      await expect(page.getByText(/Best 100\/100/)).toBeVisible();
      if (index < publishedLabs.length - 1)
        await page.getByRole("link", { name: "Next lab" }).click();
    }

    await page.getByRole("link", { name: "View progress" }).click();
    await expect(page.getByText("6 of 6 labs complete")).toBeVisible();
    await page.reload();
    await expect(page.getByText("6 of 6 labs complete")).toBeVisible();
    expect(mutations).toEqual([]);
  });
}

test("export, validate, cancel and restore browser progress", async ({
  page,
}) => {
  await page.goto("/progress/");
  const input = page.getByLabel("Import progress");
  await input.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":2,"labs":{}}'),
  });
  await expect(
    page.getByText("This file uses an invalid or unsupported progress format."),
  ).toBeVisible();
  const snapshot = {
    schemaVersion: 1,
    labs: {
      "MVP-01": [
        {
          version: 1,
          selection: { primary: "members" },
          reason: "relationship",
          hints: [0],
          attempts: 1,
          best: 100,
          completedAt: "2026-11-21T00:00:00Z",
        },
      ],
    },
  };
  const importFile = {
    name: "securelab-progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(snapshot)),
  };
  await input.setInputFiles(importFile);
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("0 of 6 labs complete")).toBeVisible();
  await input.setInputFiles(importFile);
  await page.getByRole("button", { name: "Replace progress" }).click();
  await expect(page.getByText("1 of 6 labs complete")).toBeVisible();
  const exported = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export progress" }).click();
  expect((await exported).suggestedFilename()).toBe("securelab-progress.json");
  await page.getByRole("button", { name: "Erase all progress" }).click();
  await page
    .getByRole("button", { name: "Erase progress", exact: true })
    .click();
  await expect(page.getByText("0 of 6 labs complete")).toBeVisible();
});

test("production policy allows hydration with a same-origin connection rule", async ({
  page,
}) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      message.text().includes("Content Security Policy")
    ) {
      violations.push(message.text());
    }
  });
  const response = await page.goto(
    "/labs/authentication-is-not-authorization/",
  );
  const policy = response?.headers()["content-security-policy"];
  expect(policy).toContain("connect-src 'self'");
  expect(policy).toContain("script-src 'self' 'sha256-");
  await expect(
    page.getByRole("radio", { name: /Require verified project membership/ }),
  ).toBeVisible();
  await expect(page.getByText("Available offline")).toBeVisible();
  expect(violations).toEqual([]);
});

test("when persistent storage is blocked the learner can still run the lab", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  await page.goto("/labs/authentication-is-not-authorization/");
  await expect(
    page.getByText("Progress is saved for this session only."),
  ).toBeVisible();
  await page
    .getByRole("radio", { name: /Require verified project membership/ })
    .check();
  await page.getByRole("button", { name: "Run tests" }).click();
  await expect(
    page.getByText("4 of 4 tests passed. Lab complete."),
  ).toBeVisible();
});

test("keeps the curriculum, progress and lab usable at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const path of [
    "/",
    "/learn/",
    "/progress/",
    "/labs/authentication-is-not-authorization/",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320);
  }
  await page.getByRole("tab", { name: "Fix" }).click();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});

test("serializes attempts from two tabs", async ({ page, context }) => {
  const other = await context.newPage();
  const url = "/labs/authentication-is-not-authorization/";
  await page.goto(url);
  await page
    .getByRole("radio", { name: /Require verified project membership/ })
    .check();
  await expect(page.getByRole("button", { name: "Run tests" })).toBeEnabled();
  await other.goto(url);
  await expect(
    other.getByRole("radio", { name: /Require verified project membership/ }),
  ).toBeChecked();
  await Promise.all(
    [page, other].map((tab) =>
      tab.getByRole("button", { name: "Run tests" }).click(),
    ),
  );
  await expect(page.getByText(/2 attempts/)).toBeVisible();
  await expect(other.getByText(/2 attempts/)).toBeVisible();
});
