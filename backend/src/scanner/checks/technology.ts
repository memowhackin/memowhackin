import type { FetchedResponse } from "../net/fetch.js";
import { header, headerAll } from "../net/fetch.js";

/*
 * What the site is built on, read off what it already tells everyone.
 *
 * Every signal here is something the server volunteers in a header or prints
 * into its own HTML. Nothing is probed for, nothing is guessed from timing,
 * and no request is made that a browser would not make anyway.
 *
 * Two rules keep this honest, and they matter more than the length of the
 * list:
 *
 *   - A version is reported only when it is stated. Inferring "probably 6.x"
 *     from a file path is how a fingerprinter starts telling people they are
 *     running software they are not, and the report says N/A instead.
 *   - Detection is never a finding. Knowing a site runs nginx is not knowing
 *     it is out of date, and this module has no opinion on severity. The
 *     related finding, `server_version_disclosed`, is about the disclosure
 *     itself and is raised elsewhere.
 */

export type TechCategory =
  | "server"
  | "platform"
  | "language"
  | "framework"
  | "cdn"
  | "analytics"
  | "ui";

export interface DetectedTechnology {
  /** Stable key, also the icon lookup. */
  id: string;
  name: string;
  category: TechCategory;
  /** Only ever a version the target stated itself. */
  version?: string;
}

interface Signature {
  id: string;
  name: string;
  category: TechCategory;
  /** Matched against a joined header blob, case-insensitively. */
  header?: RegExp;
  /** Matched against the HTML body. */
  body?: RegExp;
  /** Capture group 1 of either pattern, when it is a version. */
  versionFrom?: "header" | "body";
}

/*
 * The catalogue. Ordered by how specific a signal is, because the first match
 * per id wins and a generic pattern would otherwise shadow a precise one.
 *
 * Patterns are deliberately narrow. `wp-content` in a body is WordPress;
 * "react" as a bare word is a blog post about React, so the marker used is the
 * attribute React actually writes into the DOM.
 */
