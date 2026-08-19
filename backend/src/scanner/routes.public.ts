import { and, desc, eq, gt } from "drizzle-orm";
import { Router, type Request, type Response } from "express";
import rateLimit, { ipKeyGenerator, MemoryStore } from "express-rate-limit";
import { z } from "zod";
import { db } from "../db/client.js";
import { scans, type Scan } from "../db/schema.js";
import { env } from "../env.js";
import { uuidParam } from "../http/params.js";
import { logger } from "../logger.js";
import { decrypt, encrypt, subjectDigest } from "./crypto.js";
import { sendReportMail } from "./mail.js";
import { normalizeSubject } from "./normalize.js";
import { resolveProviders } from "./providers/index.js";
import { runEmailScan, runWebsiteScan } from "./run.js";
import { issueAccessToken, redeemAccessToken } from "./tokens.js";
import {
  emailReport,
  scanStatus,
  websiteReport,
  type ScanStatusResponse,
} from "./serialize.js";
import type { StoredEmailResult, StoredWebsiteResult } from "./run.js";

/*
 * The scanner's public surface.
 *
 * Mounted under /api/public alongside the blog reads, but with materially
 * different rules, so the differences are stated once here rather than implied
 * per handler:
 *
 *   - Nothing is cacheable. Every response carries `no-store`, because a
 *     report cached by an intermediary or a shared browser is a report handed
 *     to whoever sits down next.
 *   - Nothing is indexable. `X-Robots-Tag: noindex, nofollow` on every
 *     response, so a leaked link cannot become a search result.
 *   - The subject never appears in a URL, a response body, or a log line.
 *   - Website scans are readable by whoever holds the id. Email scans are not
 *     readable at all until a mailed token is redeemed.
 */

export const scannerRouter: Router = Router();

scannerRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});

/*
 * Each limiter keeps a handle on its own store, so the integration suite can
 * clear counters between cases.
 *
 * This is not a way to switch the limits off: the middleware, its window and
 * its ceiling are exactly the same in tests as in production, and one test
 * deliberately exhausts a limit to prove it bites. What the handle avoids is
 * the alternative — lowering a real limit, or skipping the limiter under
 * NODE_ENV, both of which would mean the thing running in production is not
 * the thing that was tested.
 */
const stores = {
  create: new MemoryStore(),
  poll: new MemoryStore(),
  redeem: new MemoryStore(),
};

/** Test-only. Clears the counters without altering any limit. */
export function resetScannerRateLimits(): void {
  for (const store of Object.values(stores)) void store.resetAll?.();
}

/*
 * Creation is the expensive path — it resolves DNS and calls a paid provider —
 * so it is capped far below the blog's read limit. Keyed on IP alone, since
 * there is no account: keying on the submitted subject would let one attacker
 * exhaust a victim domain's quota and deny the owner a scan.
 */
const createLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: stores.create,
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? ""),
  message: { error: "rate_limited" },
});

/** Polling is cheap but unbounded by nature, so it gets its own looser cap. */
const pollLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: stores.poll,
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? ""),
  message: { error: "rate_limited" },
});

/*
 * Redemption is a guessing target, so it is the tightest of the three. A token
 * is 32 random bytes and cannot be guessed, but the limit bounds the attempt
 * rate anyway rather than relying on that alone.
 */
const redeemLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  store: stores.redeem,
  keyGenerator: (req: Request) => ipKeyGenerator(req.ip ?? ""),
  message: { error: "rate_limited" },
});

/*
 * `.strict()` for the same reason the blog's input schema uses it: without it
 * a caller can post `status`, `riskBand` or `verifiedAt` and have them spread
 * into the row. Every one of those is a field that would let someone mark
 * their own scan verified.
 */
const createInput = z
  .object({
    kind: z.enum(["website", "email"]),
    // Bounded here as well as in `normalize`, so an oversized body is refused
    // before any parsing work happens.
    subject: z.string().min(1).max(2048),
    locale: z
      .string()
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/)
      .default("en"),
    marketingConsent: z.boolean().default(false),
  })
  .strict();

function ttlExpiry(): Date {
  return new Date(Date.now() + env.SCANNER_REPORT_TTL_HOURS * 60 * 60 * 1000);
}

/** Uniform "we accepted your request" answer for the email flow. */
function neutralEmailResponse(res: Response): void {
  res.status(202).json({ status: "email_verification_pending" });
}

scannerRouter.get("/availability", (_req, res) => {
  // Lets the page render an honest disabled state instead of a form that
  // always fails.
  res.json({ available: resolveProviders() !== undefined });
});

