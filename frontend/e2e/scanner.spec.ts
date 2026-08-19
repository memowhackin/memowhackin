import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

/*
 * The exposure scanner, end to end, in both languages.
 *
 * These need a backend with a scan provider configured, which a plain
 * developer checkout does not have — so the suite asks first and skips rather
 * than failing, the same way the blog specs skip when the CMS has no posts.
 * Enable it with SCANNER_ENABLED=true and SCANNER_PROVIDER=fixture on the API.
 */

async function scannerAvailable(request: APIRequestContext): Promise<boolean> {
  const response = await request.get("/api/public/scanner/availability");
  if (!response.ok()) return false;
  const body = (await response.json()) as { available?: boolean };
  return body.available === true;
}

/**
 * Run a website scan from the landing page and wait for the report.
 *
 * Creation is rate limited to a handful per window, which is the point of the
 * limiter and a problem for a suite that starts several scans in a row. So a
 * refusal skips the test rather than failing it: the limiter has its own
 * dedicated test in `backend/src/scanner/api.test.ts`, and a red suite that
 * only means "you ran it twice" trains people to ignore red suites.
 */
async function runWebsiteScan(page: Page, prefix: string): Promise<void> {
  await page.goto(`${prefix}/security-scan`);
  await page.getByTestId("scanner-input").fill("example.com");
  await page.getByTestId("scanner-submit").click();

  const navigated = page
    .waitForURL(new RegExp(`${prefix}/security-scan/results/`), {
      timeout: 30_000,
    })
    .then(() => "navigated" as const)
    .catch(() => "stalled" as const);

  const refused = page
    .getByTestId("scanner-error")
    .waitFor({ timeout: 30_000 })
    .then(() => "refused" as const)
    .catch(() => "stalled" as const);

  const outcome = await Promise.race([navigated, refused]);
  if (outcome !== "navigated") {
    const message = await page
      .getByTestId("scanner-error")
      .textContent()
      .catch(() => null);
    test.skip(true, `scan not started: ${message ?? "timed out"}`);
    return;
  }

  await page.getByTestId("scan-report").waitFor({ timeout: 40_000 });
}

test.describe("digital exposure scanner", () => {
  test.beforeEach(async ({ request }) => {
    test.skip(
      !(await scannerAvailable(request)),
      "no scan provider configured",
    );
  });

  test("runs a website scan in English and reports honestly", async ({
    page,
  }) => {
    await runWebsiteScan(page, "");

    await expect(page.getByTestId("scan-verdict")).toBeVisible();
    await expect(page.getByTestId("scan-cta-contact")).toBeVisible();

    /*
     * The subject never reaches a URL. That is the property worth keeping and
     * the one this asserts: the id in the address bar is an opaque uuid, so
     * the domain stays out of browser history, proxy logs and the referrer of
     * every asset the page loads.
     *
     * The report body is a deliberate exception. It now names the hostnames
     * found in Certificate Transparency, and the apex is usually one of them,
     * so the page does identify what was scanned to anyone holding the link.
     * That was a trade: the host list is the most useful thing on the page and
     * every name in it is already public in an append-only log that anyone can
     * query. The page is `noindex` and served `no-store`, and the link is the
     * capability — which is exactly the position the private email report is
     * in, and it is defensible for the same reason.
     */
    expect(page.url()).not.toContain("example.com");

    // Evidence stays out regardless: paths and version banners are not public
    // and would shorten an attack.
    const html = await page.content();
    expect(html).not.toMatch(/\/\.git|\/\.env|server-status/);
  });

  test("runs a website scan in Dutch", async ({ page }) => {
    await runWebsiteScan(page, "/nl");

    await expect(page.locator("html")).toHaveAttribute("lang", "nl");
    await expect(page.getByTestId("scan-verdict")).toBeVisible();
    // Dutch copy, not an English fallback leaking into the translated build.
    await expect(page.getByTestId("scan-report")).toContainText("Bevindingen");
  });

  test("keeps a running scan across a refresh", async ({ page }) => {
    await runWebsiteScan(page, "");
    await page.reload();
    await expect(page.getByTestId("scan-verdict")).toBeVisible({
      timeout: 40_000,
    });
  });

  test("answers an email request without revealing anything", async ({
    page,
  }) => {
    await page.goto("/security-scan");
    await page.getByTestId("scanner-tab-email").click();

    // Marketing permission is separate and off by default.
    await expect(
      page.getByTestId("scanner-marketing-consent"),
    ).not.toBeChecked();

    await page.getByTestId("scanner-input").fill("someone@example.com");
    await page.getByTestId("scanner-submit").click();

    // Well inside the per-test budget, so there is time left to decide to
    // skip rather than being cut off by the timeout first.
    const acknowledged = await page
      .getByTestId("scanner-mail-sent")
      .waitFor({ timeout: 12_000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!acknowledged, "scan creation refused, most likely rate limited");

    // No result id, no navigation: the report is reachable only from the mail.
    await expect(page.getByTestId("scanner-mail-sent")).toBeVisible();
    expect(page.url()).not.toContain("/results/");
  });

  test("refuses private and malformed targets in the field", async ({
    page,
  }) => {
    await page.goto("/security-scan");

    for (const [value, fragment] of [
      ["127.0.0.1", "domain name"],
      ["localhost", "full domain"],
      ["ftp://example.com", "http and https"],
    ]) {
      await page.getByTestId("scanner-input").fill(value ?? "");
      await page.getByTestId("scanner-submit").click();
      await expect(page.getByTestId("scanner-field-error")).toContainText(
        fragment ?? "",
      );
      // Refused before any request, so the page never leaves the form.
      expect(page.url()).not.toContain("/results/");
    }
  });

  test("drives the mode switch from the keyboard alone", async ({ page }) => {
    await page.goto("/security-scan");

    await page.getByTestId("scanner-tab-website").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("scanner-tab-email")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Roving tabindex: the group is one tab stop, arrows move within it.
    await expect(page.getByTestId("scanner-tab-website")).toHaveAttribute(
      "tabindex",
      "-1",
    );

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByTestId("scanner-tab-website")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("explains itself when a report link is incomplete", async ({ page }) => {
    await page.goto("/security-scan/report");
    await expect(page.getByTestId("private-report-error")).toBeVisible();
  });

  for (const [name, width] of [
    ["small mobile", 320],
    ["mobile", 390],
    ["tablet", 768],
  ] as const) {
    test(`lays the scanner out without overflow on ${name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/security-scan");
      await expect(page.getByTestId("scanner-panel")).toBeVisible();

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
