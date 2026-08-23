import { safeFetch } from "../net/fetch.js";

/*
 * How much of the organisation is visible from outside.
 *
 * This is usually the part of an external report that actually surprises the
 * owner. Header grades confirm what someone already suspected; a list of
 * subdomains they had forgotten existed is new information.
 */

const CT_TIMEOUT_MS = 8_000;
const CT_RETRIES = 1;
const USER_AGENT = "AssistSecScanner/1.0 (+https://assistsec.nl)";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Add a candidate name to the set, once it passes the domain filter.
 *
 * CT search is a substring match and will happily return a different
 * registrant's name, so anything not actually under the domain is discarded.
 * Wildcards collapse to their parent.
 */
function keep(names: Set<string>, raw: string, domain: string): void {
  const name = raw.trim().toLowerCase().replace(/^\*\./, "");
  if (name.endsWith(`.${domain}`) || name === domain) names.add(name);
}

/**
 * crt.sh, the usual CT search. Reliable in aggregate but prone to transient
 * 502s under load, so a failed attempt is retried once before giving up.
 */
async function fromCrtSh(domain: string, names: Set<string>): Promise<void> {
  for (let attempt = 0; attempt <= CT_RETRIES; attempt += 1) {
    try {
      const response = await fetch(
        `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
        {
          headers: { accept: "application/json", "user-agent": USER_AGENT },
          signal: AbortSignal.timeout(CT_TIMEOUT_MS),
        },
      );
      if (!response.ok) {
        // A 5xx is the transient case worth a second try; a 4xx is not.
        if (response.status >= 500 && attempt < CT_RETRIES) {
          await sleep(600);
          continue;
        }
        return;
      }

      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) return;
      for (const entry of payload) {
        if (typeof entry !== "object" || entry === null) continue;
        const value = (entry as { name_value?: unknown }).name_value;
        if (typeof value !== "string") continue;
        // One certificate can carry many names, newline separated.
        for (const line of value.split("\n")) keep(names, line, domain);
      }
      return;
    } catch {
      if (attempt < CT_RETRIES) {
        await sleep(600);
        continue;
      }
      return;
    }
  }
}

/** Cert Spotter, a second CT log. Free tier is capped but real when up. */
async function fromCertSpotter(
  domain: string,
  names: Set<string>,
): Promise<void> {
  try {
    const response = await fetch(
      `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(
        domain,
      )}&include_subdomains=true&expand=dns_names`,
      {
        headers: { accept: "application/json", "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(CT_TIMEOUT_MS),
      },
    );
    if (!response.ok) return;

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return;
    for (const entry of payload) {
      if (typeof entry !== "object" || entry === null) continue;
      const dnsNames = (entry as { dns_names?: unknown }).dns_names;
      if (!Array.isArray(dnsNames)) continue;
      for (const name of dnsNames) {
        if (typeof name === "string") keep(names, name, domain);
      }
    }
  } catch {
    // A source that fails just leaves the set as the others left it.
  }
}

/** Escape a domain so it can be dropped into a RegExp literally. */
function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * RapidDNS, a passive-DNS aggregator. Its answer is an HTML table rather than
 * JSON, so hostnames are lifted out with a bounded regex whose lookarounds
 * pin each match to a whole token ending exactly at the domain, so a name like
 * `x.example.com.evil.net` cannot be mistaken for a subdomain of example.com.
 */
async function fromRapidDns(domain: string, names: Set<string>): Promise<void> {
  try {
    const response = await fetch(
      `https://rapiddns.io/subdomain/${encodeURIComponent(domain)}?full=1`,
      {
        headers: { accept: "text/html", "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(CT_TIMEOUT_MS),
      },
    );
    if (!response.ok) return;

    const html = await response.text();
    const pattern = new RegExp(
      `(?<![\\w.-])((?:[a-z0-9-]+\\.)+${escapeRe(domain)})(?![\\w.-])`,
      "gi",
    );
    for (const match of html.matchAll(pattern)) {
      if (match[1] !== undefined) keep(names, match[1], domain);
    }
  } catch {
    // Ignore; the other sources still contribute.
  }
}

/**
 * HackerTarget host search. Free tier is rate limited to a few queries a day
 * per address and answers "API count exceeded" once spent, which is treated
 * as no result rather than a name.
 */
async function fromHackerTarget(
  domain: string,
  names: Set<string>,
): Promise<void> {
  try {
    const response = await fetch(
      `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`,
      {
        headers: { accept: "text/plain", "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(CT_TIMEOUT_MS),
      },
    );
    if (!response.ok) return;

    const text = await response.text();
    if (text.includes("API count exceeded") || text.includes("error")) return;
    for (const line of text.split("\n")) {
      const host = line.split(",")[0];
      if (host !== undefined && host.length > 0) keep(names, host, domain);
    }
  } catch {
    // Ignore; the other sources still contribute.
  }
}

/** How many names the module and graph will carry, however many exist. */
const SUBDOMAIN_CAP = 300;

/**
 * Subdomains, enumerated passively from several public sources at once.
 *
 * All of these read a public log or aggregator, not the target: Certificate
 * Transparency (crt.sh, Cert Spotter) publishes every certificate issued since
 * 2018, and the passive-DNS services (RapidDNS, HackerTarget) replay
 * resolutions other people's resolvers already made. Not one packet is sent to
 * the site, so this cannot be mistaken for an attack by anyone watching it.
 *
 * Several sources rather than one because any single service has a bad minute
 * — crt.sh in particular 502s under load — and a lone source down leaves the
 * report showing only the apex and calling it the whole estate. They run in
 * parallel and their answers are merged, so the result is the union of
 * whichever happened to be healthy.
 *
 * It finds only names some source has recorded. Internal names on private PKI
 * and names never certificated or resolved publicly are invisible to it, which
 * is a limit worth knowing rather than a fault.
 */
export async function discoverSubdomains(domain: string): Promise<string[]> {
  const names = new Set<string>();

  await Promise.allSettled([
    fromCrtSh(domain, names),
    fromCertSpotter(domain, names),
    fromRapidDns(domain, names),
    fromHackerTarget(domain, names),
  ]);

  return [...names].sort().slice(0, SUBDOMAIN_CAP);
}

/*
 * Paths that should never be readable, checked one request each.
 *
 * Deliberately a short, fixed list of files that are *always* a mistake when
 * public, not a content scan and not a brute-force wordlist. Each is one GET.
 * The whole point of keeping this tiny is that a free scanner pointed at a
 * domain by someone who may not own it must not behave like an attack.
 */
const SENSITIVE_PATHS = [
  { path: "/.git/HEAD", id: "exposed_git", marker: "ref:" },
  { path: "/.env", id: "exposed_env", marker: "=" },
  {
    path: "/server-status",
    id: "exposed_server_status",
    marker: "Server Version",
  },
] as const;

export interface ExposedPath {
  id: string;
  path: string;
}

/**
 * Probe the sensitive paths.
 *
 * A 200 alone is not enough: sites routinely answer every path with a 200 and
 * a soft-404 page, which is how scanners produce a page of imaginary findings.
 * The body has to also look like the file it claims to be, and even then the
 * result is reported as needing validation rather than as fact.
 */
export async function probeSensitivePaths(
  domain: string,
): Promise<ExposedPath[]> {
  const found: ExposedPath[] = [];

  for (const candidate of SENSITIVE_PATHS) {
    const result = await safeFetch(`https://${domain}${candidate.path}`, {
      followRedirects: false,
    });
    if (!result.ok) continue;

    const { status, body } = result.response;
    if (status !== 200) continue;
    // The marker is what separates a real file from a decorated 404.
    if (!body.includes(candidate.marker)) continue;
    // A full HTML document is a page about the path, not the path itself.
    if (/<html[\s>]/i.test(body)) continue;

    found.push({ id: candidate.id, path: candidate.path });
  }

  return found;
}
