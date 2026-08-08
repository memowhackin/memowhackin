import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config. Tests live in `e2e/` and run against the dev server,
 * which Playwright starts automatically. The backend API is mocked per-test
 * (see e2e/smoke.spec.ts), so e2e runs without a running backend or database.
 *
 * Run: `npm run e2e` (first time: `npx playwright install chromium`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
