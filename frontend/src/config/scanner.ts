import { SITE_LOCALE } from "@/config/locale";

/*
 * The scanner's network surface — the third and last file in `src/` that talks
 * to the API, alongside `config/blog.ts` and `config/cms.ts`.
 *
 * Keeping it to one file is the point: the whole of what this site sends and
 * receives can be read in three places, which is what makes "does the browser
 * ever send the address anywhere else" a question with an answer.
 *
 * Two rules hold everywhere below.
 *
 * The submitted subject is never put in a URL, never written to storage, and
 * never logged. It exists in React state for as long as the form is on screen
 * and in the POST body once. A domain in a query string ends up in proxy logs
 * and browser history; an email address there ends up in both plus the
 * referrer header of every asset the next page loads.
 *
 * Nothing here validates as a security measure. The field checks below exist
 * so a person gets an answer without waiting for a round trip; the server
 * re-derives all of it and its answer is the one that counts.
 */

const API_BASE = (import.meta.env.VITE_CMS_API_URL ?? "").replace(/\/+$/, "");
const ROOT = `${API_BASE}/api/public/scanner`;

export type ScanKind = "website" | "email";

/**
 * Every state a scan can be in, mirroring the server's own vocabulary.
 *
 * `idle` and `validating` are the browser's alone — nothing exists server-side
 * yet — and the rest arrive from the API. Keeping them in one union means the
 * progress view is a total function of status rather than a pile of booleans
 * that can contradict each other.
 */
export type ScanStatus =
  | "idle"
  | "validating"
  | "queued"
  | "discovering"
  | "analyzing"
  | "correlating"
  | "generating_report"
  | "email_verification_pending"
  | "complete"
  | "failed"
  | "rate_limited"
  | "expired";

/** Statuses where work is still happening and polling should continue. */
const RUNNING: ReadonlySet<ScanStatus> = new Set<ScanStatus>([
  "queued",
  "discovering",
  "analyzing",
  "correlating",
  "generating_report",
]);

export function isRunning(status: ScanStatus): boolean {
  return RUNNING.has(status);
}

/** A terminal state: polling stops and the view is final. */
export function isTerminal(status: ScanStatus): boolean {
  return (
    status === "complete" ||
    status === "failed" ||
    status === "rate_limited" ||
    status === "expired" ||
    status === "email_verification_pending"
  );
}

export type Confidence = "confirmed" | "high" | "possible";
export type Severity = "info" | "low" | "medium" | "high";
export type RiskBand = "low" | "moderate" | "elevated" | "high";

export interface WebsiteFinding {
  id: string;
  category: string;
  severity: Severity;
  confidence: Confidence;
}

export interface LookalikeDomain {
  domain: string;
  hasMail: boolean;
}

export interface DetectedTechnology {
  id: string;
  name: string;
  category: string;
  /** Absent when the target did not state one; shown as N/A. */
  version?: string;
}

export interface EdgeProduct {
  id: string;
  name: string;
  /** A firewall inspects requests; a CDN only moves them closer. */
  kind: string;
  confidence: string;
}

export interface PublishedPath {
  path: string;
  kind: string;
  /** `protected` means it is there and guarded, which is its own answer. */
  state: string;
  contentType?: string;
  bytes?: number;
}

export interface SiteImage {
  /** Always absolute http(s); the server drops every other scheme. */
  url: string;
  kind: string;
  origin: string;
  contentType?: string;
  bytes?: number;
}

export interface WebsiteResult {
  findings: WebsiteFinding[];
  /** 0-100 over the observed public surface. */
  score: number;
  scoreBand: string;
  technologies: DetectedTechnology[];
  /** Edge products that announced themselves in their own headers. */
  waf: EdgeProduct[];
  /** Well-known files the site serves, and what its robots.txt names. */
  paths: {
    entries: PublishedPath[];
    disallowed: string[];
    securityTxt: boolean;
  };
  /** Images the homepage references, each verified to load. */
  images: SiteImage[];
  /** Hostnames seen in Certificate Transparency for this domain. */
  assets: string[];
  /** Third-party domains registered to resemble it. */
  lookalikes: LookalikeDomain[];
  limitations: string[];
}

export interface BreachRecord {
  source: string;
  occurredAt?: string;
  dataTypes: string[];
  passwordExposed: boolean;
  phoneSuffix?: string;
  countryCode?: string;
  stealerLog: boolean;
  confidence: Confidence;
}

export interface EmailResult {
  records: BreachRecord[];
  limitations: string[];
}

export interface ScanState {
  id: string;
  kind: ScanKind;
  status: ScanStatus;
  riskBand: RiskBand | null;
  failureCode: string | null;
  createdAt: string;
  expiresAt: string;
  /** Present once a website scan completes. */
  websiteResult?: WebsiteResult;
  /** Present once a private report is unlocked. */
  emailResult?: EmailResult;
  partial?: boolean;
}

