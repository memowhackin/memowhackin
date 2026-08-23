import { headerAll, type FetchedResponse } from "../net/fetch.js";
import type { Confidence } from "../providers/types.js";

/*
 * Which edge, if any, is sitting in front of the site.
 *
 * This is read entirely out of the response the site already served us. That is
 * a deliberate limit, and it is worth being clear about why, because the usual
 * way to fingerprint a WAF is the opposite: send something that looks like an
 * attack, and identify the vendor by the shape of the block page that comes
 * back. That technique works, and we will not use it. A free scanner that
 * anyone can point at any domain without proving they own it must not send
 * payloads designed to trip an intrusion alarm — the owner would be right to
 * read it as an attack, and their SOC would be right to page someone.
 *
 * So the trade is honest and stated: passive detection finds every vendor that
 * announces itself in a header or a cookie, which is most of them, and misses
 * one configured to stay quiet. A silent WAF is reported as nothing found
 * rather than as no WAF present, and `waf_undetermined` is the limitation that
 * carries that distinction to the reader.
 */

export interface WafDetection {
  /** Stable key from our own catalogue; the UI translates it. */
  id: string;
  /** Vendor name as it is normally written. Escaped on render. */
  name: string;
  /*
   * What the product actually is. Cloudflare and Akamai sell one box that does
   * both, and calling a pure CDN a firewall would be telling someone they have
   * a control they have not bought.
   */
  kind: "waf" | "cdn";
  confidence: Confidence;
}

interface Rule {
  id: string;
  name: string;
  kind: "waf" | "cdn";
  /** Header names whose mere presence identifies the vendor. */
  headers?: string[];
  /** Header name paired with a pattern its value has to match. */
  values?: [string, RegExp][];
  /** Cookie name patterns. Set-Cookie is checked across every value. */
  cookies?: RegExp[];
  confidence: Confidence;
}

/*
 * Vendor signatures.
 *
 * `confirmed` is reserved for a header or cookie that no other product emits —
 * `cf-ray` is Cloudflare and cannot be anything else. Anything derived from a
 * shared or guessable field, notably `via` and `server`, is `high` at best,
 * because both are routinely rewritten by an intermediate proxy that is not the
 * vendor named in them.
 */