scannerRouter.post("/scans", createLimiter, async (req, res) => {
  const providers = resolveProviders();
  if (providers === undefined) {
    res.status(503).json({ error: "scanner_unavailable" });
    return;
  }

  const parsed = createInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const { kind, subject, locale, marketingConsent } = parsed.data;
  const normalized = normalizeSubject(kind, subject);
  if (!normalized.ok) {
    // The specific reason is returned so the field can say something useful.
    // It describes the input, which the caller already has, so it leaks
    // nothing they do not know.
    res
      .status(400)
      .json({ error: "invalid_subject", reason: normalized.error });
    return;
  }

  const digest = subjectDigest(normalized.value.kind, normalized.value.value);

  /*
   * Idempotent creation. Re-submitting the same subject within a short window
   * returns the scan already running rather than starting a second one: this
   * is what makes a double-click, a refresh, or a retry after a dropped
   * response harmless, and it stops one subject burning the provider quota.
   *
   * Website scans only. An email submission must always look identical from
   * the outside, and returning an existing scan id for one address but a new
   * one for another is a difference an enumerator can measure.
   */
  if (normalized.value.kind === "website") {
    const [existing] = await db
      .select()
      .from(scans)
      .where(
        and(
          eq(scans.subjectDigest, digest),
          gt(scans.createdAt, new Date(Date.now() - 5 * 60 * 1000)),
        ),
      )
      .orderBy(desc(scans.createdAt))
      .limit(1);

    if (existing !== undefined) {
      res.status(200).json(scanStatus(existing));
      return;
    }
  }

  const [row] = await db
    .insert(scans)
    .values({
      kind: normalized.value.kind,
      status: "queued",
      locale,
      subjectCipher: encrypt(normalized.value.value),
      subjectDigest: digest,
      marketingConsent,
      expiresAt: ttlExpiry(),
    })
    .returning();

  if (row === undefined) {
    res.status(500).json({ error: "internal_error" });
    return;
  }

  if (normalized.value.kind === "website") {
    /*
     * Started but not awaited: the HTTP response returns the id immediately
     * and the browser polls. Holding the request open for the length of a scan
     * would mean a proxy timeout is indistinguishable from a failure, and the
     * page could not survive a refresh.
     */
    void runWebsiteScan(row.id, normalized.value.value, providers);
    res.status(201).json(scanStatus(row));
    return;
  }

  /*
   * The email flow, and the reason it looks like this.
   *
   * Every submission gets the same 202 and the same body, whether or not the
   * address has any exposure, whether or not it is even deliverable. Any
   * observable difference — a different status, a different shape, a
   * measurably different response time — turns this endpoint into an oracle
   * for "does this person appear in a breach", which is a worse disclosure
   * than the report itself.
   *
   * The scan and the mail therefore both happen after the response is decided,
   * not before it.
   */
  const address = normalized.value.value;
  void (async () => {
    await runEmailScan(row.id, address, providers);
    const issued = await issueAccessToken(row.id);
    const link = `${env.SCANNER_PUBLIC_BASE_URL}/security-scan/report#${issued.token}`;
    await sendReportMail({
      to: address,
      locale,
      link,
      expiresAt: issued.expiresAt,
    });
  })().catch((error: unknown) => {
    logger.error({ err: error, scanId: row.id }, "email scan pipeline failed");
  });

  neutralEmailResponse(res);
});

/** Load a scan, treating expiry as absence. */
async function loadScan(id: string): Promise<Scan | undefined> {
  const [row] = await db.select().from(scans).where(eq(scans.id, id)).limit(1);
  return row;
}

function expired(scan: Scan): boolean {
  return scan.expiresAt.getTime() <= Date.now();
}

scannerRouter.get("/scans/:id", pollLimiter, async (req, res) => {
  const id = uuidParam(req, res, "id");
  if (id === undefined) return;

  const scan = await loadScan(id);
  if (scan === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  if (expired(scan)) {
    res.status(410).json({ error: "expired" });
    return;
  }

  /*
   * An email scan is never readable from its id. Returning even its status
   * would confirm that a scan exists for whatever address the holder of the id
   * guessed at, and the id is handed to the submitter — who may not be the
   * address owner. Personal results are unlocked only by the mailed token.
   */
  if (scan.kind === "email") {
    res.status(404).json({ error: "not_found" });
    return;
  }

  if (scan.status !== "complete" || scan.resultCipher === null) {
    const body: ScanStatusResponse = scanStatus(scan);
    res.json(body);
    return;
  }

  const document = readDocument<StoredWebsiteResult>(scan.resultCipher);
  if (document?.kind !== "website") {
    res.status(404).json({ error: "not_found" });
    return;
  }

  res.json(websiteReport(scan, document.result, document.partial));
});

/*
 * Redeem a mailed token and return the private report in the same response.
 *
 * A POST rather than a GET because it changes state — it spends the token —
 * and because a token in a query string ends up in proxy logs, browser
 * history and referrer headers. The frontend keeps it in the URL fragment,
 * which is never sent to a server, and posts it from there.
 */
const redeemInput = z.object({ token: z.string().min(1).max(128) }).strict();

scannerRouter.post("/reports/redeem", redeemLimiter, async (req, res) => {
  const parsed = redeemInput.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const redeemed = await redeemAccessToken(parsed.data.token);
  if (!redeemed.ok) {
    // One answer for "never existed", "already used" and "expired". Telling
    // them apart would confirm that a token was once valid.
    res.status(404).json({ error: "not_found" });
    return;
  }

  const scan = await loadScan(redeemed.scanId);
  if (scan === undefined || expired(scan)) {
    res.status(410).json({ error: "expired" });
    return;
  }

  if (scan.resultCipher === null) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const document = readDocument<StoredEmailResult>(scan.resultCipher);
  if (document?.kind !== "email") {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const [verified] = await db
    .update(scans)
    .set({ status: "complete", verifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(scans.id, scan.id))
    .returning();

  res.json(emailReport(verified ?? scan, document.result, document.partial));
});

/**
 * Decrypt and parse a stored document.
 *
 * Returns undefined on anything that does not decrypt or does not parse,
 * which the callers turn into a 404. A row whose ciphertext fails its
 * authentication tag has been tampered with or was written under a different
 * key; either way it is not a report to serve.
 */
function readDocument<T>(cipher: string): T | undefined {
  const plain = decrypt(cipher);
  if (plain === undefined) return undefined;

  try {
    return JSON.parse(plain) as T;
  } catch {
    return undefined;
  }
}

/** Terminal 404, matching the blog's public router. */
scannerRouter.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});
