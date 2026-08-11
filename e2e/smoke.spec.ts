import { test, expect } from "@playwright/test";

/**
 * Browser smoke tests for the landing page. The site is static marketing copy,
 * so there is no API to mock — the only external surface is the scanner app,
 * which we assert on by URL rather than by navigating to it.
 */

test("renders every landing section", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("landing-page")).toBeVisible();
  // The hyphen in "AI‑assisted" is U+2011 (see Hero.test.tsx), so match either
  // hyphen rather than pinning the assertion to one codepoint.
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /AI[-‑]assisted pentesting/,
  );

  for (const section of [
    "hero",
    "platform-showcase",
    "autonomous-agents",
    "services",
    "why-assistsec",
    "benefits",
    "blog-highlights",
    "closing-cta",
    "site-footer",
  ]) {
    await expect(page.getByTestId(section)).toBeAttached();
  }
});

test("points login and demo at the scanner app", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("header-login")).toHaveAttribute(
    "href",
    "https://scanner.assistsec.nl/login",
  );
  await expect(page.getByTestId("header-book-demo")).toHaveAttribute(
    "href",
    "https://scanner.assistsec.nl/demo",
  );
});

test("switches language to Dutch", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("language-switcher-trigger").click();
  await page.getByTestId("language-switcher-nl").click();

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Cyberveiligheid",
  );
  await expect(page.getByTestId("header-login")).toHaveText("Inloggen");

  await page.getByTestId("language-switcher-trigger").click();
  await expect(page.getByTestId("language-switcher-nl")).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("opens the mobile menu on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await page.goto("/");

  await expect(page.getByTestId("mobile-menu")).toBeHidden();
  await page.getByTestId("mobile-menu-toggle").click();
  await expect(page.getByTestId("mobile-menu")).toBeVisible();
  await expect(page.getByTestId("mobile-nav-services")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByTestId("mobile-menu")).toBeHidden();
});

/*
 * The page is one long document with no horizontal scroller anywhere in it, so
 * a sideways overflow at any width is a layout bug rather than a design choice.
 * The narrowest case also has to keep the menu button reachable: it is the only
 * way to the navigation once the bar collapses.
 */
const viewports = [
  { name: "small mobile", width: 320, height: 640 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "desktop", width: 1920, height: 1080 },
  { name: "large desktop", width: 2560, height: 1200 },
];

for (const viewport of viewports) {
  test(`lays out without sideways overflow on ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByTestId("site-footer").scrollIntoViewIfNeeded();

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });

    expect(overflow).toBeLessThanOrEqual(1);
  });
}

/*
 * Sections fade in as they scroll into view, which means every one of them
 * starts invisible. Skipping past a section must never leave it that way: the
 * reader can jump straight to an anchor and then scroll back up over content
 * that was never once on screen.
 */
test("reveals content that was skipped past rather than scrolled to", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("nav-blog").click();
  await page.getByTestId("hero").scrollIntoViewIfNeeded();

  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll("[data-testid]")]
            .filter(
              (el) =>
                getComputedStyle(el).opacity !== "1" &&
                el.getBoundingClientRect().height > 0,
            )
            .map((el) => el.getAttribute("data-testid")),
        ),
      { timeout: 10_000 },
    )
    .toEqual([]);
});

test("keeps the menu button on screen at the narrowest width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/");

  const toggle = page.getByTestId("mobile-menu-toggle");
  const box = await toggle.boundingBox();

  expect(box).not.toBeNull();
  expect(box?.x ?? 0).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);

  await toggle.click();
  await expect(page.getByTestId("mobile-book-demo")).toBeVisible();
});
