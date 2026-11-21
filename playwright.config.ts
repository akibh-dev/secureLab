import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4322";
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  webServer: {
    command: "bun apps/web/scripts/preview.mjs",
    url: baseURL,
  },
});
