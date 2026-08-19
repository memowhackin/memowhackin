/*
 * The contract between the scanner and whatever actually looks things up.
 *
 * Providers are behind an interface for two reasons that are not "clean
 * architecture". First, credentials: an adapter runs on the server and holds
 * its own keys, so no integration can accidentally become a browser call.
 * Second, honesty: with one interface there is exactly one place that decides
 * whether real data is available, and a deployment without a provider returns
 * "unavailable" rather than something plausible.
 *
 * Everything a provider returns is treated as hostile. Provider output is
 * third-party text that lands in a report a customer reads, so it is escaped
 * on the way out and never interpolated into markup. Nothing here carries HTML.
 */

/** How sure the scanner is that a finding is real. Drives how it is shown. */
export type Confidence = "confirmed" | "high" | "possible";

/** Coarse severity. Deliberately not a 0-10 score we cannot justify. */
export type Severity = "info" | "low" | "medium" | "high";

/** Coarse public risk band. The only result field the CRM may receive. */
export type RiskBand = "low" | "moderate" | "elevated" | "high";

/**
 * One thing observed about a website.
 *
 * `category` and `id` are ours, from a closed set, so the UI can translate
 * them; provider prose never becomes UI copy. `evidence` is the only free text
 * and is redacted before storage.
 */
export interface WebsiteFinding {
  /** Stable key from our own catalogue, used as a translation key. */
  id: string;
  category:
    | "transport"
    | "headers"
    | "email_authentication"
    | "exposed_surface"
    | "software_disclosure"
    | "dns";
  severity: Severity;
  confidence: Confidence;
  /** Short, already-redacted supporting detail. May be empty. */
  evidence: string;
}

export interface WebsiteObservation {
  findings: WebsiteFinding[];
  /** Hostnames observed for this domain, from Certificate Transparency. */
  assets: string[];
  /** Third-party domains registered to resemble this one. */
  lookalikes: { domain: string; hasMail: boolean }[];
  /** What the site announces it is built on. */
  technologies: {
    id: string;
    name: string;
    category: string;
    version?: string;
  }[];
  /** What this run did not and could not look at. */
  limitations: string[];
}

/**
 * One exposure record for an email address.
 *
 * There is no password field of any kind, at any fidelity, by construction:
 * not a hash, not a fragment, not a masked form. The strongest statement the
 * type can make is `passwordExposed: boolean`. Likewise a phone number is only
 * ever its last two digits, and a location is only ever a country.
 */
export interface BreachRecord {
  /** The breached service's name, as published. Escaped on render. */
  source: string;
  /** ISO date (YYYY-MM-DD) when the breach occurred, if published. */
  occurredAt?: string;
  /** Closed-set categories, never raw provider strings. */
  dataTypes: (
    | "email"
    | "password"
    | "phone"
    | "name"
    | "address"
    | "ip"
    | "dob"
    | "financial"
    | "government_id"
  )[];
  passwordExposed: boolean;
  /** Last two digits only, when a phone number was in the record. */
  phoneSuffix?: string;
  /** ISO 3166-1 alpha-2, when network activity was attributed. */
  countryCode?: string;
  /** Whether the record came from infostealer malware logs. */
  stealerLog: boolean;
  confidence: Confidence;
}

export interface EmailObservation {
  records: BreachRecord[];
  limitations: string[];
}

/** Why a provider could not answer. Never a raw error or a URL. */
export type ProviderFailure =
  | "unavailable"
  | "timeout"
  | "rate_limited"
  | "blocked_target"
  | "invalid_target";

export type ProviderResult<T> =
  | { ok: true; value: T; partial: boolean }
  | { ok: false; failure: ProviderFailure };

export interface WebsiteProvider {
  readonly name: string;
  scanWebsite(domain: string): Promise<ProviderResult<WebsiteObservation>>;
}

export interface EmailProvider {
  readonly name: string;
  scanEmail(address: string): Promise<ProviderResult<EmailObservation>>;
}

export interface ScannerProviders {
  readonly website: WebsiteProvider;
  readonly email: EmailProvider;
  /** True when results are canned. Blocks anything that would mislead. */
  readonly isFixture: boolean;
}
