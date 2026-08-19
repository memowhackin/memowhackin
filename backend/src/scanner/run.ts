import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { scans } from "../db/schema.js";
import { logger } from "../logger.js";
import { encrypt } from "./crypto.js";
import type { ScannerProviders } from "./providers/index.js";
import {
  emailRiskBand,
  redactEmail,
  redactWebsite,
  riskBand,
  type PrivateEmailResult,
  type PublicWebsiteResult,
} from "./redact.js";
import { resolvePublicAddress } from "./ssrf.js";

/*
 * Running a scan and recording where it got to.
 *
 * Status is written to the row as each stage begins, and the browser reads the
 * row. That is the whole progress mechanism, and it is deliberately not a
 * client-side timer counting through four captions: a fake progress bar that
 * finishes before the work does is a lie the user catches, and one that
 * finishes after is a lie they wait for.
 *
 * Failures are recorded as a coarse code, never a provider message. Whatever a
 * third party puts in an error string is not something to store and render.
 */

export type ScanStatus =
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

export type FailureCode =
  | "provider_unavailable"
  | "provider_timeout"
  | "target_blocked"
  | "target_unresolvable"
  | "internal";

async function setStatus(
  scanId: string,
  status: ScanStatus,
  extra: Partial<{ failureCode: FailureCode }> = {},
): Promise<void> {
  await db
    .update(scans)
    .set({
      status,
      updatedAt: new Date(),
      ...(extra.failureCode === undefined
        ? {}
        : { failureCode: extra.failureCode }),
    })
    .where(eq(scans.id, scanId));
}

/** The stored result document, before encryption. */
export interface StoredWebsiteResult {
  kind: "website";
  result: PublicWebsiteResult;
  partial: boolean;
}

export interface StoredEmailResult {
  kind: "email";
  result: PrivateEmailResult;
  partial: boolean;
}

/**
 * Run a website scan to completion.
 *
 * The SSRF check happens here, before the provider is asked for anything, and
 * its verdict is final: a domain that resolves to a private address is
 * refused rather than scanned. This function does not itself open a socket —
 * the provider does — which is why `resolvePublicAddress` returning an
 * approved literal matters. A provider that re-resolves the hostname would
 * reintroduce the rebinding window, and that is a constraint on any real
 * adapter added later.
 */
export async function runWebsiteScan(
  scanId: string,
  domain: string,
  providers: ScannerProviders,
): Promise<void> {
  try {
    await setStatus(scanId, "discovering");

    const verdict = await resolvePublicAddress(domain);
    if (!verdict.allowed) {
      await setStatus(scanId, "failed", {
        failureCode:
          verdict.reason === "unresolvable"
            ? "target_unresolvable"
            : "target_blocked",
      });
      return;
    }

    await setStatus(scanId, "analyzing");
    const observed = await providers.website.scanWebsite(domain);

    if (!observed.ok) {
      await setStatus(scanId, "failed", {
        failureCode:
          observed.failure === "timeout"
            ? "provider_timeout"
            : "provider_unavailable",
      });
      return;
    }

    await setStatus(scanId, "correlating");
    const result = redactWebsite(observed.value);

    await setStatus(scanId, "generating_report");
    const document: StoredWebsiteResult = {
      kind: "website",
      result,
      partial: observed.partial,
    };

    await db
      .update(scans)
      .set({
        status: "complete",
        resultCipher: encrypt(JSON.stringify(document)),
        riskBand: riskBand(result.findings),
        updatedAt: new Date(),
      })
      .where(eq(scans.id, scanId));
  } catch (error) {
    // The scan id is safe to log; the domain is not logged with it, so a log
    // reader cannot rebuild who scanned what.
    logger.error({ err: error, scanId }, "website scan failed");
    await setStatus(scanId, "failed", { failureCode: "internal" });
  }
}

/**
 * Run an email scan and store the result sealed.
 *
 * This runs *before* the address is verified, and the result is written
 * encrypted and left unreadable until a token is redeemed. Doing the work up
 * front means the report opens instantly when the link is clicked; keeping it
 * sealed means starting a scan for someone else's address tells you nothing.
 *
 * The status stays `email_verification_pending` on success rather than
 * becoming `complete`, because from the caller's point of view nothing has
 * completed: they have been sent a link.
 */
export async function runEmailScan(
  scanId: string,
  address: string,
  providers: ScannerProviders,
): Promise<void> {
  try {
    const observed = await providers.email.scanEmail(address);

    if (!observed.ok) {
      await setStatus(scanId, "failed", {
        failureCode:
          observed.failure === "timeout"
            ? "provider_timeout"
            : "provider_unavailable",
      });
      return;
    }

    const result = redactEmail(observed.value);
    const document: StoredEmailResult = {
      kind: "email",
      result,
      partial: observed.partial,
    };

    await db
      .update(scans)
      .set({
        status: "email_verification_pending",
        resultCipher: encrypt(JSON.stringify(document)),
        riskBand: emailRiskBand(result.records),
        updatedAt: new Date(),
      })
      .where(eq(scans.id, scanId));
  } catch (error) {
    logger.error({ err: error, scanId }, "email scan failed");
    await setStatus(scanId, "failed", { failureCode: "internal" });
  }
}
