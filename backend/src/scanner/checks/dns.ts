import { Resolver } from "node:dns/promises";

/*
 * DNS-derived facts.
 *
 * A private resolver with its own short timeout, rather than the process
 * default: a target with a slow or deliberately hostile nameserver should cost
 * this scan a couple of seconds, not hang it.
 *
 * Every lookup returns a value or nothing. NXDOMAIN, SERVFAIL and timeouts are
 * all "we did not get a record", and the difference between them is not
 * something a report should pretend to know.
 */

const TIMEOUT_MS = 4000;
const ATTEMPTS = 2;

function resolver(): Resolver {
  const instance = new Resolver({ timeout: TIMEOUT_MS, tries: ATTEMPTS });
  return instance;
}

async function attempt<T>(work: () => Promise<T>): Promise<T | undefined> {
  try {
    return await work();
  } catch {
    return undefined;
  }
}

export interface DnsFacts {
  a: string[];
  mx: string[];
  ns: string[];
  txt: string[];
  caa: string[];
  /** The CNAME the apex or www points at, when there is one. */
  cname?: string;
  dnssec?: boolean;
}

export async function lookupDns(domain: string): Promise<DnsFacts> {
  const dns = resolver();

  const [a, mx, ns, txt, caa, cname] = await Promise.all([
    attempt(() => dns.resolve4(domain)),
    attempt(() => dns.resolveMx(domain)),
    attempt(() => dns.resolveNs(domain)),
    attempt(() => dns.resolveTxt(domain)),
    attempt(() => dns.resolveCaa(domain)),
    attempt(() => dns.resolveCname(`www.${domain}`)),
  ]);

  return {
    a: a ?? [],
    mx: (mx ?? []).map((record) => record.exchange),
    ns: ns ?? [],
    // A TXT record arrives as chunks that have to be joined before it means
    // anything: long SPF and DKIM records are split at 255 characters.
    txt: (txt ?? []).map((chunks) => chunks.join("")),
    caa: (caa ?? []).flatMap((record) =>
      typeof record.issue === "string" ? [record.issue] : [],
    ),
    ...(cname?.[0] === undefined ? {} : { cname: cname[0] }),
  };
}

/**
 * Whether the zone is signed, asked over DNS-over-HTTPS.
 *
 * Node's resolver exposes no DS or DNSKEY query and no AD flag, so this asks a
 * validating resolver instead and reads the `AD` bit off the answer. It is a
 * request to a fixed, known host rather than to the target, so it is outside
 * the SSRF surface. A failure means "we could not tell", and the caller
 * reports nothing rather than guessing.
 */
export async function checkDnssec(
  domain: string,
): Promise<boolean | undefined> {
  try {
    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=A`,
      {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!response.ok) return undefined;

    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null || !("AD" in body)) {
      return undefined;
    }

    const authenticated = (body as { AD?: unknown }).AD;
    return typeof authenticated === "boolean" ? authenticated : undefined;
  } catch {
    return undefined;
  }
}

/*
 * Hostnames whose CNAME targets are worth flagging when the target itself does
 * not resolve — the classic subdomain-takeover shape, where a service was
 * decommissioned but the DNS record pointing at it was left behind.
 *
 * Deliberately a suffix list of platforms that hand out subdomains on request:
 * a dangling record to one of these is claimable by anyone, which is what
 * makes it a finding rather than a curiosity.
 */
const TAKEOVER_SUFFIXES = [
  "github.io",
  "herokuapp.com",
  "azurewebsites.net",
  "cloudapp.net",
  "s3.amazonaws.com",
  "netlify.app",
  "ghost.io",
  "surge.sh",
  "pantheonsite.io",
  "wpengine.com",
  "zendesk.com",
  "statuspage.io",
];

export function isTakeoverCandidate(cname: string): boolean {
  const target = cname.toLowerCase().replace(/\.$/, "");
  return TAKEOVER_SUFFIXES.some((suffix) => target.endsWith(suffix));
}

/** Whether a name resolves at all, used to test a CNAME's target. */
export async function resolves(hostname: string): Promise<boolean> {
  const dns = resolver();
  const found = await attempt(() => dns.resolve4(hostname));
  if (found !== undefined && found.length > 0) return true;

  const six = await attempt(() => dns.resolve6(hostname));
  return six !== undefined && six.length > 0;
}
