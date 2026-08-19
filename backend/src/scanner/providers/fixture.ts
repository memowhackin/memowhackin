import { createHash } from "node:crypto";
import type {
  BreachRecord,
  EmailObservation,
  EmailProvider,
  ProviderResult,
  WebsiteFinding,
  WebsiteObservation,
  WebsiteProvider,
} from "./types.js";

/*
 * A development stand-in for real scan providers.
 *
 * This exists so the whole flow — creation, staged progress, results, the
 * relationship graph, both languages — can be built and tested without buying
 * data. It is refused in production by `env.ts`, and `index.ts` refuses to
 * hand it out there as well, because canned findings shown to a real visitor
 * about their real domain would be a lie told with a straight face.
 *
 * Output is derived from a hash of the subject rather than random, so a given
 * domain always produces the same report. A fixture that changes between
 * refreshes makes every progress and caching bug look like a data bug.
 *
 * The shapes are drawn from the real catalogue in `catalogue.ts`, so the UI is
 * exercised against the same finding ids it will see in production.
 */

function seed(value: string): number[] {
  return [...createHash("sha256").update(value).digest()];
}

/** A stable 0..max-1 from the seed, by byte position. */
function pick(bytes: number[], position: number, max: number): number {
  return (bytes[position % bytes.length] ?? 0) % max;
}

const WEBSITE_CANDIDATES: WebsiteFinding[] = [
  {
    id: "missing_hsts",
    category: "transport",
    severity: "medium",
    confidence: "confirmed",
    evidence: "No Strict-Transport-Security header on the primary response.",
  },
  {
    id: "missing_csp",
    category: "headers",
    severity: "medium",
    confidence: "confirmed",
    evidence: "No Content-Security-Policy header on the primary response.",
  },
  {
    id: "weak_spf",
    category: "email_authentication",
    severity: "medium",
    confidence: "high",
    evidence: "SPF record ends in ~all rather than -all.",
  },
  {
    id: "missing_dmarc",
    category: "email_authentication",
    severity: "high",
    confidence: "confirmed",
    evidence: "No DMARC record published for the domain.",
  },
  {
    id: "server_version_disclosed",
    category: "software_disclosure",
    severity: "low",
    confidence: "possible",
    evidence: "Server header names a product and version.",
  },
  {
    id: "directory_listing",
    category: "exposed_surface",
    severity: "medium",
    confidence: "possible",
    evidence: "A path returned an index-style listing.",
  },
  {
    id: "missing_caa",
    category: "dns",
    severity: "low",
    confidence: "confirmed",
    evidence: "No CAA record restricts which authorities may issue.",
  },
];

const BREACH_SOURCES = [
  "Collection Archive 2019",
  "Forum Dump 2021",
  "Retail Platform 2020",
  "Newsletter Provider 2022",
];

export const fixtureWebsiteProvider: WebsiteProvider = {
  name: "fixture",

  scanWebsite(domain: string): Promise<ProviderResult<WebsiteObservation>> {
    const bytes = seed(`website:${domain}`);

    // A deterministic slice of the catalogue, always at least two so the
    // result page is never empty in development, never all seven so the
    // "nothing found" and "some found" layouts both get exercised.
    const count = 2 + pick(bytes, 0, WEBSITE_CANDIDATES.length - 2);
    const offset = pick(bytes, 1, WEBSITE_CANDIDATES.length);
    const findings = Array.from({ length: count }, (_unused, index) => {
      const candidate =
        WEBSITE_CANDIDATES[(offset + index) % WEBSITE_CANDIDATES.length];
      return candidate;
    }).filter((finding): finding is WebsiteFinding => finding !== undefined);

    const observation: WebsiteObservation = {
      findings,
      assets: [domain, `www.${domain}`, `mail.${domain}`],
      technologies: [
        { id: "nginx", name: "nginx", category: "server", version: "1.24.0" },
        { id: "cloudflare", name: "Cloudflare", category: "cdn" },
        {
          id: "wordpress",
          name: "WordPress",
          category: "platform",
          version: "6.4.2",
        },
        { id: "php", name: "PHP", category: "language", version: "8.2.10" },
        { id: "jquery", name: "jQuery", category: "ui", version: "3.6.0" },
        {
          id: "googleanalytics",
          name: "Google Analytics",
          category: "analytics",
        },
      ],
      lookalikes: [
        { domain: `${domain.split(".")[0] ?? ""}-secure.com`, hasMail: true },
        { domain: `${domain.split(".")[0] ?? ""}.net`, hasMail: false },
      ],
      limitations: [
        "unauthenticated_only",
        "no_business_logic",
        "point_in_time",
      ],
    };

    return Promise.resolve({ ok: true, value: observation, partial: false });
  },
};

export const fixtureEmailProvider: EmailProvider = {
  name: "fixture",

  scanEmail(address: string): Promise<ProviderResult<EmailObservation>> {
    const bytes = seed(`email:${address}`);

    // One address in eight comes back clean, so the "no exposure found"
    // result is a path that actually gets built and tested.
    if (pick(bytes, 0, 8) === 0) {
      return Promise.resolve({
        ok: true,
        value: { records: [], limitations: ["known_sources_only"] },
        partial: false,
      });
    }

    const count = 1 + pick(bytes, 1, 3);
    const records: BreachRecord[] = Array.from(
      { length: count },
      (_unused, index) => {
        const source =
          BREACH_SOURCES[
            (pick(bytes, 2 + index, BREACH_SOURCES.length) + index) %
              BREACH_SOURCES.length
          ] ?? "Unknown source";
        const passwordExposed = pick(bytes, 10 + index, 3) > 0;
        const hasPhone = pick(bytes, 20 + index, 2) === 0;
        const stealer = pick(bytes, 30 + index, 5) === 0;

        return {
          source,
          occurredAt: `20${String(18 + pick(bytes, 40 + index, 6)).padStart(2, "0")}-0${String(1 + pick(bytes, 50 + index, 9))}-1${String(pick(bytes, 60 + index, 9))}`,
          dataTypes: [
            "email" as const,
            ...(passwordExposed ? (["password"] as const) : []),
            ...(hasPhone ? (["phone"] as const) : []),
            ...(pick(bytes, 70 + index, 2) === 0 ? (["name"] as const) : []),
          ],
          passwordExposed,
          ...(hasPhone
            ? { phoneSuffix: String(pick(bytes, 80 + index, 90) + 10) }
            : {}),
          ...(pick(bytes, 90 + index, 3) === 0 ? { countryCode: "NL" } : {}),
          stealerLog: stealer,
          confidence: stealer ? ("high" as const) : ("confirmed" as const),
        };
      },
    );

    return Promise.resolve({
      ok: true,
      value: { records, limitations: ["known_sources_only"] },
      partial: false,
    });
  },
};
