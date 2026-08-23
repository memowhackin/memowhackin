import { describe, expect, it } from "vitest";
import type { FetchedResponse } from "../net/fetch.js";
import { extractImages, thirdPartyOrigins } from "./images.js";
import { parseRobots } from "./paths.js";
import { detectWaf, hasFirewall } from "./waf.js";

/*
 * The pure halves of the three discovery checks.
 *
 * Everything here is parsing hostile third-party text — headers, a robots.txt,
 * and a homepage — so the cases that matter are the malformed and the
 * malicious ones, not the well-formed ones.
 */

function response(
  headers: Record<string, string | string[]>,
  body = "",
): FetchedResponse {
  return {
    status: 200,
    headers,
    body,
    finalUrl: "https://example.com/",
    chain: ["https://example.com/"],
    secure: true,
  };
}

describe("detectWaf", () => {
  it("identifies a vendor from a header only it emits", () => {
    const found = detectWaf(response({ "cf-ray": "8a1b2c3d4e5f-AMS" }));

    expect(found).toEqual([
      {
        id: "cloudflare",
        name: "Cloudflare",
        kind: "waf",
        confidence: "confirmed",
      },
    ]);
    expect(hasFirewall(found)).toBe(true);
  });

  it("identifies a vendor from its cookie", () => {
    const found = detectWaf(
      response({
        "set-cookie": ["visid_incap_1234=abc; path=/", "other=1"],
      }),
    );

    expect(found.map((entry) => entry.id)).toEqual(["imperva"]);
  });

  it("reports every edge in the chain rather than picking one", () => {
    // Cloudflare in front of an origin behind CloudFront is an ordinary
    // arrangement, not a contradiction to resolve.
    const found = detectWaf(response({ "cf-ray": "x", "x-amz-cf-id": "y" }));

    expect(found.map((entry) => entry.id).sort()).toEqual([
      "cloudflare",
      "cloudfront",
    ]);
  });

  it("drops a guess once something certain is present", () => {
    const found = detectWaf(response({ "cf-ray": "x", via: "1.1 google" }));

    expect(found.map((entry) => entry.id)).toEqual(["cloudflare"]);
  });

  it("keeps a guess when it is all there is", () => {
    const found = detectWaf(response({ via: "1.1 google" }));

    expect(found).toEqual([
      {
        id: "google_cloud",
        name: "Google Cloud",
        kind: "cdn",
        confidence: "possible",
      },
    ]);
  });

  it("separates a plain CDN from a firewall", () => {
    // Telling someone a CDN is a WAF is telling them they have a control they
    // have not bought.
    expect(hasFirewall(detectWaf(response({ "x-vercel-id": "abc" })))).toBe(
      false,
    );
  });

  it("finds nothing in an unremarkable response", () => {
    expect(detectWaf(response({ server: "nginx" }))).toEqual([]);
  });
});

describe("parseRobots", () => {
  it("reads the disallowed paths, deduplicated and sorted", () => {
    const paths = parseRobots(
      [
        "User-agent: *",
        "Disallow: /admin/",
        "disallow:/private/",
        "Disallow: /admin/",
        "Allow: /public/",
        "Sitemap: https://example.com/sitemap.xml",
      ].join("\n"),
    );

    expect(paths).toEqual(["/admin/", "/private/"]);
  });

  it("drops a bare slash, which is about the site rather than a directory", () => {
    expect(parseRobots("Disallow: /")).toEqual([]);
  });

  it("drops anything that could be markup", () => {
    // This text is served straight into a customer's browser. Stripping it
    // here means no later render has to be the thing that gets it right.
    expect(parseRobots("Disallow: /<img src=x onerror=alert(1)>")).toEqual([]);
    expect(parseRobots("Disallow: /a'b")).toEqual([]);
  });

  it("ignores relative entries and empty values", () => {
    expect(parseRobots("Disallow:\nDisallow: admin\nDisallow: /ok")).toEqual([
      "/ok",
    ]);
  });

  it("survives a file that is not a robots.txt at all", () => {
    expect(parseRobots("<html><body>404</body></html>")).toEqual([]);
    expect(parseRobots("")).toEqual([]);
  });
});

describe("extractImages", () => {
  const page = `
    <html><head>
      <link rel="icon" href="/favicon.ico">
      <link rel="apple-touch-icon" href="https://cdn.example.net/touch.png">
      <meta property="og:image" content="//img.example.org/card.jpg">
      <link rel="stylesheet" href="/app.css">
    </head><body>
      <img src="/img/logo.svg" alt="Example logo">
      <img srcset="/img/hero-2x.jpg 2x, /img/hero.jpg 1x" alt="Hero">
      <div style="background-image: url('/img/bg.png')"></div>
      <img src="javascript:alert(1)" alt="bad">
      <img src="data:image/png;base64,AAAA" alt="inline">
    </body></html>`;

  it("resolves every reference against the page it was found on", () => {
    const urls = extractImages(page, "https://example.com/").map((i) => i.url);

    expect(urls).toContain("https://example.com/favicon.ico");
    expect(urls).toContain("https://cdn.example.net/touch.png");
    // A protocol-relative URL inherits the page's scheme.
    expect(urls).toContain("https://img.example.org/card.jpg");
    expect(urls).toContain("https://example.com/img/bg.png");
  });

  it("refuses any scheme that is not http", () => {
    /*
     * The security boundary of the file. A `javascript:` URL harvested from a
     * target and rendered into an `<img src>` in a customer's browser is
     * stored XSS with extra steps, so it is dropped at the type's edge rather
     * than filtered at every later use.
     */
    const urls = extractImages(page, "https://example.com/").map((i) => i.url);

    expect(urls.some((url) => url.startsWith("javascript:"))).toBe(false);
    expect(urls.some((url) => url.startsWith("data:"))).toBe(false);
  });

  it("takes the first candidate out of a srcset", () => {
    const urls = extractImages(page, "https://example.com/").map((i) => i.url);

    expect(urls).toContain("https://example.com/img/hero-2x.jpg");
  });

  it("leads with the brand assets", () => {
    const kinds = extractImages(page, "https://example.com/").map(
      (image) => image.kind,
    );

    // A gallery that opens with the fourth hero photograph has buried the
    // point; the icon and the card are what the reader recognises.
    expect(kinds[0]).toBe("icon");
    expect(kinds).toContain("social");
    expect(kinds).toContain("logo");
  });

  it("ignores a stylesheet link, which is not an image", () => {
    const urls = extractImages(page, "https://example.com/").map((i) => i.url);

    expect(urls).not.toContain("https://example.com/app.css");
  });

  it("survives markup that is not a document", () => {
    expect(extractImages("", "https://example.com/")).toEqual([]);
    expect(extractImages("<img src=", "https://example.com/")).toEqual([]);
  });

  it("counts foreign origins, which is the supplier list nobody has", () => {
    const images = extractImages(page, "https://example.com/");

    expect(thirdPartyOrigins(images, "example.com")).toEqual([
      "cdn.example.net",
      "img.example.org",
    ]);
  });

  it("does not count the site's own subdomains as third parties", () => {
    const images = extractImages(
      '<img src="https://assets.example.com/a.png">',
      "https://example.com/",
    );

    expect(thirdPartyOrigins(images, "example.com")).toEqual([]);
  });
});
