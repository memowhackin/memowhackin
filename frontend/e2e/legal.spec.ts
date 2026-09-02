import { test, expect } from "@playwright/test";

/*
 * The legal pages: reachable from the footer, complete in both languages, and
 * navigable from their own contents rail. The texts are structured content
 * (see src/content/legal), so what is checked here is the rendering — that
 * every anchor the rail offers exists, that the open-items list agrees with
 * the markers in the text, and that nothing scrolls sideways.
 */

const pages = [
  { path: "/privacy-policy", kind: "privacyPolicy", lang: "en" },
  { path: "/terms-of-service", kind: "termsOfService", lang: "en" },
  { path: "/nl/privacy-policy", kind: "privacyPolicy", lang: "nl" },
  { path: "/nl/terms-of-service", kind: "termsOfService", lang: "nl" },
];

for (const target of pages) {
  test(`renders ${target.path} with a working contents rail`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(target.path);

    await expect(page.getByTestId(`legal-${target.kind}`)).toBeAttached();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", target.lang);

    // Every entry in the rail must land on a heading in the text.
    const rail = page.getByTestId("legal-toc");
    const links = rail.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(8);
    for (let i = 0; i < count; i += 1) {
      const href = await links.nth(i).getAttribute("href");
      expect(href).toMatch(/^#[a-z][a-z0-9-]*$/);
      await expect(page.locator(href ?? "")).toHaveCount(1);
    }

    // The open-items box lists each marked gap exactly once, and every entry
    // in it lands on a marker in the text.
    const markers = await page.getByTestId("legal-gap").all();
    const gaps = new Set(
      await Promise.all(
        markers.map((marker) => marker.getAttribute("data-gap")),
      ),
    );
    const listed = page.getByTestId("legal-open-items").locator("ol li a");
    await expect(listed).toHaveCount(gaps.size);
    for (let i = 0; i < gaps.size; i += 1) {
      const href = await listed.nth(i).getAttribute("href");
      await expect(page.locator(href ?? "")).toHaveCount(1);
    }
  });

  test(`lays out ${target.path} without sideways overflow on a phone`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(target.path);
    await expect(page.getByTestId(`legal-${target.kind}`)).toBeAttached();

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("links the footer to the legal pages", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("footer-privacy").click();
  await expect(page).toHaveURL(/\/privacy-policy$/);
  await expect(page.getByTestId("legal-privacyPolicy")).toBeAttached();

  await page.getByTestId("footer-terms").click();
  await expect(page).toHaveURL(/\/terms-of-service$/);
  await expect(page.getByTestId("legal-termsOfService")).toBeAttached();

  // Each document points at the other.
  await page.getByTestId("legal-related-privacyPolicy").click();
  await expect(page).toHaveURL(/\/privacy-policy$/);
});
