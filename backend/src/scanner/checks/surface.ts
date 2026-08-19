import { safeFetch } from "../net/fetch.js";

/*
 * How much of the organisation is visible from outside.
 *
 * This is usually the part of an external report that actually surprises the
 * owner. Header grades confirm what someone already suspected; a list of
 * subdomains they had forgotten existed is new information.
 */

const CT_TIMEOUT_MS = 12_000;

/**
 * Subdomains, from Certificate Transparency logs.
 *
 * Every publicly trusted certificate issued since 2018 is published to CT, so
 * querying the logs enumerates a domain's certificated names without sending a
 * single packet to the target. That matters twice over: it is far faster than
 * brute-forcing names, and it is entirely passive, so it cannot be mistaken
 * for an attack by anyone watching the target's logs.
 *
 * It finds only names that appear on a certificate. Internal names on private
 * PKI and names never certificated are invisible to it, which is a limit worth
 * knowing rather than a fault.
 */
export async function discoverSubdomains(domain: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://crt.sh/?q=%25.${encodeURIComponent(domain)}&output=json`,
      {
        headers: {
          accept: "application/json",
          "user-agent": "AssistSecScanner/1.0 (+https://assistsec.nl)",
        },
        signal: AbortSignal.timeout(CT_TIMEOUT_MS),
      },
    );
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) return [];

    const names = new Set<string>();
    for (const entry of payload) {
      if (typeof entry !== "object" || entry === null) continue;
      const value = (entry as { name_value?: unknown }).name_value;
      if (typeof value !== "string") continue;

      // One certificate can carry many names, newline separated.
      for (const raw of value.split("\n")) {
        const name = raw.trim().toLowerCase().replace(/^\*\./, "");
        // Wildcards collapse to their parent, and anything not under the
        // domain asked about is discarded — CT search is a substring match
        // and will happily return a different registrant's name.
        if (name.endsWith(`.${domain}`) || name === domain) names.add(name);
      }
    }

    return [...names].sort();
  } catch {
    return [];
  }
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
