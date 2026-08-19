import type { Scan } from "../db/schema.js";
import type { PrivateEmailResult, PublicWebsiteResult } from "./redact.js";

/*
 * Responses built by naming every field, following the same rule the blog
 * serializer states: a row spread into JSON leaks whatever column is added
 * next. Here that column would be `subjectCipher` or `resultCipher`, so the
 * cost of naming fields is lower than usual and the cost of not doing it is
 * higher.
 *
 * Note what is absent from every shape below: the subject. The domain or
 * address is never echoed back, not even to the caller who submitted it. They
 * already know what they typed, and not returning it means a leaked scan id
 * does not reveal who it was about.
 */

export interface ScanStatusResponse {
  id: string;
  kind: string;
  status: string;
  /** Present only once the scan finished. */
  riskBand: string | null;
  failureCode: string | null;
  createdAt: string;
  expiresAt: string;
}

export function scanStatus(scan: Scan): ScanStatusResponse {
  return {
    id: scan.id,
    kind: scan.kind,
    status: scan.status,
    riskBand: scan.riskBand ?? null,
    failureCode: scan.failureCode ?? null,
    createdAt: scan.createdAt.toISOString(),
    expiresAt: scan.expiresAt.toISOString(),
  };
}

export interface WebsiteReportResponse extends ScanStatusResponse {
  result: PublicWebsiteResult;
  partial: boolean;
}

export interface EmailReportResponse extends ScanStatusResponse {
  result: PrivateEmailResult;
  partial: boolean;
}

export function websiteReport(
  scan: Scan,
  result: PublicWebsiteResult,
  partial: boolean,
): WebsiteReportResponse {
  return { ...scanStatus(scan), result, partial };
}

export function emailReport(
  scan: Scan,
  result: PrivateEmailResult,
  partial: boolean,
): EmailReportResponse {
  return { ...scanStatus(scan), result, partial };
}
