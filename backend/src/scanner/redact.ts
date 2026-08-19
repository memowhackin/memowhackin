import type {
  BreachRecord,
  EmailObservation,
  WebsiteObservation,
} from "./providers/types.js";
import { surfaceScore } from "./score.js";

/*
 * What leaves the server, and what never does.
 *
 * Two different problems share this file.
 *
 * For a website scan the caller has not proved they control the domain. Anyone
 * can type any company's name into a public form, so the report has to be
 * useful to the owner without being a free reconnaissance pass for everyone
 * else. The rule applied here: say *what class of problem* exists and *why it
 * matters*, never the specific path, parameter, version string or header value
 * that would shorten an attack. An owner can reproduce any of it in a minute;
 * a stranger gets a reason to book a test rather than a target list.
 *
 * For an email scan the caller has proved control by opening a mailed link,
 * but the data itself is the problem. Passwords, hashes, fragments, session
 * material, exact addresses and other people's identities are not redacted
 * here so much as never carried: the provider types have no field for them.
 * What this file does is enforce the remaining shapes — two digits of a phone
 * number, a country and nothing finer, a year and month rather than a day.
 */

/** Evidence strings are dropped entirely for a caller who owns nothing. */
export interface PublicWebsiteFinding {
  id: string;
  category: string;
  severity: string;
  confidence: string;
}

export interface PublicWebsiteResult {
  findings: PublicWebsiteFinding[];
  /*
   * The hostnames themselves, not just a count.
   *
   * An earlier version reduced these to a number on the grounds that a list
   * of subdomains is an infrastructure map. That reasoning does not survive
   * contact with where the data comes from: every one of these was read out
   * of Certificate Transparency, a public append-only log that anyone can
   * query in a browser. Withholding it protects nobody and removes the single
   * most useful thing on the page, which is the host the owner had forgotten
   * about.
   *
   * The line now sits where it actually matters: `evidence` is still dropped,
   * because a readable path or a version banner is not public and does
   * shorten an attack.
   */
  assets: string[];
  /** Domains registered to resemble this one. Public DNS facts. */
  lookalikes: { domain: string; hasMail: boolean }[];
  /*
   * The stack, as the site announces it. Safe to publish for the same reason
   * the headers it was read from are: the target volunteers all of it to every
   * visitor. Versions appear only where the target stated one.
   */
  technologies: {
    id: string;
    name: string;
    category: string;
    version?: string;
  }[];
  /** 0-100 over the observed public surface. See `score.ts`. */
  score: number;
  scoreBand: string;
  limitations: string[];
}

/**
 * Strip a website observation to what is safe for an unverified caller.
 *
 * `evidence` is removed rather than shortened. It is the field that holds
 * "the /backup path returned a listing" or "Server: nginx/1.18.0", which is
 * precisely the detail that turns a report into a lead for someone else.
 *
 * The asset list becomes a count for the same reason: "we saw mail.example.com
 * and vpn.example.com" is a map, and a map is worth more to an attacker than
 * to the owner, who already has one.
 */
export function redactWebsite(
  observation: WebsiteObservation,
): PublicWebsiteResult {
  const findings = observation.findings.map((finding) => ({
    id: finding.id,
    category: finding.category,
    severity: finding.severity,
    confidence: finding.confidence,
  }));
  const scored = surfaceScore(findings);

  return {
    findings: observation.findings.map((finding) => ({
      id: finding.id,
      category: finding.category,
      severity: finding.severity,
      confidence: finding.confidence,
    })),
    assets: [...observation.assets],
    lookalikes: observation.lookalikes.map((entry) => ({
      domain: entry.domain,
      hasMail: entry.hasMail,
    })),
    technologies: observation.technologies.map((entry) => ({
      id: entry.id,
      name: entry.name,
      category: entry.category,
      ...(entry.version === undefined ? {} : { version: entry.version }),
    })),
    score: scored.value,
    scoreBand: scored.band,
    limitations: [...observation.limitations],
  };
}

/**
 * The public risk band.
 *
 * Bands rather than a score, because a number implies a precision this data
 * does not have — and "72/100" invites an argument about the 72 instead of a
 * conversation about the finding. Confirmed findings are what move the band;
 * a pile of `possible` observations must not add up to "high", or the band
 * becomes a measure of how noisy the scan was.
 */
