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

test("keeps the whole mobile menu on one screen", async ({ page }) => {
  /*
   * Listing every sub-item at once made the panel taller than the phone it was
   * meant for, which pushed "Book demo" — the reason the menu exists — below
   * the fold. Groups expand on demand instead, one at a time.
   *
   * Heights are read off the group containers rather than asserted with
   * toBeVisible: a collapsed row is clipped by a zero-height parent, so its
   * children still report a box and read as visible.
   */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByTestId("mobile-menu-toggle").click();

  const height = (id: string) =>
    page.evaluate(
      (target) =>
        Math.round(
          document.getElementById(target)?.getBoundingClientRect().height ?? -1,
        ),
      id,
    );

  await expect.poll(() => height("mobile-group-argus")).toBe(0);

  // The primary action has to be reachable without scrolling the panel.
  const cta = await page.getByTestId("mobile-book-demo").boundingBox();
  expect(cta).not.toBe(null);
  expect((cta?.y ?? 0) + (cta?.height ?? 0)).toBeLessThan(844);

  await page.getByTestId("mobile-nav-argus").click();
  await expect.poll(() => height("mobile-group-argus")).toBeGreaterThan(0);
  await expect(page.getByTestId("mobile-nav-argus")).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  // Opening one group closes the other, so the panel cannot grow past the
  // screen however many times it is prodded.
  await page.getByTestId("mobile-nav-services").click();
  await expect.poll(() => height("mobile-group-argus")).toBe(0);
  await expect.poll(() => height("mobile-group-services")).toBeGreaterThan(0);
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
 * The header at every width class it renders in.
 *
 * The full nav once "fit" from lg by letting items shrink under their own text
 * and paint over the language switcher. It appears at lg again, but with a
 * compact tier — smaller type, tighter gaps and padding — that buys the room
 * honestly. Below that the burger is the only layout the content fits in.
 */
test("keeps the header on one clean line at every width", async ({ page }) => {
  for (const width of [900, 1000, 1024, 1180, 1280, 1536, 1920]) {
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
      const controlsEl = nav.nextElementSibling;
      const controls = controlsEl?.getBoundingClientRect();
      const last = rects.at(-1);
      if (controls && last && last.right > controls.left + 1) overlap = true;

      // A wrapped label doubles the row height of its item. The right-hand
      // controls count too: a two-line "Book demo" is how this last regressed.
      let wrapped = rects.some((rect) => rect.height > 50);
      for (const el of controlsEl ? [...controlsEl.children] : []) {
        if (el.getBoundingClientRect().height > 52) wrapped = true;
      }
      return { full, overlap, wrapped };
    });

    if (state === null) throw new Error(`no header nav at ${String(width)}px`);

    if (width < 1024) {
      // Below lg the burger is the honest layout — the full nav cannot fit.
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

test("keeps the header readable in the compact tier", async ({ page }) => {
  /*
   * Between lg and xl the bar carries the full nav in a smaller size. The two
   * groups must stay visibly apart: at full spacing they touch, which is what
   * made the row read as one undifferentiated run of items.
   */
  for (const width of [1024, 1100, 1180]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto("/");
    await page.getByTestId("mobile-menu-toggle").waitFor({ state: "attached" });

    const gap = await page.evaluate(() => {
      const nav = document.querySelector("header nav[aria-label]");
      const controls = nav?.nextElementSibling;
      if (!(nav instanceof HTMLElement) || !controls) return -1;
      const last = [...nav.children].at(-1)?.getBoundingClientRect();
      if (!last) return -1;
      return Math.round(controls.getBoundingClientRect().left - last.right);
    });

    expect(
      gap,
      `${String(width)}px: nav and controls are touching`,
    ).toBeGreaterThan(12);
  }

  // The language code gives way to the globe here, which is where that room
  // comes from; from xl it returns.
  await page.setViewportSize({ width: 1100, height: 700 });
  await page.goto("/");
  const compact = page
    .getByTestId("language-switcher-trigger")
    .locator("[data-language-label]");
  await expect(compact).toBeHidden();

  await page.setViewportSize({ width: 1280, height: 700 });
  await expect(compact).toBeVisible();
});

test("gives every templated page more than a heading", async ({ page }) => {
  /*
   * Ten routes — every service, every ARGUS feature, the knowledge base —
   * render from one template. It used to emit a heading and a sentence and
   * then stop, so each page hit the footer under half a screen of nothing.
   * What fills them is content that already existed: the section they belong
   * to, their sibling pages with the blurbs the nav dropdowns show, and the
   * closing call the rest of the site ends on.
   */
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const path of [
    "/services/web-app-pentesting",
    "/argus/compliance",
    "/knowledge-base",
  ]) {
    await page.goto(path);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("page-book-demo")).toBeVisible();
    // Every one of these pages ends on the closing section rather than
    // dropping straight into the footer.
    await expect(page.getByTestId("closing-cta")).toBeAttached();

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth - doc.clientWidth;
    });
    expect(overflow, `${path} scrolls sideways`).toBeLessThanOrEqual(1);
  }

  // A page inside a nav group offers its siblings; the knowledge base has none
  // and must not render an empty section for them.
  await page.goto("/argus/compliance");
  await expect(page.getByTestId("page-more")).toBeVisible();
  expect(
    await page.locator('[data-testid^="page-more-"]').count(),
  ).toBeGreaterThan(0);

  await page.goto("/knowledge-base");
  await expect(page.getByTestId("page-more")).toHaveCount(0);
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
