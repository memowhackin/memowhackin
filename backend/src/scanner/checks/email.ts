import { Resolver } from "node:dns/promises";
import type { DnsFacts } from "./dns.js";

/*
 * Whether someone else can send mail that looks like it came from this domain.
 *
 * This is consistently the most valuable part of an external scan and the part
 * most often wrong in practice: SPF and DMARC are easy to publish and easy to
 * publish uselessly. A domain with `v=spf1 ~all` and `p=none` has both records
 * and neither protection, and a scanner that only checks for *presence* calls
 * that a pass.
 *
 * So each of these grades the policy rather than counting records.
 */

const TIMEOUT_MS = 4000;

const LOOKUP_MECHANISMS = /\b(include|a|mx|ptr|exists|redirect)[:=]/g;

export type SpfQualifier = "reject" | "softfail" | "neutral" | "pass" | "none";

export interface SpfReport {
  present: boolean;
  qualifier: SpfQualifier;
  /** Count of mechanisms that cost a DNS lookup, before recursion. */
  lookups: number;
  /** True when more than one SPF record exists, which is a permerror. */
  duplicate: boolean;
}

export function analyseSpf(txt: readonly string[]): SpfReport {
  const records = txt.filter((record) =>
    record.toLowerCase().startsWith("v=spf1"),
  );
  const record = records[0];

  if (record === undefined) {
    return { present: false, qualifier: "none", lookups: 0, duplicate: false };
  }

  const lower = record.toLowerCase();
  let qualifier: SpfQualifier = "neutral";
  if (lower.includes("-all")) qualifier = "reject";
  else if (lower.includes("~all")) qualifier = "softfail";
  else if (lower.includes("?all")) qualifier = "neutral";
  else if (lower.includes("+all")) qualifier = "pass";

  return {
    present: true,
    qualifier,
    lookups: (lower.match(LOOKUP_MECHANISMS) ?? []).length,
    duplicate: records.length > 1,
  };
}

export type DmarcPolicy = "reject" | "quarantine" | "none" | "missing";

export interface DmarcReport {
  present: boolean;
  policy: DmarcPolicy;
  /** Subdomain policy, when it differs from the main one. */
  subdomainPolicy?: DmarcPolicy;
  /** Percentage the policy is applied to. Below 100 is partial enforcement. */
  percent: number;
  /** Whether aggregate reports are collected anywhere. */
  hasReporting: boolean;
}

export function analyseDmarc(txt: readonly string[]): DmarcReport {
  const record = txt.find((entry) =>
    entry.toLowerCase().startsWith("v=dmarc1"),
  );

  if (record === undefined) {
    return {
      present: false,
      policy: "missing",
      percent: 0,
      hasReporting: false,
    };
  }

  const tag = (name: string): string | undefined =>
    new RegExp(`${name}\\s*=\\s*([^;\\s]+)`, "i")
      .exec(record)?.[1]
      ?.toLowerCase();

  const asPolicy = (value: string | undefined): DmarcPolicy => {
    if (value === "reject") return "reject";
    if (value === "quarantine") return "quarantine";
    if (value === "none") return "none";
    return "missing";
  };

  const sub = tag("sp");
  const percent = Number.parseInt(tag("pct") ?? "100", 10);

  return {
    present: true,
    policy: asPolicy(tag("p")),
    ...(sub === undefined ? {} : { subdomainPolicy: asPolicy(sub) }),
    percent: Number.isFinite(percent) ? percent : 100,
    hasReporting: tag("rua") !== undefined,
  };
}

/**
 * DMARC lives on a fixed subdomain rather than the apex, so it needs its own
 * lookup — reading the apex TXT records and hoping is a common bug.
 */
export async function lookupDmarc(domain: string): Promise<string[]> {
  const dns = new Resolver({ timeout: TIMEOUT_MS, tries: 2 });
  try {
    const records = await dns.resolveTxt(`_dmarc.${domain}`);
    return records.map((chunks) => chunks.join(""));
  } catch {
    return [];
  }
}

/**
 * MTA-STS, which is what stops a downgrade attack on inbound mail.
 *
 * Only the DNS record is checked, not the policy file. A published `_mta-sts`
 * TXT record without a reachable policy is a different and rarer fault, and
 * fetching the policy would be another request for a finding almost nobody
 * has yet.
 */
export async function hasMtaSts(domain: string): Promise<boolean> {
  const dns = new Resolver({ timeout: TIMEOUT_MS, tries: 2 });
  try {
    const records = await dns.resolveTxt(`_mta-sts.${domain}`);
    return records.some((chunks) =>
      chunks.join("").toLowerCase().startsWith("v=stsv1"),
    );
  } catch {
    return false;
  }
}

/*
 * DKIM selectors cannot be enumerated — they are chosen by whoever set up the
 * mail, and the only way to find one is to read a signed message. So this
 * probes the handful that the common providers use by default. A hit proves
 * DKIM is configured; a miss proves nothing at all, which is why the caller
 * reports the positive case only and never says "DKIM is missing".
 */
const COMMON_SELECTORS = [
  "google",
  "selector1",
  "selector2",
  "k1",
  "dkim",
  "mail",
  "default",
  "s1",
  "s2",
  "mandrill",
  "zoho",
];

export async function findDkimSelector(
  domain: string,
): Promise<string | undefined> {
  const dns = new Resolver({ timeout: TIMEOUT_MS, tries: 1 });

  const probes = COMMON_SELECTORS.map(async (selector) => {
    try {
      const records = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
      const joined = records.map((chunks) => chunks.join("")).join("");
      return joined.toLowerCase().includes("p=") ? selector : undefined;
    } catch {
      return undefined;
    }
  });

  const found = await Promise.all(probes);
  return found.find((selector) => selector !== undefined);
}

export interface EmailAuthReport {
  spf: SpfReport;
  dmarc: DmarcReport;
  mtaSts: boolean;
  dkimSelector?: string;
  /** Whether the domain is set up to receive mail at all. */
  acceptsMail: boolean;
}

export async function inspectEmailAuth(
  domain: string,
  facts: DnsFacts,
): Promise<EmailAuthReport> {
  const [dmarcTxt, mtaSts, dkimSelector] = await Promise.all([
    lookupDmarc(domain),
    hasMtaSts(domain),
    findDkimSelector(domain),
  ]);

  return {
    spf: analyseSpf(facts.txt),
    dmarc: analyseDmarc(dmarcTxt),
    mtaSts,
    ...(dkimSelector === undefined ? {} : { dkimSelector }),
    acceptsMail: facts.mx.length > 0,
  };
}
