import { header, safeFetch } from "../net/fetch.js";
import { mapLimit } from "../net/pool.js";

/*
 * What the site publishes about itself at a known address.
 *
 * Every path below is one the web has agreed on: a standards-track well-known
 * URI, or a convention old enough to be one. Each is a single GET, the list is
 * fixed and short, and nothing here is guessed, permuted or brute-forced. That
 * distinction is the whole design. A wordlist scanner pointed at a domain by
 * someone who does not own it is an attack with a friendly interface; asking a
 * site for its own robots.txt is what every crawler on the internet does.
 *
 * The findings this produces are mostly not "you are exposed". They are "here
 * is what you are telling the world, in case you did not know you were" — and
 * the single most common surprise is the site's own robots.txt, which owners
 * routinely use to list the exact paths they most want left alone.
 */

const PROBE_CONCURRENCY = 6;

/** What a path is for, so the report can group rather than list. */
export type PathKind = "policy" | "crawler" | "platform" | "config";

interface Candidate {
  path: string;
  kind: PathKind;
  /*
   * A string the body must contain for the answer to count. Sites answer
   * unknown paths with a decorated 404 far more often than they 404 properly,
   * and without this every site on earth reports every path as present.
   */
  marker?: RegExp;
}

const CANDIDATES: readonly Candidate[] = [
  // Crawler-facing
  {
    path: "/robots.txt",
    kind: "crawler",
    marker: /user-agent|disallow|sitemap/i,
  },
  { path: "/sitemap.xml", kind: "crawler", marker: /<(urlset|sitemapindex)/i },
  { path: "/ads.txt", kind: "crawler", marker: /,/ },
  { path: "/humans.txt", kind: "crawler" },

  // Policy and disclosure
  {
    path: "/.well-known/security.txt",
    kind: "policy",
    marker: /contact:/i,
  },
  { path: "/security.txt", kind: "policy", marker: /contact:/i },
  { path: "/.well-known/dnt-policy.txt", kind: "policy" },
  { path: "/.well-known/change-password", kind: "policy" },
  { path: "/.well-known/mta-sts.txt", kind: "policy", marker: /version:/i },

  // Platform manifests
  {
    path: "/.well-known/apple-app-site-association",
    kind: "platform",
    marker: /applinks|webcredentials|appids/i,
  },
  {
    path: "/.well-known/assetlinks.json",
    kind: "platform",
    marker: /relation|package_name/i,
  },
  {
    path: "/manifest.json",
    kind: "platform",
    marker: /"(name|icons|start_url)"/i,
  },
  { path: "/site.webmanifest", kind: "platform", marker: /"(name|icons)"/i },
  {
    path: "/.well-known/nodeinfo",
    kind: "platform",
    marker: /links|href/i,
  },
  { path: "/.well-known/host-meta", kind: "platform", marker: /<(xrd|link)/i },

  // Configuration surfaces that are meaningful when public
  {
    path: "/.well-known/openid-configuration",
    kind: "config",
    marker: /issuer|authorization_endpoint/i,
  },
  { path: "/crossdomain.xml", kind: "config", marker: /cross-domain-policy/i },
  {
    path: "/clientaccesspolicy.xml",
    kind: "config",
    marker: /access-policy/i,
  },
  { path: "/wp-json/", kind: "config", marker: /"(namespace|routes)"/i },
];

/*
 * Directories checked for an index listing, and only for that.
 *
 * These are static asset folders on nearly every site, so asking for them is
 * unremarkable traffic. Nothing is read out of them and nothing under them is
 * enumerated: the single question is whether the server renders its contents
 * to anyone who asks, which is a server misconfiguration the owner can fix in
 * one line and usually does not know about.
 */
const LISTING_CANDIDATES = [
  "/uploads/",
  "/files/",
  "/assets/",
  "/images/",
  "/img/",
  "/backup/",
  "/download/",
  "/media/",
] as const;

/** A server-generated directory index, in the three common flavours. */
const LISTING_MARKER =
  /<title>\s*index of\s*\/|<h1>\s*index of\s*\/|directory listing for/i;

export interface DiscoveredPath {
  path: string;
  kind: PathKind;
  /*
   * `protected` is a real and useful answer, not a failure to find something.
   * A 401 on /.well-known/openid-configuration says an identity endpoint is
   * there and guarded; a 404 says nothing at all.
   */
  state: "found" | "protected";
  contentType?: string;
  bytes?: number;
}

