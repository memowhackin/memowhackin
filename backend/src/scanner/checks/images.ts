import { header, safeFetch } from "../net/fetch.js";
import { mapLimit } from "../net/pool.js";

/*
 * The pictures the site puts on its own front page.
 *
 * Two things make this worth a section rather than a curiosity. The brand
 * assets — the logo, the favicon, the Open Graph card — are exactly what an
 * impersonation site copies, so seeing them beside the lookalike domains from
 * the same scan is the moment the risk stops being abstract. And the rest is
 * an inventory of third-party origins: a homepage quietly loading images from
 * six domains is six suppliers who can see every visitor, which almost nobody
 * has counted.
 *
 * Extraction costs nothing. The homepage HTML was already fetched for the
 * header checks, so the parse below adds no request at all; only the
 * verification pass touches the network, and it is a bounded HEAD each.
 */

const MAX_IMAGES = 24;
const VERIFY_CONCURRENCY = 4;

/** What the picture is for, so the gallery can lead with the brand assets. */
export type ImageKind = "icon" | "logo" | "social" | "content";

export interface DiscoveredImage {
  /** Absolute http(s) URL. Never a data: or javascript: URI. */
  url: string;
  kind: ImageKind;
  /** The host serving it, so third-party origins are countable. */
  origin: string;
  contentType?: string;
  bytes?: number;
}

/*
 * Attribute readers.
 *
 * Regex rather than a DOM parser on purpose: this repository has no HTML
 * parser and adding a dependency to read six attributes off a page we already
 * hold in memory is not a trade worth making. The parse is lenient by design —
 * a missed image costs a thumbnail, and there is no correctness claim here that
 * a malformed page could break.
 */
const IMG_TAG = /<img\b[^>]*>/gi;
const LINK_TAG = /<link\b[^>]*>/gi;
const META_TAG = /<meta\b[^>]*>/gi;
const CSS_URL = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;

function attribute(tag: string, name: string): string | undefined {
  const pattern = new RegExp(
    `\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = pattern.exec(tag);
  if (match === null) return undefined;
  return match[2] ?? match[3] ?? match[4];
}

/**
 * Resolve a candidate against the page it was found on.
 *
 * Returns nothing for anything that is not http(s). That check is the security
 * boundary of this file: a `javascript:` or `data:` URL harvested from a target
 * and rendered into an `<img src>` in a customer's browser is a stored XSS with
 * extra steps, and dropping the scheme here means it can never reach the type
 * that the frontend renders.
 */
function absolute(raw: string | undefined, base: string): URL | undefined {
  if (raw === undefined) return undefined;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return undefined;

  let url: URL;
  try {
    url = new URL(trimmed, base);
  } catch {
    return undefined;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  // Credentials in an image URL are never legitimate and would be rendered
  // into the page as-is.
  if (url.username.length > 0 || url.password.length > 0) return undefined;
  if (url.href.length > 500) return undefined;

  // Returned parsed rather than as a string, so the caller reads `hostname`
  // off this parse instead of doing a second one that cannot fail but still
  // needs a `catch` to prove it.
  return url;
}

/** First candidate from a srcset, which is a comma-separated list. */
function fromSrcset(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value.split(",")[0]?.trim().split(/\s+/)[0];
}

function classify(url: string, hint: string): ImageKind {
  const blob = `${url} ${hint}`.toLowerCase();
  if (/favicon|apple-touch|mask-icon|\.ico\b/.test(blob)) return "icon";
  if (/logo|wordmark|brandmark/.test(blob)) return "logo";
  return "content";
}

/**
 * Pull every image reference out of a page.
 *
 * Ordered so the brand assets lead: an icon and an Open Graph card are what the
 * reader recognises, and a gallery that opens with the fourth hero photograph
 * has buried the point.
 */
export function extractImages(
  html: string,
  pageUrl: string,
): DiscoveredImage[] {
  const found = new Map<string, DiscoveredImage>();

  const add = (raw: string | undefined, kind: ImageKind, hint = "") => {
    const url = absolute(raw, pageUrl);
    if (url === undefined || found.has(url.href)) return;
    if (found.size >= MAX_IMAGES) return;

    found.set(url.href, {
      url: url.href,
      kind: kind === "content" ? classify(url.href, hint) : kind,
      origin: url.hostname,
    });
  };

  for (const tag of html.match(LINK_TAG) ?? []) {
    const rel = attribute(tag, "rel")?.toLowerCase() ?? "";
    if (!/icon|apple-touch|mask-icon/.test(rel)) continue;
    add(attribute(tag, "href"), "icon");
  }

  for (const tag of html.match(META_TAG) ?? []) {
    const key = (
      attribute(tag, "property") ??
      attribute(tag, "name") ??
      ""
    ).toLowerCase();
    if (key !== "og:image" && key !== "twitter:image") continue;
    add(attribute(tag, "content"), "social");
  }

  for (const tag of html.match(IMG_TAG) ?? []) {
    const hint = `${attribute(tag, "alt") ?? ""} ${attribute(tag, "class") ?? ""}`;
    add(
      attribute(tag, "src") ?? fromSrcset(attribute(tag, "srcset")),
      "content",
      hint,
    );
  }

  // Background images, which is where a logo hides on a site that uses a
  // sprite or a CSS-only header.
  for (const match of html.matchAll(CSS_URL)) {
    add(match[1], "content");
  }

  const order: Record<ImageKind, number> = {
    icon: 0,
    logo: 1,
    social: 2,
    content: 3,
  };
  return [...found.values()].sort((a, b) => order[a.kind] - order[b.kind]);
}

/**
 * Confirm each image is really there, and record what it is.
 *
 * A HEAD each, through the same guarded client as everything else — so an
 * image URL pointing at 169.254.169.254 is refused by `safeFetch` before a
 * socket opens, exactly as a redirect to it would be. Anything that does not
 * answer, or answers as something other than an image, is dropped rather than
 * shown: a gallery of broken thumbnails looks like a broken product.
 */
export async function verifyImages(
  images: readonly DiscoveredImage[],
): Promise<DiscoveredImage[]> {
  const checked = await mapLimit<DiscoveredImage, DiscoveredImage | undefined>(
    images,
    VERIFY_CONCURRENCY,
    async (image) => {
      const result = await safeFetch(image.url, { method: "HEAD" });
      if (!result.ok) return undefined;
      if (result.response.status !== 200) return undefined;

      const type = header(result.response, "content-type")
        ?.split(";")[0]
        ?.trim()
        ?.toLowerCase();
      if (!type?.startsWith("image/")) return undefined;

      const declared = Number(header(result.response, "content-length"));
      const bytes =
        Number.isFinite(declared) && declared > 0 ? declared : undefined;

      return {
        ...image,
        contentType: type.slice(0, 60),
        ...(bytes === undefined ? {} : { bytes }),
      };
    },
  );

  return checked.filter(
    (image): image is DiscoveredImage => image !== undefined,
  );
}

/** Distinct hosts serving the page's images, excluding the site's own. */
export function thirdPartyOrigins(
  images: readonly DiscoveredImage[],
  domain: string,
): string[] {
  const origins = new Set<string>();
  for (const image of images) {
    if (image.origin === domain) continue;
    if (image.origin.endsWith(`.${domain}`)) continue;
    origins.add(image.origin);
  }
  return [...origins].sort();
}