const RULES: readonly Rule[] = [
  {
    id: "cloudflare",
    name: "Cloudflare",
    kind: "waf",
    headers: ["cf-ray"],
    cookies: [/^__cf_bm=/i, /^__cfduid=/i, /^cf_clearance=/i],
    confidence: "confirmed",
  },
  {
    id: "akamai",
    name: "Akamai",
    kind: "cdn",
    headers: ["x-akamai-transformed", "akamai-grn"],
    values: [["server", /akamaighost/i]],
    confidence: "confirmed",
  },
  {
    id: "imperva",
    name: "Imperva",
    kind: "waf",
    headers: ["x-iinfo"],
    values: [["x-cdn", /incapsula/i]],
    cookies: [/^visid_incap_/i, /^incap_ses_/i, /^nlbi_/i],
    confidence: "confirmed",
  },
  {
    id: "sucuri",
    name: "Sucuri",
    kind: "waf",
    headers: ["x-sucuri-id", "x-sucuri-cache"],
    confidence: "confirmed",
  },
  {
    id: "cloudfront",
    name: "Amazon CloudFront",
    kind: "cdn",
    headers: ["x-amz-cf-id"],
    confidence: "confirmed",
  },
  {
    id: "aws_waf",
    name: "AWS WAF",
    kind: "waf",
    headers: ["x-amzn-waf-action"],
    cookies: [/^aws-waf-token=/i],
    confidence: "confirmed",
  },
  {
    id: "fastly",
    name: "Fastly",
    kind: "cdn",
    headers: ["x-fastly-request-id"],
    values: [["x-served-by", /cache-/i]],
    confidence: "high",
  },
  {
    id: "azure_front_door",
    name: "Azure Front Door",
    kind: "waf",
    headers: ["x-azure-ref"],
    confidence: "confirmed",
  },
  {
    id: "fortiweb",
    name: "Fortinet FortiWeb",
    kind: "waf",
    cookies: [/^fortiwafsid=/i],
    confidence: "confirmed",
  },
  {
    id: "f5_big_ip",
    name: "F5 BIG-IP",
    kind: "waf",
    headers: ["x-wa-info"],
    cookies: [/^bigipserver/i, /^ts[0-9a-f]{6,}=/i],
    confidence: "high",
  },
  {
    id: "citrix_netscaler",
    name: "Citrix NetScaler",
    kind: "waf",
    cookies: [/^citrix_ns_id=/i, /^ns_af=/i, /^nsc_/i],
    confidence: "high",
  },
  {
    id: "barracuda",
    name: "Barracuda",
    kind: "waf",
    cookies: [/^barra_counter_session=/i],
    confidence: "high",
  },
  {
    id: "wallarm",
    name: "Wallarm",
    kind: "waf",
    values: [["server", /nginx-wallarm/i]],
    confidence: "confirmed",
  },
  {
    id: "reblaze",
    name: "Reblaze",
    kind: "waf",
    cookies: [/^rbzid=/i],
    confidence: "high",
  },
  {
    id: "ddos_guard",
    name: "DDoS-Guard",
    kind: "waf",
    values: [["server", /ddos-guard/i]],
    confidence: "confirmed",
  },
  {
    id: "qrator",
    name: "Qrator",
    kind: "waf",
    values: [["server", /qrator/i]],
    confidence: "confirmed",
  },
  {
    id: "stackpath",
    name: "StackPath",
    kind: "waf",
    values: [["server", /stackpath/i]],
    confidence: "high",
  },
  {
    id: "modsecurity",
    name: "ModSecurity",
    kind: "waf",
    values: [["server", /mod_security|modsecurity|noyb/i]],
    confidence: "high",
  },
  {
    id: "vercel",
    name: "Vercel",
    kind: "cdn",
    headers: ["x-vercel-id"],
    confidence: "confirmed",
  },
  {
    id: "netlify",
    name: "Netlify",
    kind: "cdn",
    values: [["server", /netlify/i]],
    confidence: "confirmed",
  },
  {
    id: "google_cloud",
    name: "Google Cloud",
    kind: "cdn",
    values: [["via", /\bgoogle\b/i]],
    confidence: "possible",
  },
];

/** First value of a header, lowercased, or an empty string. */
function value(response: FetchedResponse, name: string): string {
  const raw = response.headers[name.toLowerCase()];
  if (raw === undefined) return "";
  return (Array.isArray(raw) ? (raw[0] ?? "") : raw).toLowerCase();
}

function matches(response: FetchedResponse, rule: Rule): boolean {
  for (const name of rule.headers ?? []) {
    if (response.headers[name.toLowerCase()] !== undefined) return true;
  }

  for (const [name, pattern] of rule.values ?? []) {
    if (pattern.test(value(response, name))) return true;
  }

  if (rule.cookies !== undefined) {
    const cookies = headerAll(response, "set-cookie");
    for (const pattern of rule.cookies) {
      if (cookies.some((cookie) => pattern.test(cookie.trim()))) return true;
    }
  }

  return false;
}

/**
 * Identify the edge products in front of a response.
 *
 * More than one can be true at once and that is not a conflict to resolve:
 * Cloudflare in front of an origin behind CloudFront is an ordinary
 * arrangement, and both headers will be present. Returning both is the
 * accurate answer.
 */
export function detectWaf(response: FetchedResponse): WafDetection[] {
  const found: WafDetection[] = [];

  for (const rule of RULES) {
    if (!matches(response, rule)) continue;
    found.push({
      id: rule.id,
      name: rule.name,
      kind: rule.kind,
      confidence: rule.confidence,
    });
  }

  /*
   * A CDN-only match beside a WAF match from the same vendor family is noise;
   * more usefully, a bare "Google Cloud" guess from a `via` header is not worth
   * showing next to a confirmed vendor. Drop the possibles when anything solid
   * was found, and keep them when they are all we have.
   */
  const solid = found.filter((entry) => entry.confidence !== "possible");
  return solid.length > 0 ? solid : found;
}

/** True when at least one detection is a firewall rather than a plain CDN. */
export function hasFirewall(detections: readonly WafDetection[]): boolean {
  return detections.some((entry) => entry.kind === "waf");
}