const SIGNATURES: Signature[] = [
  // Servers
  {
    id: "nginx",
    name: "nginx",
    category: "server",
    header: /\bnginx(?:\/([\d.]+))?/i,
    versionFrom: "header",
  },
  {
    id: "apache",
    name: "Apache",
    category: "server",
    header: /\bapache(?:\/([\d.]+))?/i,
    versionFrom: "header",
  },
  {
    id: "caddy",
    name: "Caddy",
    category: "server",
    header: /\bcaddy(?:\/([\d.]+))?/i,
    versionFrom: "header",
  },
  {
    id: "litespeed",
    name: "LiteSpeed",
    category: "server",
    header: /\blitespeed(?:\/([\d.]+))?/i,
    versionFrom: "header",
  },
  {
    id: "microsoftiis",
    name: "IIS",
    category: "server",
    header: /microsoft-iis(?:\/([\d.]+))?/i,
    versionFrom: "header",
  },

  // Edge and delivery
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "cdn",
    header: /\bcloudflare\b|\bcf-ray\b/i,
  },
  { id: "fastly", name: "Fastly", category: "cdn", header: /\bfastly\b/i },
  {
    id: "akamai",
    name: "Akamai",
    category: "cdn",
    header: /\bakamai\b|\bakamaighost\b/i,
  },
  {
    id: "amazonwebservices",
    name: "CloudFront",
    category: "cdn",
    header: /\bcloudfront\b/i,
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "cdn",
    header: /\bvercel\b|x-vercel-id/i,
  },
  { id: "netlify", name: "Netlify", category: "cdn", header: /\bnetlify\b/i },

  // Languages and runtimes
  {
    id: "php",
    name: "PHP",
    category: "language",
    header: /\bphp(?:\/([\d.]+))?/i,
    versionFrom: "header",
  },
  {
    id: "nodedotjs",
    name: "Node.js",
    category: "language",
    header: /\bexpress\b|\bnode\.js\b/i,
  },
  {
    id: "dotnet",
    name: "ASP.NET",
    category: "language",
    header: /\basp\.net\b/i,
  },
  {
    id: "ruby",
    name: "Ruby",
    category: "language",
    header: /\bphusion passenger\b|\bpuma\b/i,
  },
  {
    id: "python",
    name: "Python",
    category: "language",
    header: /\bgunicorn(?:\/([\d.]+))?|\bwerkzeug\b/i,
    versionFrom: "header",
  },

  // Platforms and content management
  {
    id: "wordpress",
    name: "WordPress",
    category: "platform",
    body: /<meta[^>]+name=["']generator["'][^>]+content=["']WordPress\s*([\d.]+)?/i,
    versionFrom: "body",
  },
  {
    id: "drupal",
    name: "Drupal",
    category: "platform",
    body: /<meta[^>]+content=["']Drupal\s*([\d.]+)?/i,
    versionFrom: "body",
  },
  {
    id: "joomla",
    name: "Joomla",
    category: "platform",
    body: /<meta[^>]+content=["']Joomla!?\s*([\d.]+)?/i,
    versionFrom: "body",
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "platform",
    body: /cdn\.shopify\.com|Shopify\.theme/i,
  },
  {
    id: "wix",
    name: "Wix",
    category: "platform",
    body: /static\.wixstatic\.com|X-Wix-/i,
  },
  {
    id: "squarespace",
    name: "Squarespace",
    category: "platform",
    body: /squarespace\.com|Static\.SQUARESPACE_CONTEXT/i,
  },
  {
    id: "webflow",
    name: "Webflow",
    category: "platform",
    body: /<meta[^>]+content=["']Webflow/i,
  },
  {
    id: "contentful",
    name: "Contentful",
    category: "platform",
    body: /cdn\.contentful\.com/i,
  },

  // Front-end frameworks
  {
    id: "nextdotjs",
    name: "Next.js",
    category: "framework",
    body: /__NEXT_DATA__|\/_next\/static/i,
  },
  {
    id: "nuxtdotjs",
    name: "Nuxt",
    category: "framework",
    body: /__NUXT__|\/_nuxt\//i,
  },
  {
    id: "react",
    name: "React",
    category: "framework",
    body: /data-reactroot|__REACT_DEVTOOLS|\breactrootid\b/i,
  },
  {
    id: "vuedotjs",
    name: "Vue",
    category: "framework",
    body: /data-v-[0-9a-f]{8}|__VUE__/i,
  },
  {
    id: "angular",
    name: "Angular",
    category: "framework",
    body: /ng-version=["']([\d.]+)["']|\bng-app\b/i,
    versionFrom: "body",
  },
  {
    id: "svelte",
    name: "Svelte",
    category: "framework",
    body: /\bsvelte-[0-9a-z]{6}\b/i,
  },
  {
    id: "astro",
    name: "Astro",
    category: "framework",
    body: /<meta[^>]+content=["']Astro\s*v?([\d.]+)?/i,
    versionFrom: "body",
  },

  // Interface libraries
  {
    id: "jquery",
    name: "jQuery",
    category: "ui",
    body: /jquery[.-]?v?([\d.]+)?(?:\.min)?\.js/i,
    versionFrom: "body",
  },
  {
    id: "bootstrap",
    name: "Bootstrap",
    category: "ui",
    body: /bootstrap[.-]?v?([\d.]+)?(?:\.min)?\.(?:css|js)/i,
    versionFrom: "body",
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    category: "ui",
    body: /tailwind(?:css)?[.-]?v?([\d.]+)?(?:\.min)?\.css/i,
    versionFrom: "body",
  },

  // Measurement
  {
    id: "googleanalytics",
    name: "Google Analytics",
    category: "analytics",
    body: /gtag\/js\?id=G-|google-analytics\.com\/analytics\.js/i,
  },
  {
    id: "googletagmanager",
    name: "Tag Manager",
    category: "analytics",
    body: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/,
  },
  {
    id: "matomo",
    name: "Matomo",
    category: "analytics",
    body: /matomo\.js|piwik\.js/i,
  },
  {
    id: "plausibleanalytics",
    name: "Plausible",
    category: "analytics",
    body: /plausible\.io\/js/i,
  },
  {
    id: "hotjar",
    name: "Hotjar",
    category: "analytics",
    body: /static\.hotjar\.com/i,
  },
];

/** A version string worth showing: numeric, short, and not a date. */
function cleanVersion(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (!/^\d+(\.\d+){0,3}$/.test(trimmed)) return undefined;
  if (trimmed.length > 12) return undefined;
  return trimmed;
}

/**
 * Identify what the response is built on.
 *
 * Headers and body are searched separately so a pattern meant for one cannot
 * accidentally match the other — "apache" appearing in a page of prose should
 * not make us claim the site runs Apache.
 */
export function detectTechnologies(
  response: FetchedResponse,
  body: string,
): DetectedTechnology[] {
  // The headers that actually carry product names, joined once.
  const headerBlob = [
    header(response, "server"),
    header(response, "x-powered-by"),
    header(response, "x-generator"),
    header(response, "via"),
    header(response, "x-aspnet-version"),
    ...headerAll(response, "set-cookie").map((cookie) => cookie.split("=")[0]),
    // Presence-only markers, flattened to their names.
    ...Object.keys(response.headers).filter((name) =>
      /^(cf-ray|x-vercel-id|x-nf-request-id|x-amz-cf-id|x-served-by)$/i.test(
        name,
      ),
    ),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");

  // Only the head and the first stretch of markup: generators, script tags and
  // framework markers live there, and scanning 256kB of prose finds nothing
  // but false positives.
  const sample = body.slice(0, 60_000);

  const found = new Map<string, DetectedTechnology>();

  for (const signature of SIGNATURES) {
    if (found.has(signature.id)) continue;

    const headerMatch = signature.header?.exec(headerBlob) ?? null;
    const bodyMatch = signature.body?.exec(sample) ?? null;
    if (headerMatch === null && bodyMatch === null) continue;

    const source = signature.versionFrom === "body" ? bodyMatch : headerMatch;
    const version = cleanVersion(source?.[1]);

    found.set(signature.id, {
      id: signature.id,
      name: signature.name,
      category: signature.category,
      ...(version === undefined ? {} : { version }),
    });
  }

  /*
   * Ordered by category so the badges read as a stack rather than as the
   * arbitrary order of the catalogue: what serves it, what it is built on,
   * what runs in the browser, what measures it.
   */
  const order: TechCategory[] = [
    "server",
    "cdn",
    "platform",
    "language",
    "framework",
    "ui",
    "analytics",
  ];

  return [...found.values()].sort(
    (a, b) =>
      order.indexOf(a.category) - order.indexOf(b.category) ||
      a.name.localeCompare(b.name),
  );
}
