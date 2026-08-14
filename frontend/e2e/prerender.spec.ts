import { existsSync } from "node:fs";
import path from "node:path";
import { test, expect, type APIRequestContext } from "@playwright/test";

/*
 * What a crawler that does not run JavaScript actually receives.
 *
 * The site is client-rendered, so without the prerender step every one of these
 * assertions fails against an empty <div id="root"> — which is precisely the
 * state the blog shipped in before. These run under the `no-javascript`
 * project, and only against a built and prerendered dist/.
 */

const PRERENDERED = process.env.CI !== undefined;

/*
 * The article under test comes from the CMS — the same source the pages read.
 *
 * It used to be named here, then read from JSON committed in the repo. Both
 * tied this suite to something other than prerendering, so an editorial rename
 * turned it red while prerendering was working perfectly.
 *
 * When the CMS has no posts the blog assertions are skipped rather than failed:
 * there is then nothing for prerendering to have produced, and the marketing
 * pages — which need no data — are still covered.
 */
interface Article {
  slug: string;
  title: string;
  /** A distinctive run of the article's own prose. */
  bodyText: string;
}

async function firstArticle(
  request: APIRequestContext,
): Promise<Article | undefined> {
  const response = await request.get("/api/public/posts?locale=en");
  if (!response.ok()) return undefined;

  const posts = (await response.json()) as {
    slug: string;
    title: string;
    body: string;
  }[];
  const post = posts[0];
  if (post === undefined) return undefined;

  const text = post.body
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  return {
    slug: post.slug,
    title: post.title,
    bodyText: text.split(" ").slice(0, 6).join(" "),
  };
}

/** Titles contain "?" and other regex metacharacters. */
function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test.skip(
  !PRERENDERED,
  "needs a prerendered build; CI serves dist/ via scripts/serve-dist.mjs",
);

test("serves the article text without JavaScript", async ({
  page,
  request,
}) => {
  const article = await firstArticle(request);
  test.skip(article === undefined, "the CMS published no posts for this build");
  if (article === undefined) return;

  await page.goto(`/blog/${article.slug}`);

  await expect(
    page.getByRole("heading", { level: 1, name: article.title }),
  ).toBeVisible();
  // Scoped to the article body: the same sentence also appears in the excerpt
  // in the header, and an unscoped match is ambiguous.
  await expect(
    page.getByTestId("blog-post-body").getByText(article.bodyText),
  ).toBeVisible();
});

test("serves the marketing pages without JavaScript", async ({ page }) => {
  for (const path of ["/", "/about", "/services/web-app-pentesting", "/blog"]) {
    await page.goto(path);
    await expect(page.locator("#root")).not.toBeEmpty();
    await expect(page.locator("h1").first()).toBeVisible();
  }
});

test("carries the SEO tags into the markup", async ({ page, request }) => {
  const article = await firstArticle(request);
  test.skip(article === undefined, "the CMS published no posts for this build");
  if (article === undefined) return;

  await page.goto(`/blog/${article.slug}`);

  await expect(page).toHaveTitle(new RegExp(escapeRegExp(article.title)));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://assistsec.nl/blog/${article.slug}`,
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /\S/,
  );
  // An unfurl without an image renders as a bare grey link in every chat and
  // feed; the card must be an absolute URL or scrapers ignore it.
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^https:\/\/assistsec\.nl\/.+/,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article",
  );
  // Written at runtime by useSeo, so its presence proves the snapshot captured
  // the page after the app had rendered rather than the empty shell.
  await expect(page.locator("script#route-jsonld")).toHaveCount(1);
  // The article's machine description: engines cite BlogPosting, not WebPage.
  const jsonld = await page.locator("script#route-jsonld").textContent();
  expect(jsonld).toContain('"BlogPosting"');
  expect(jsonld).toContain('"datePublished"');
  expect(jsonld).toContain('"BreadcrumbList"');
});

