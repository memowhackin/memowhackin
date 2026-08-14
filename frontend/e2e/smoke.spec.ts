import { test, expect, type APIRequestContext } from "@playwright/test";

/**
 * Browser smoke tests for the landing page. The marketing pages are static; the
 * blog reads from the CMS, which every server in front of the site proxies at
 * /api — so these run against real data rather than a mock.
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
  await expect(page.getByTestId("mobile-nav-blog")).toBeVisible();

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

/*
 * Every page shape, not just the home page. The blog index and an article are
 * laid out quite differently — a filter bar, a card grid, the subscribe panel,
 * and a long prose column with a table of contents — so a width that overflows
 * on one of them can pass on another. This only checked "/" for a long time,
 * which left the pages carrying the most layout the least tested.
 */
/*
 * The article's path is resolved from the CMS rather than named here: posts
 * live in the database, so a hardcoded slug goes stale the moment an editor
 * renames one — and this suite would then measure the not-found screen.
 */
const pages = [
  { name: "home", path: "/", rendered: "landing-page" },
  { name: "blog index", path: "/blog", rendered: "blog-index" },
  { name: "article", path: "article", rendered: "blog-post" },
];

async function articlePath(request: APIRequestContext): Promise<string> {
  const response = await request.get("/api/public/posts?locale=en");
  if (!response.ok()) return "";
  const posts = (await response.json()) as { slug: string }[];
  const slug = posts[0]?.slug;
  return slug === undefined ? "" : `/blog/${slug}`;
}

for (const target of pages) {
  for (const viewport of viewports) {
    test(`lays out ${target.name} without sideways overflow on ${viewport.name}`, async ({
      page,
      request,
    }) => {
      let path = target.path;
      if (path === "article") {
        path = await articlePath(request);
        test.skip(path === "", "the CMS published no posts");
        if (path === "") return;
      }

      await page.setViewportSize(viewport);
      await page.goto(path);

      /*
       * Confirm the page actually rendered before measuring it. A renamed slug
       * would land on the not-found screen, which is short and never overflows
       * — so the test would pass while checking nothing at all.
       */
      await expect(page.getByTestId(target.rendered)).toBeAttached();

      // Scroll to the foot so lazily revealed sections are laid out too; an
      // element that only overflows once revealed would otherwise be missed.
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.getByTestId("site-footer").scrollIntoViewIfNeeded();

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return doc.scrollWidth - doc.clientWidth;
      });

      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
}

/*
 * The header at every width class it renders in. The full nav once "fit" from
 * lg by letting items shrink under their own text and paint over the language
 * switcher; it now waits for xl, where everything holds one line with room.
 */
test("keeps the header on one clean line at every width", async ({ page }) => {
  for (const width of [1024, 1180, 1280, 1536, 1920]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/");
    // The probe reads the DOM directly, so wait for React to have rendered.
    await page.getByTestId("mobile-menu-toggle").waitFor({ state: "attached" });

    const state = await page.evaluate(() => {
      const nav = document.querySelector("header nav[aria-label]");
      if (!(nav instanceof HTMLElement)) return null;
      const full = getComputedStyle(nav).display !== "none";
      if (!full) return { full };

      // Top-level items only: the dropdown panels inside are positioned
      // layers and legitimately overlap everything.
      const rects = [...nav.children].map((el) => el.getBoundingClientRect());
      let overlap = false;
      for (let i = 1; i < rects.length; i += 1) {
        const current = rects[i];
        const previous = rects[i - 1];
        if (current && previous && current.left < previous.right - 1) {
          overlap = true;
        }
      }
      const controls = nav.nextElementSibling?.getBoundingClientRect();
      const last = rects.at(-1);
      if (controls && last && last.right > controls.left + 1) overlap = true;

      // A wrapped label doubles the row height of its item.
      const wrapped = rects.some((rect) => rect.height > 50);
      return { full, overlap, wrapped };
    });

    if (state === null) throw new Error(`no header nav at ${String(width)}px`);

    if (width < 1280) {
      // Below xl the burger is the honest layout — the full nav cannot fit.
      expect(state.full, `${String(width)}px should use the burger`).toBe(
        false,
      );
      await expect(page.getByTestId("mobile-menu-toggle")).toBeVisible();
    } else {
      expect(state.full, `${String(width)}px should show the full nav`).toBe(
        true,
      );
      expect(state.overlap, `${String(width)}px: items overlap`).toBe(false);
      expect(state.wrapped, `${String(width)}px: a label wrapped`).toBe(false);
    }
  }
});

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
  await page.getByTestId("blog-highlights").scrollIntoViewIfNeeded();
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