export interface PathReport {
  entries: DiscoveredPath[];
  /** Paths this site's own robots.txt asks crawlers to stay out of. */
  disallowed: string[];
  /** Directories whose contents the server renders to anyone. */
  listings: string[];
  /** Whether a vulnerability disclosure contact was published (RFC 9116). */
  securityTxt: boolean;
}

/** Content type without its parameters, bounded, or nothing. */
function shortType(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const type = raw.split(";")[0]?.trim().toLowerCase();
  if (type === undefined || type.length === 0) return undefined;
  return type.slice(0, 60);
}

/**
 * Read the Disallow entries out of a robots.txt.
 *
 * Kept to path prefixes the file already publishes to every crawler that asks,
 * deduplicated, and capped. A bare "/" is dropped: it means "index nothing" and
 * is a statement about the whole site rather than a directory worth naming.
 */
export function parseRobots(body: string): string[] {
  const paths = new Set<string>();

  for (const line of body.split(/\r?\n/)) {
    const match = /^\s*disallow\s*:\s*(\S+)/i.exec(line);
    if (match === null) continue;

    const path = match[1]?.trim();
    if (path === undefined || path === "/" || path.length === 0) continue;
    if (!path.startsWith("/")) continue;

    // Third-party text heading for a browser. Anything that could be markup
    // is dropped here rather than trusted to be escaped at every later use.
    if (/[<>"'`\\]/.test(path)) continue;

    paths.add(path.slice(0, 120));
    if (paths.size >= 40) break;
  }

  return [...paths].sort();
}

async function probe(candidate: Candidate & { host: string }): Promise<{
  entry?: DiscoveredPath;
  body?: string;
  path: string;
}> {
  const result = await safeFetch(`https://${candidate.host}${candidate.path}`, {
    followRedirects: false,
  });
  if (!result.ok) return { path: candidate.path };

  const { status, body } = result.response;

  if (status === 401 || status === 403) {
    return {
      entry: { path: candidate.path, kind: candidate.kind, state: "protected" },
      path: candidate.path,
    };
  }

  if (status !== 200) return { path: candidate.path };

  // A soft 404 dressed as a 200. The marker is what separates the file the
  // path names from a themed "page not found".
  if (candidate.marker !== undefined && !candidate.marker.test(body)) {
    return { path: candidate.path };
  }

  const type = shortType(header(result.response, "content-type"));
  const declared = Number(header(result.response, "content-length"));
  const bytes =
    Number.isFinite(declared) && declared > 0
      ? declared
      : Buffer.byteLength(body);

  return {
    entry: {
      path: candidate.path,
      kind: candidate.kind,
      state: "found",
      ...(type === undefined ? {} : { contentType: type }),
      bytes,
    },
    body,
    path: candidate.path,
  };
}

/**
 * Ask the site for the files the web has agreed it may be asked for.
 *
 * Returns only what answered. An absent path is not reported: a report listing
 * eighteen things a site does not have is noise wearing the costume of rigour.
 */
export async function discoverPaths(host: string): Promise<PathReport> {
  const targets = CANDIDATES.map((candidate) => ({ ...candidate, host }));
  const probed = await mapLimit(targets, PROBE_CONCURRENCY, probe);

  const entries: DiscoveredPath[] = [];
  let disallowed: string[] = [];

  for (const result of probed) {
    if (result.entry !== undefined) entries.push(result.entry);
    if (result.path === "/robots.txt" && result.body !== undefined) {
      disallowed = parseRobots(result.body);
    }
  }

  const listings = await mapLimit<string, string | undefined>(
    LISTING_CANDIDATES,
    PROBE_CONCURRENCY,
    async (path) => {
      const result = await safeFetch(`https://${host}${path}`, {
        followRedirects: false,
      });
      if (!result.ok) return undefined;
      if (result.response.status !== 200) return undefined;
      return LISTING_MARKER.test(result.response.body) ? path : undefined;
    },
  );

  return {
    entries,
    disallowed,
    listings: listings.filter((path): path is string => path !== undefined),
    securityTxt: entries.some(
      (entry) =>
        entry.state === "found" &&
        (entry.path === "/.well-known/security.txt" ||
          entry.path === "/security.txt"),
    ),
  };
}
