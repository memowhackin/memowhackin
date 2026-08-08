import { test, expect } from "@playwright/test";

/**
 * Browser smoke tests for the landing page. The site is static marketing copy,
 * so there is no API to mock — the only external surface is the scanner app,
 * which we assert on by URL rather than by navigating to it.
 */

test("renders every landing section", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("landing-page")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "AI-assisted pentesting",
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

  await page.getByTestId("language-switcher").selectOption("nl");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Cyberveiligheid",
  );
  await expect(page.getByTestId("header-login")).toHaveText("Inloggen");
});

test("opens the mobile menu on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await page.goto("/");

  await expect(page.getByTestId("mobile-menu")).toBeHidden();
  await page.getByTestId("mobile-menu-toggle").click();
  await expect(page.getByTestId("mobile-menu")).toBeVisible();
  await expect(page.getByTestId("mobile-nav-services")).toBeVisible();
});