export function riskBand(
  findings: readonly { severity: string; confidence: string }[],
): "low" | "moderate" | "elevated" | "high" {
  const solid = findings.filter(
    (finding) =>
      finding.confidence === "confirmed" || finding.confidence === "high",
  );

  const high = solid.filter((finding) => finding.severity === "high").length;
  const medium = solid.filter(
    (finding) => finding.severity === "medium",
  ).length;

  if (high >= 2) return "high";
  if (high === 1) return "elevated";
  if (medium >= 2) return "elevated";
  if (medium === 1 || solid.length > 0) return "moderate";
  return "low";
}

/** A breach record as the verified subject may see it. */
export interface PrivateBreachRecord {
  source: string;
  /** Year and month only. A day is finer than the reader needs. */
  occurredAt?: string;
  dataTypes: string[];
  passwordExposed: boolean;
  phoneSuffix?: string;
  countryCode?: string;
  stealerLog: boolean;
  confidence: string;
}

export interface PrivateEmailResult {
  records: PrivateBreachRecord[];
  limitations: string[];
}

/** Two digits, or nothing. Anything longer is a phone number. */
function phoneSuffix(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 2) return undefined;
  return digits.slice(-2);
}

/** ISO 3166-1 alpha-2, or nothing. Never a city, region or coordinate. */
function countryCode(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const code = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : undefined;
}

/** Year and month. A breach date is not an appointment. */
function coarseDate(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const match = /^(\d{4})-(\d{2})/.exec(raw);
  if (match === null) return undefined;
  return `${match[1] ?? ""}-${match[2] ?? ""}`;
}

/*
 * Provider names are third-party text rendered in a customer's browser. They
 * are stripped of anything that could be markup and bounded in length here,
 * at the point they enter our data, rather than trusted to be escaped at every
 * later use. The frontend does not use dangerouslySetInnerHTML for any of
 * this, so this is defence in depth rather than the only guard.
 */
function safeSource(raw: string): string {
  return raw
    .replace(/[<>&"'`]/g, "")
    .trim()
    .slice(0, 120);
}

const ALLOWED_TYPES = new Set([
  "email",
  "password",
  "phone",
  "name",
  "address",
  "ip",
  "dob",
  "financial",
  "government_id",
]);

export function redactEmail(observation: EmailObservation): PrivateEmailResult {
  return {
    records: observation.records.map(
      (record: BreachRecord): PrivateBreachRecord => {
        // Computed once each: under `exactOptionalPropertyTypes` a second call
        // inside the spread is a fresh expression the compiler cannot narrow.
        const occurredAt = coarseDate(record.occurredAt);
        const suffix = phoneSuffix(record.phoneSuffix);
        const country = countryCode(record.countryCode);

        return {
          source: safeSource(record.source) || "Unnamed source",
          ...(occurredAt === undefined ? {} : { occurredAt }),
          // Filtered against our own closed set: an unexpected category from a
          // provider is dropped, not passed through to become an unknown key.
          dataTypes: record.dataTypes.filter((type) => ALLOWED_TYPES.has(type)),
          passwordExposed: record.passwordExposed,
          ...(suffix === undefined ? {} : { phoneSuffix: suffix }),
          ...(country === undefined ? {} : { countryCode: country }),
          stealerLog: record.stealerLog,
          confidence: record.confidence,
        };
      },
    ),
    limitations: [...observation.limitations],
  };
}

/**
 * The band for a personal report.
 *
 * Password exposure and infostealer logs dominate: they are the two findings
 * that lead directly to account takeover, and a report that rated them the
 * same as "your email address appeared in a newsletter dump" would be giving
 * bad advice politely.
 */
export function emailRiskBand(
  records: readonly PrivateBreachRecord[],
): "low" | "moderate" | "elevated" | "high" {
  if (records.length === 0) return "low";

  const stealer = records.some((record) => record.stealerLog);
  const passwords = records.filter((record) => record.passwordExposed).length;

  if (stealer) return "high";
  if (passwords >= 2) return "high";
  if (passwords === 1) return "elevated";
  if (records.length >= 3) return "elevated";
  return "moderate";
}
