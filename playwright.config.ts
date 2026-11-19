import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4322";
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  webServer: {
    command:
      "bun run --cwd apps/web astro preview --host 127.0.0.1 --port 4322",
    url: baseURL,
  },
});
