import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config. Tests live in `e2e/`.
 *
 * The blog reads from the CMS, so a run with one reachable covers the whole
 * chain — database, API, prerender, markup. Without one the blog assertions
 * skip and the rest still run; the admin specs never need it, since they
 * intercept the API per-test (see e2e/admin.spec.ts).
 *
 * Run: `npm run e2e` (first time: `npx playwright install chromium`).
 */

// Overridable so a run does not collide with a dev server already on 3000.
const PORT = process.env.PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: {
    /*
     * Locally the dev server keeps the edit-and-rerun loop fast. CI builds and
     * prerenders, then serves dist/ through the same file-resolution order as
     * production nginx — so the suite exercises the real artifact, including
     * whether React still mounts on top of the prerendered HTML.
     *
     * `vite preview` is deliberately not used: its blanket SPA fallback would
     * serve the root shell for a route whose prerendered file is missing, and
     * the no-JS test would pass against a build that prerendered nothing.
     */
    command: process.env.CI
      ? "npm run build:static && node scripts/serve-dist.mjs"
      : `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // The CI command compiles two locale bundles and prerenders ~36 pages in a
    // real browser before the server answers; a two-core runner needs well over
    // the 60s default, and a timeout here reports as "server never started",
    // pointing away from the actual cause.
    timeout: 420_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Runs under the no-javascript project instead; there is nothing to learn
      // from checking prerendered markup with the app live on top of it.
      testIgnore: /prerender\.spec\.ts/,
    },
    {
      // The closest thing to a crawler that does not execute JavaScript. Only
      // meaningful against a prerendered build, so it is skipped outside CI.
      name: "no-javascript",
      testMatch: /prerender\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
    },
  ],
});