/** Why a call failed, in terms the UI can translate. */
export type ScannerErrorCode =
  | "unavailable"
  | "rate_limited"
  | "invalid_subject"
  | "invalid_email"
  | "expired"
  | "not_found"
  | "network";

export class ScannerError extends Error {
  readonly code: ScannerErrorCode;
  /** Set for `invalid_subject`, naming which rule the input broke. */
  readonly reason?: string;

  constructor(code: ScannerErrorCode, reason?: string) {
    super(code);
    this.name = "ScannerError";
    this.code = code;
    if (reason !== undefined) this.reason = reason;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function statusOf(value: unknown): ScanStatus {
  const known: ScanStatus[] = [
    "queued",
    "discovering",
    "analyzing",
    "correlating",
    "generating_report",
    "email_verification_pending",
    "complete",
    "failed",
    "rate_limited",
    "expired",
  ];
  return known.find((entry) => entry === value) ?? "failed";
}

function toPaths(raw: unknown): WebsiteResult["paths"] {
  const empty = { entries: [], disallowed: [], securityTxt: false };
  if (!isRecord(raw)) return empty;

  return {
    entries: Array.isArray(raw.entries)
      ? raw.entries.filter(
          (entry): entry is PublishedPath =>
            isRecord(entry) && typeof entry.path === "string",
        )
      : [],
    disallowed: Array.isArray(raw.disallowed)
      ? raw.disallowed.filter(
          (entry): entry is string => typeof entry === "string",
        )
      : [],
    securityTxt: raw.securityTxt === true,
  };
}

/**
 * Read the image list, re-checking the scheme the server already checked.
 *
 * Every URL here ends up in an `<img src>`, so the one property that must hold
 * is that it cannot be `javascript:`. The server drops those before they are
 * stored and this drops them again on arrival — not because the server is
 * doubted, but because a rule enforced at both ends survives one end being
 * rewritten by someone who did not read this comment.
 */
function toImages(raw: unknown): SiteImage[] {
  if (!Array.isArray(raw)) return [];

  return raw.filter(
    (entry): entry is SiteImage =>
      isRecord(entry) &&
      typeof entry.url === "string" &&
      (entry.url.startsWith("https://") || entry.url.startsWith("http://")) &&
      typeof entry.origin === "string",
  );
}

/**
 * Build a `ScanState` from an API response.
 *
 * Written as explicit field reads rather than a cast, for the same reason the
 * server serializes explicitly: this is the boundary where untyped JSON
 * becomes typed data, and `as ScanState` would make the type a claim rather
 * than a check.
 */
function toScanState(payload: unknown): ScanState {
  if (!isRecord(payload)) throw new ScannerError("network");

  const id = typeof payload.id === "string" ? payload.id : "";
  const kind = payload.kind === "email" ? "email" : "website";
  const band = payload.riskBand;

  const state: ScanState = {
    id,
    kind,
    status: statusOf(payload.status),
    riskBand:
      band === "low" ||
      band === "moderate" ||
      band === "elevated" ||
      band === "high"
        ? band
        : null,
    failureCode:
      typeof payload.failureCode === "string" ? payload.failureCode : null,
    createdAt: typeof payload.createdAt === "string" ? payload.createdAt : "",
    expiresAt: typeof payload.expiresAt === "string" ? payload.expiresAt : "",
  };

  const result = payload.result;
  if (isRecord(result)) {
    if (kind === "website" && Array.isArray(result.findings)) {
      state.websiteResult = {
        findings: result.findings.filter(
          (entry): entry is WebsiteFinding =>
            isRecord(entry) && typeof entry.id === "string",
        ),
        assets: Array.isArray(result.assets)
          ? result.assets.filter(
              (entry): entry is string => typeof entry === "string",
            )
          : [],
        lookalikes: Array.isArray(result.lookalikes)
          ? result.lookalikes.filter(
              (entry): entry is LookalikeDomain =>
                isRecord(entry) && typeof entry.domain === "string",
            )
          : [],
        score: typeof result.score === "number" ? result.score : 0,
        scoreBand:
          typeof result.scoreBand === "string" ? result.scoreBand : "fair",
        technologies: Array.isArray(result.technologies)
          ? result.technologies.filter(
              (entry): entry is DetectedTechnology =>
                isRecord(entry) &&
                typeof entry.id === "string" &&
                typeof entry.name === "string",
            )
          : [],
        waf: Array.isArray(result.waf)
          ? result.waf.filter(
              (entry): entry is EdgeProduct =>
                isRecord(entry) &&
                typeof entry.id === "string" &&
                typeof entry.name === "string",
            )
          : [],
        paths: toPaths(result.paths),
        images: toImages(result.images),
        limitations: Array.isArray(result.limitations)
          ? result.limitations.filter(
              (entry): entry is string => typeof entry === "string",
            )
          : [],
      };
    }

    if (kind === "email" && Array.isArray(result.records)) {
      state.emailResult = {
        records: result.records.filter(
          (entry): entry is BreachRecord =>
            isRecord(entry) && typeof entry.source === "string",
        ),
        limitations: Array.isArray(result.limitations)
          ? result.limitations.filter(
              (entry): entry is string => typeof entry === "string",
            )
          : [],
      };
    }
  }

  if (typeof payload.partial === "boolean") state.partial = payload.partial;
  return state;
}

async function failureFor(response: Response): Promise<ScannerError> {
  if (response.status === 429) return new ScannerError("rate_limited");
  if (response.status === 410) return new ScannerError("expired");
  if (response.status === 503) return new ScannerError("unavailable");
  if (response.status === 404) return new ScannerError("not_found");

  if (response.status === 400) {
    const body: unknown = await response.json().catch(() => undefined);
    const reason =
      isRecord(body) && typeof body.reason === "string"
        ? body.reason
        : undefined;
    return new ScannerError("invalid_subject", reason);
  }

  return new ScannerError("network");
}

/** Whether the server has a provider configured at all. */
export async function scannerAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${ROOT}/availability`, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return false;

    const body: unknown = await response.json();
    return isRecord(body) && body.available === true;
  } catch {
    return false;
  }
}

export interface StartScanInput {
  kind: ScanKind;
  subject: string;
  marketingConsent: boolean;
}

/**
 * Start a scan.
 *
 * For a website this returns the scan to poll. For an email it resolves to
 * `undefined`, because the server's answer is deliberately the same for every
 * address and carries no id: the report is reachable only from the mailed
 * link. A caller that received an id here could tell a real address from a
 * fake one, which is the enumeration this design exists to prevent.
 */
export async function startScan(
  input: StartScanInput,
): Promise<ScanState | undefined> {
  let response: Response;
  try {
    response = await fetch(`${ROOT}/scans`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        kind: input.kind,
        subject: input.subject,
        // The build's language, so the mailed report matches the site the
        // person was reading.
        locale: SITE_LOCALE,
        marketingConsent: input.marketingConsent,
      }),
    });
  } catch {
    throw new ScannerError("network");
  }

  if (!response.ok) throw await failureFor(response);
  if (response.status === 202) return undefined;

  return toScanState(await response.json());
}

/** Read the current state of a website scan. */
export async function readScan(id: string): Promise<ScanState> {
  let response: Response;
  try {
    response = await fetch(`${ROOT}/scans/${encodeURIComponent(id)}`, {
      headers: { accept: "application/json" },
    });
  } catch {
    throw new ScannerError("network");
  }

  if (!response.ok) throw await failureFor(response);
  return toScanState(await response.json());
}

/**
 * Exchange a mailed token for the private report.
 *
 * The token travels in the POST body, never the URL. The page reads it from
 * the address fragment, which browsers do not send to servers, and clears it
 * from history immediately after.
 */
export async function redeemReport(token: string): Promise<ScanState> {
  let response: Response;
  try {
    response = await fetch(`${ROOT}/reports/redeem`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ token }),
    });
  } catch {
    throw new ScannerError("network");
  }

  if (!response.ok) throw await failureFor(response);
  return toScanState(await response.json());
}

/**
 * Record the lead that unlocked a report.
 *
 * The details a visitor gives to see the full report are posted here and stored
 * against the scan, so the sales team can see who asked. This is not a security
 * boundary — a website report is the visitor's own public exposure and the gate
 * is a lead wall, not a lock — so the caller reveals the report regardless and
 * this is best-effort capture.
 */
export async function submitLead(input: {
  scanId: string;
  name: string;
  company: string;
  position: string;
  email: string;
}): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${ROOT}/leads`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ScannerError("network");
  }

  if (!response.ok) throw await failureFor(response);
}

/*
 * Fetch a discovered site image so the browser can save it.
 *
 * This is the one request in the app that does not go to our own API: the URL
 * belongs to the scanned site, and it is fetched to turn the image into a blob
 * a download attribute can point at. It lives here rather than in the lightbox
 * component so that every outbound request in the frontend is still made from
 * one of three files, which is what keeps the network surface auditable.
 *
 * A third-party host that serves no CORS headers will reject this. That is not
 * an error worth surfacing — the caller falls back to opening the original in a
 * new tab, where the reader can save it themselves.
 */
export async function fetchImageBlob(url: string): Promise<Blob> {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new ScannerError("network");
  return response.blob();
}