test("names the organization once, on every page", async ({ page }) => {
  for (const route of ["/", "/nl/about"]) {
    await page.goto(route);
    const scripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const organizations = scripts.filter((text) =>
      text.includes('"Organization"'),
    );
    // The static entity from index.html, plus whatever the route wrote — but
    // exactly one @id-bearing Organization block.
    expect(
      scripts.filter((text) => text.includes("#organization")).length,
      `${route} should carry the organization entity once`,
    ).toBe(1);
    expect(organizations.length).toBeGreaterThan(0);
  }
});

test("lists every published article in the sitemap and the feed", async ({
  request,
}) => {
  const article = await firstArticle(request);
  test.skip(article === undefined, "the CMS published no posts for this build");
  if (article === undefined) return;

  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain(
    `https://assistsec.nl/blog/${article.slug}`,
  );

  const feed = await request.get("/blog/rss.xml");
  expect(await feed.text()).toContain(article.title);
});

test("keeps the admin screens out of the prerendered output", () => {
  /*
   * Asserted on disk rather than over HTTP, deliberately.
   *
   * A request for /studio-b78262a861 still succeeds — the static host falls back to
   * index.html so the route works in a browser — but that fallback now serves
   * the prerendered *home page*, so an HTTP check cannot distinguish "not
   * prerendered" from "prerendered something else". What must be true is that
   * no admin HTML was ever written for a crawler to find.
   */
  for (const route of [
    "studio-b78262a861",
    "studio-b78262a861/login",
    "nl/studio-b78262a861",
    "nl/studio-b78262a861/login",
  ]) {
    expect(
      existsSync(path.join("dist", route, "index.html")),
      `${route} must not be prerendered`,
    ).toBe(false);
  }
});

test("serves each language at its own URL, in that language", async ({
  page,
}) => {
  await page.goto("/about");
  const english = await page.locator("h1").first().textContent();

  await page.goto("/nl/about");
  const dutch = await page.locator("h1").first().textContent();

  expect(english).not.toBe(null);
  // The whole point of the exercise: two URLs, two languages, both prerendered.
  // Identical text would mean the Dutch build shipped the English bundle.
  expect(dutch).not.toBe(english);
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
});

test("declares hreflang alternates and a per-language canonical", async ({
  page,
}) => {
  await page.goto("/nl/about");

  // Without these, the two languages look like duplicate content and one gets
  // dropped from the index.
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    "href",
    "https://assistsec.nl/about",
  );
  await expect(page.locator('link[hreflang="nl"]')).toHaveAttribute(
    "href",
    "https://assistsec.nl/nl/about",
  );
  await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
    "href",
    "https://assistsec.nl/about",
  );
  // Canonical points at itself, not at the English page.
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://assistsec.nl/nl/about",
  );
});

test("publishes a sitemap and a feed", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  // Every language belongs in the one sitemap, or the translations are
  // effectively invisible.
  expect(sitemapBody).toContain("https://assistsec.nl/nl/about");
  expect(sitemapBody).not.toContain("/studio-b78262a861");

  const feed = await request.get("/blog/rss.xml");
  expect(feed.status()).toBe(200);
  expect(feed.headers()["content-type"]).toContain("xml");
  const feedBody = await feed.text();
  expect(feedBody).toContain("<language>en</language>");
  expect(feedBody).toContain('rel="self"');

  // The GEO surface: a plain-text map of the site for answer engines.
  const llms = await request.get("/llms.txt");
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toContain("# AssistSec");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  /*
   * robots.txt must NOT name the admin path. It is a public file and the first
   * thing a scanner reads, so a Disallow line there advertises the very thing
   * it looks like it is protecting. The admin screens are kept out of the index
   * by not being prerendered, not being linked, not being in the sitemap, and
   * sending noindex at runtime.
   */
  const robotsBody = await robots.text();
  expect(robotsBody).not.toContain("studio-");
  expect(robotsBody).toContain("Sitemap:");
});
