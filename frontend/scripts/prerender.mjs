import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localeOutDir,
  localePrefix,
} from "./locales.mjs";

/*
 * Turns the built SPA into real HTML, one file per route.
 *
 * The site is client-rendered, so without this a crawler receives an empty
 * <div id="root"> and none of the SEO surface that src/localization/useSeo.ts
 * writes at runtime — title, description, canonical, Open Graph, JSON-LD. This
 * step loads each route in a real browser and saves what it produced, so the
 * markup a crawler sees is exactly the markup a person sees.
 *
 * Runs after `vite build`, against the built output. It never modifies src/.
 */

const DIST = path.resolve("dist");
const ROUTES_DIR = path.resolve("src/routes");
/*
 * `||`, not `??`, deliberately: in the browser bundle an empty VITE_CMS_API_URL
 * means "same origin", but a node script has no origin — the Docker image build
 * exports exactly that empty string, and passing it through would make every
 * fetch target the unparseable URL "/api/...". Empty here means "not told",
 * which falls back to the dev backend's address.
 */
const API_BASE = (
  process.env.VITE_CMS_API_URL || "http://localhost:8001"
).replace(/\/+$/, "");
const SITE_URL = "https://assistsec.nl";

/*
 * Routes that must never be prerendered or indexed. The admin screens are
 * behind a login and an indexed admin URL is free reconnaissance.
 *
 * The private scan report is here for a different reason: it renders personal
 * exposure data unlocked by a single-use link, so a prerendered snapshot of it
 * in `dist/` — or a sitemap entry pointing at it — would be exactly the wrong
 * artefact to publish. The scanner's own landing page is not excluded and is
 * prerendered normally; only the report is.
 *
 * The result page needs no entry: it is a dynamic route (`$scanId`), and
 * dynamic routes are skipped unless explicitly expanded, as the blog's are.
 */
const EXCLUDED_PREFIXES = ["/studio-b78262a861", "/security-scan/report"];

/*
 * Addresses retired when the ARGUS section was rebuilt (September 2026), and
 * where each one went. Emitted as 301 rules in `_redirects` so a static host
 * moves a crawler's record across instead of serving the old address as gone;
 * `nginx.conf` carries the same list for the deployment that does not read
 * `_redirects`. Change one, change both.
 */
const RETIRED_ROUTES = [
  ["/argus/continuous-scanning", "/argus/monthly-security-scans"],
  ["/argus/insights", "/argus/live-pentest-workspace"],
  ["/argus/expert-chat", "/argus/collaborative-retesting"],
  ["/argus/retesting", "/argus/collaborative-retesting"],
  /*
   * The old compliance page pointed at the monthly scans while there was no
   * compliance page to send it to. There is one now, so the address goes where
   * a crawler holding it expected to land all along.
   */
  ["/argus/compliance", "/argus/continuous-compliance"],
  ["/argus/integrations", "/argus/continuous-compliance"],
];

/*
 * Matched by prefix, not by exact path.
 *
 * This was a set of exact routes, so every page added under the admin path had
 * to be remembered here as well — and one was not: `/studio-b78262a861/leads`
 * shipped into the prerendered output and the sitemap, advertising an admin
 * screen to search engines. A prefix cannot be forgotten the next time a page
 * is added to that directory.
 */
function isExcluded(route) {
  return EXCLUDED_PREFIXES.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`),
  );
}

/*
 * An unrendered root, exactly: `<div id="root"></div>`.
 *
 * Matching "has any content" with /<div id="root">\s*\S/ does not work — the
 * `\S` happily matches the `<` of the closing tag, so an empty root reads as
 * full. That made the "did this render?" guard silently useless.
 */
const EMPTY_ROOT = /<div id="root">\s*<\/div>/;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};

/**
 * Derive the route list from the files on disk rather than hardcoding it, so a
 * new page cannot be silently left out of the prerender.
 */
async function staticRoutes(dir = ROUTES_DIR, prefix = "") {
  const routes = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(
        ...(await staticRoutes(
          path.join(dir, entry.name),
          `${prefix}/${entry.name}`,
        )),
      );
      continue;
    }
    if (!entry.name.endsWith(".tsx")) continue;
    if (entry.name.startsWith("__")) continue;
    // Dynamic segments are expanded from content, not from the filename.
    if (entry.name.startsWith("$")) continue;

    const base = entry.name.replace(/\.tsx$/, "");
    const route = base === "index" ? prefix || "/" : `${prefix}/${base}`;
    if (!isExcluded(route)) routes.push(route);
  }
  return routes.sort();
}

/*
 * One language's posts. Falls back to the default language when a language has
 * none of its own, matching what the app does at read time — so the routes
 * prerendered are exactly the routes that exist.
 */
/*
 * Which articles exist, asked of the CMS — the same source the pages themselves
 * read at runtime.
 *
 * This used to enumerate JSON files committed in the repo, which meant the
 * prerenderer could disagree with the site about what was published. There is
 * one source of truth now.
 */
async function blogRoutes(locale) {
  /*
   * A missing CMS degrades rather than fails the build.
   *
   * Image builds are the case that matters: `docker compose build` runs before
   * any service starts, so the CMS cannot be up. The marketing pages — which
   * need no data — still prerender; the blog falls back to rendering in the
   * browser, which works for readers but is invisible to crawlers. That is
   * worth a loud warning, not a broken build.
   */
  let response;
  try {
    response = await fetch(`${API_BASE}/api/public/posts?locale=${locale}`, {
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    console.warn(
      `prerender: CMS unreachable at ${API_BASE} — articles will NOT be ` +
        "prerendered and will not be visible to crawlers",
    );
    return { routes: [], posts: [] };
  }

  if (!response.ok) {
    console.warn(
      `prerender: CMS returned ${String(response.status)} for ${locale} — ` +
        "articles will NOT be prerendered",
    );
    return { routes: [], posts: [] };
  }

  let posts = await response.json();
  if (!Array.isArray(posts)) throw new Error("CMS did not return a list");

  // Matches the app: a language with nothing written yet shows the default
  // language's articles, so the routes rendered are the routes that exist.
  if (posts.length === 0 && locale !== DEFAULT_LOCALE) {
    return blogRoutes(DEFAULT_LOCALE);
  }

  posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return { routes: posts.map((post) => `/blog/${post.slug}`), posts };
}

/*
 * Static server for the snapshot pass.
 *
 * Assets come off disk; every other path gets the untouched SPA shell, which
 * the client router then renders into the requested route — that is the whole
 * mechanism. The shell is read once, up front, and held in memory: serving it
 * from disk would mean that once a route has been written, a later request for
 * it returns already-prerendered HTML and React renders on top of its own
 * output.
 */

/*
 * Proxy /api to the CMS, exactly as nginx does in production.
 *
 * Without this the page is served from 127.0.0.1:<port> while the app fetches
 * the CMS on another port, which is cross-origin — the browser blocks the
 * response and every article renders as the error component. Proxying makes the
 * request same-origin here too, so what is prerendered matches what a visitor
 * gets and no CORS entry is needed for a throwaway port.
 */
async function proxyApi(req, res) {
  const target = `${API_BASE}${req.url ?? ""}`;
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { accept: req.headers.accept ?? "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    res.statusCode = upstream.status;
    res.setHeader(
      "content-type",
      upstream.headers.get("content-type") ?? "application/json",
    );
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.statusCode = 502;
    res.end('{"error":"cms_unreachable"}');
  }
}

function serve(shells) {
  const server = createServer((req, res) => {
    const url = decodeURIComponent((req.url ?? "/").split("?")[0]);

    if (url.startsWith("/api/")) {
      void proxyApi(req, res);
      return;
    }

    const onDisk = path.join(DIST, url);
    const extension = path.extname(url);

    if (
      extension !== "" &&
      extension !== ".html" &&
      onDisk.startsWith(DIST) &&
      existsSync(onDisk)
    ) {
      res.setHeader(
        "content-type",
        MIME[extension] ?? "application/octet-stream",
      );
      createReadStream(onDisk).pipe(res);
      return;
    }

    /*
     * Hand back the shell belonging to the language this path is under. Each
     * locale's bundle has its own asset URLs and its own base, so serving the
     * default shell for /nl/... would load the English build at a Dutch URL.
     */
    const locale =
      LOCALES.find(
        (candidate) =>
          localePrefix(candidate) !== "" &&
          (url === localePrefix(candidate) ||
            url.startsWith(`${localePrefix(candidate)}/`)),
      ) ?? DEFAULT_LOCALE;

    res.setHeader("content-type", MIME[".html"]);
    res.end(shells.get(locale));
  });

  /*
   * Port 0 asks the OS for a free one. A fixed port meant a leftover server
   * from an earlier run made `listen` fail — and because nothing handled the
   * error event, the promise never settled and the build hung indefinitely
   * instead of failing. Errors now reject.
   */
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, () => {
      const address = server.address();
      if (address === null || typeof address === "string") {
        reject(new Error("could not determine the server port"));
        return;
      }
      resolve({ server, port: address.port });
    });
  });
}

/**
 * Sections fade in as they scroll into view, so a snapshot taken on load would
 * bake `opacity: 0` into the markup. Scroll the whole page to trigger every
 * observer, wait for them all to settle, then return to the top so the header
 * is captured in its resting state.
 */
async function settle(page) {
  await page.evaluate(async () => {
    /*
     * Bounded on purpose. The exit condition used to re-read scrollHeight every
     * iteration, so a page whose content kept growing as it revealed never
     * terminated — the build hung with no output rather than failing. 200 steps
     * is far past the longest page here.
     */
    const step = window.innerHeight;
    const maxSteps = 200;

    for (let i = 0; i < maxSteps; i += 1) {
      const y = i * step;
      if (y > document.body.scrollHeight) break;
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, document.body.scrollHeight);
  });

  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll("[data-testid]")].every(
          (element) =>
            getComputedStyle(element).opacity === "1" ||
            element.getBoundingClientRect().height === 0,
        ),
      undefined,
      { timeout: 15_000 },
    )
    .catch(() => {
      // A section that never reveals is a layout bug, not a reason to ship no
      // HTML at all — take the snapshot and let the assertions catch it.
      console.warn("prerender: some sections never reached full opacity");
    });

  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
}

/*
 * Entries carry lastmod only when something real is known — the article's
 * publish date. A fabricated lastmod on every marketing page teaches crawlers
 * to ignore the field.
 */
function sitemap(entries) {
  const urls = entries
    .map(({ path: urlPath, lastmod }) => {
      const loc = `${SITE_URL}${urlPath === "/" ? "" : urlPath}`;
      const tail = lastmod === undefined ? "" : `<lastmod>${lastmod}</lastmod>`;
      return `  <url><loc>${loc}</loc>${tail}</url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rss(posts, locale, prefix = "") {
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}${prefix}/blog/${post.slug}</link>
      <guid>${SITE_URL}${prefix}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AssistSec blog</title>
    <link>${SITE_URL}${prefix}/blog</link>
    <atom:link href="${SITE_URL}${prefix}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    <language>${locale}</language>
    <description>Research, advisories and news from AssistSec.</description>
${items}
  </channel>
</rss>
`;
}

async function main() {
  if (!existsSync(path.join(DIST, "index.html"))) {
    throw new Error("dist/index.html not found — run `npm run build` first");
  }

  const statics = await staticRoutes();

  /*
   * Every locale's shell, captured before anything is written, so each route
   * renders from a pristine bundle no matter what order they are visited in.
   */
  const shells = new Map();
  for (const locale of LOCALES) {
    const shellPath = path.join(localeOutDir(locale), "index.html");
    if (!existsSync(shellPath)) {
      throw new Error(
        `${shellPath} not found — run \`npm run build\` to build every locale`,
      );
    }
    const shell = await readFile(shellPath, "utf8");

    /*
     * The shell must be the freshly built one, with an empty root. Running this
     * against its own previous output would render each page on top of an
     * already-rendered page — duplicated markup, and a reveal pass that never
     * settles. Rebuild rather than guess which state dist/ is in.
     */
    if (!EMPTY_ROOT.test(shell)) {
      throw new Error(
        `${shellPath} is already prerendered — run \`npm run build\` first`,
      );
    }

    shells.set(locale, shell);
  }

  const { server, port } = await serve(shells);
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  let written = 0;
  const failures = [];
  const sitemapUrls = [];
  /*
   * Retired addresses, as real redirect rules. The app already sends a reader
   * from an old URL to the current one, but that costs a page load and only
   * works with JavaScript; a 301 from the host is what a crawler needs to move
   * its record across rather than treat the old address as gone. Aliases never
   * enter the sitemap — only the address a post lives at now.
   */
  const aliasRules = [];

  let feedPosts = 0;

  for (const locale of LOCALES) {
    const prefix = localePrefix(locale);
    const outDir = localeOutDir(locale);

    // Slugs can differ per language, so each language's routes are resolved
    // from its own content rather than assumed to mirror the default's.
    const blog = await blogRoutes(locale);

    for (const post of blog.posts) {
      for (const alias of post.aliases ?? []) {
        aliasRules.push(
          `${prefix}/blog/${alias}    ${prefix}/blog/${post.slug}    301`,
        );
      }
    }
    const routes = [...statics, ...blog.routes];
    feedPosts = blog.posts.length;

    // Publish dates, so the sitemap can say when an article last changed.
    const lastmodByRoute = new Map(
      blog.posts.map((post) => [`/blog/${post.slug}`, String(post.date)]),
    );

    for (const route of routes) {
      const url = route === "/" ? prefix || "/" : `${prefix}${route}`;

      const response = await page.goto(`http://127.0.0.1:${port}${url}`, {
        waitUntil: "networkidle",
      });

      if (response === null || !response.ok()) {
        failures.push(
          `${url}: server returned ${response?.status() ?? "no response"}`,
        );
        continue;
      }

      await settle(page);

      /*
       * The router injects <link rel="modulepreload"> with fully resolved URLs,
       * so serialising the DOM bakes in this server's throwaway port. Served
       * later from anywhere else those point at a dead address, every lazy
       * chunk fails, and the page renders its error boundary instead of the
       * article. Put them back to root-relative.
       */
      const html = (await page.content()).replaceAll(
        `http://127.0.0.1:${String(port)}`,
        "",
      );

      // An empty root means the bundle did not mount; writing it would replace
      // a working SPA page with a blank one.
      if (EMPTY_ROOT.test(html)) {
        failures.push(`${url}: rendered an empty #root`);
        continue;
      }

      // A locale's pages must not be written with another locale's bundle —
      // that would serve English assets from a Dutch URL.
      if (prefix !== "" && !html.includes(`${prefix}/assets/`)) {
        failures.push(`${url}: rendered with the wrong locale's bundle`);
        continue;
      }

      const target =
        route === "/"
          ? path.join(outDir, "index.html")
          : path.join(outDir, route, "index.html");
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, html);
      written += 1;
      sitemapUrls.push({ path: url, lastmod: lastmodByRoute.get(route) });
    }

    // One feed per language, alongside that language's blog index.
    await mkdir(path.join(outDir, "blog"), { recursive: true });
    await writeFile(
      path.join(outDir, "blog", "rss.xml"),
      rss(blog.posts, locale, prefix),
    );
  }

  await browser.close();
  server.close();

  if (failures.length > 0) {
    throw new Error(`prerender failed:\n  ${failures.join("\n  ")}`);
  }

  // One sitemap at the site root covering every language, which is what a
  // crawler expects — not one per locale that nothing links to.
  await writeFile(path.join(DIST, "sitemap.xml"), sitemap(sitemapUrls));

  /*
   * SPA fallback rules for static hosts, generated rather than hand-written:
   * each language must fall back to its OWN shell, or a deep link like
   * /nl/about reloads into the English bundle. Order matters — the prefixed
   * rules have to come before the catch-all.
   */
  const redirects = [
    "# Generated by scripts/prerender.mjs — do not edit.",
    "# Renamed posts: the address a link was shared under still resolves.",
    ...aliasRules,
    "",
    "# Retired ARGUS pages: moved for good, in every language.",
    ...LOCALES.flatMap((locale) =>
      RETIRED_ROUTES.map(
        ([from, to]) =>
          `${localePrefix(locale)}${from}    ${localePrefix(locale)}${to}    301`,
      ),
    ),
    "",
    "# Each language falls back to its own shell; the catch-all is last.",
    ...LOCALES.filter((locale) => localePrefix(locale) !== "").map(
      (locale) =>
        `${localePrefix(locale)}/*    ${localePrefix(locale)}/index.html   200`,
    ),
    "/*    /index.html   200",
    "",
  ].join("\n");
  await writeFile(path.join(DIST, "_redirects"), redirects);

  console.log(
    `prerender: ${String(written)} pages across ${String(LOCALES.length)} locales (${LOCALES.join(", ")}), ${String(feedPosts)} posts in the latest feed`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
