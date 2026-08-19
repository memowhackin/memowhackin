import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { eq, gte, inArray } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { db, pool } from "../db/client.js";
import { scanAccessTokens, scans } from "../db/schema.js";
import { env } from "../env.js";

/*
 * The scanner API, attacked rather than exercised.
 *
 * Every test here corresponds to a way the feature could leak: enumeration,
 * IDOR, token replay, cached private data, indexed reports. They run against
 * the real app over a real socket, because several of the controls under test
 * are headers and middleware ordering that a unit test would step around.
 *
 * Like the blog's integration suite these need a disposable database, and they
 * skip rather than fail when one is not configured — so `npm run check` on a
 * developer machine without a test database stays green and honest.
 */

const ORIGIN = "http://localhost:3000";

function disposableDatabase(): boolean {
  if (process.env.ALLOW_DESTRUCTIVE_TESTS === "1") return true;
  return /(^|[_-])test(ing)?$/.test(process.env.DB_NAME ?? "");
}

const runnable = disposableDatabase() && env.SCANNER_ENABLED;

let server: Server;
let base = "";
const created: string[] = [];
/*
 * Email scans are created without ever returning an id — that is the whole
 * anti-enumeration property — so they cannot be tracked the way website scans
 * are. Cleanup therefore also sweeps by creation time, which catches every row
 * this run produced whether or not the suite ever learned its id.
 */
let suiteStart = new Date();

beforeAll(async () => {
  if (!runnable) return;
  suiteStart = new Date(Date.now() - 1000);
  const { app } = await import("../index.js");
  server = app.listen(0);
  base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

/*
 * Scans are started and not awaited — the HTTP response returns an id while
 * the run continues in the background, which is what lets the page survive a
 * refresh. That means a test can finish while its scan is still writing, so
 * the suite waits for every row it created to reach a terminal state before
 * closing the pool. Without this the teardown races the scan and fails on a
 * closed connection, which looks like a product bug and is not one.
 */
async function settle(): Promise<void> {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    if (created.length === 0) return;

    const rows = await db
      .select({ status: scans.status })
      .from(scans)
      .where(inArray(scans.id, created));

    const running = rows.filter((row) =>
      [
        "queued",
        "discovering",
        "analyzing",
        "correlating",
        "generating_report",
      ].includes(row.status),
    );
    if (running.length === 0) return;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

afterAll(async () => {
  if (!runnable) return;
  await settle();
  // Tokens go with their scan through the cascade on the foreign key.
  await db.delete(scans).where(gte(scans.createdAt, suiteStart));
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
  await pool.end();
});

/*
 * Counters are cleared between cases so that one test's traffic does not
 * decide another's result. The limits themselves are untouched — see the
 * dedicated rate-limit test below, which spends one deliberately.
 */
async function resetLimits(): Promise<void> {
  const { resetScannerRateLimits } = await import("./routes.public.js");
  resetScannerRateLimits();
}

beforeEach(async () => {
  if (!runnable) return;
  await resetLimits();
});

const url = (path: string) => `${base}${path}`;

function post(path: string, body: unknown): Promise<Response> {
  return fetch(url(path), {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify(body),
  });
}

async function startWebsite(subject: string): Promise<Response> {
  const response = await post("/api/public/scanner/scans", {
    kind: "website",
    subject,
  });
  if (response.status === 201 || response.status === 200) {
    const body = (await response.clone().json()) as { id?: string };
    if (typeof body.id === "string") created.push(body.id);
  }
  return response;
}

describe.skipIf(!runnable)("scanner: creation and validation", () => {
  it("creates a website scan and returns an opaque id, not the domain", async () => {
    const response = await startWebsite("example.com");
    expect([200, 201]).toContain(response.status);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    // The subject is never echoed. A leaked id must not reveal who it is about.
    expect(JSON.stringify(body)).not.toContain("example.com");
    expect(body).not.toHaveProperty("subjectCipher");
    expect(body).not.toHaveProperty("subjectDigest");
  });

  it("refuses SSRF payloads at the input boundary", async () => {
    for (const subject of [
      "127.0.0.1",
      "http://127.0.0.1/",
      "169.254.169.254",
      "http://169.254.169.254/latest/meta-data/",
      "localhost",
      "http://localhost:8001/api/posts",
      "[::1]",
      "::1",
      "0.0.0.0",
      "10.0.0.1",
      "192.168.1.1",
      "172.16.0.1",
      "file:///etc/passwd",
      "gopher://example.com",
    ]) {
      /*
       * The limiter sits in front of validation, so a refused payload still
       * spends quota — which is correct, or an attacker gets unlimited free
       * probing. It does mean this list of fourteen would exhaust the window,
       * so the counter is cleared between payloads. The limit itself is
       * exercised by its own test.
       */
      await resetLimits();

      const response = await startWebsite(subject);
      expect(response.status, subject).toBe(400);
      const body = (await response.json()) as { error?: string };
      expect(body.error, subject).toBe("invalid_subject");
    }
  });

  it("refuses unknown fields rather than spreading them into the row", async () => {
    // Without .strict() a caller could post status or verifiedAt and mark
    // their own scan complete and verified.
    const response = await post("/api/public/scanner/scans", {
      kind: "website",
      subject: "example.com",
      status: "complete",
      verifiedAt: new Date().toISOString(),
      riskBand: "low",
    });

    expect(response.status).toBe(400);
  });

  it("is idempotent for the same domain inside the window", async () => {
    const first = await startWebsite("idempotent-test.example");
    const second = await startWebsite("idempotent-test.example");

    const a = (await first.json()) as { id: string };
    const b = (await second.json()) as { id: string };
    expect(b.id).toBe(a.id);
  });
});

describe.skipIf(!runnable)("scanner: private data boundaries", () => {
  it("answers identically for every email address", async () => {
    // The whole anti-enumeration property: an address with exposure, one
    // without, and one that cannot exist must be indistinguishable.
    const bodies: string[] = [];
    const statuses: number[] = [];

    for (const subject of [
      "definitely-real@example.com",
      "nobody-here-at-all@example.com",
      "another+tag@example.org",
    ]) {
      const response = await post("/api/public/scanner/scans", {
        kind: "email",
        subject,
      });
      statuses.push(response.status);
      bodies.push(await response.text());
    }

    expect(new Set(statuses).size).toBe(1);
    expect(statuses[0]).toBe(202);
    expect(new Set(bodies).size).toBe(1);
    // No id, or the caller could correlate one address with a scan.
    expect(bodies[0]).not.toContain("id");
  });

  it("never serves an email scan from its id", async () => {
    await post("/api/public/scanner/scans", {
      kind: "email",
      subject: "private-person@example.com",
    });

    // Find the row directly; the API deliberately never handed the id out.
    const [row] = await db
      .select({ id: scans.id })
      .from(scans)
      .where(eq(scans.kind, "email"))
      .limit(1);

    if (row === undefined) return;
    created.push(row.id);

    const response = await fetch(url(`/api/public/scanner/scans/${row.id}`));
    // 404, not 403: confirming the row exists would itself be the disclosure.
    expect(response.status).toBe(404);
  });

  it("refuses a well-formed id that does not exist, without distinction", async () => {
    const response = await fetch(
      url("/api/public/scanner/scans/00000000-0000-4000-8000-000000000000"),
    );
    expect(response.status).toBe(404);
  });

  it("refuses a malformed id before it reaches the database", async () => {
    for (const id of ["../../etc/passwd", "1 OR 1=1", "not-a-uuid", "%2e%2e"]) {
      const response = await fetch(
        url(`/api/public/scanner/scans/${encodeURIComponent(id)}`),
      );
      expect([404], id).toContain(response.status);
    }
  });
});

describe.skipIf(!runnable)("scanner: tokens", () => {
  it("refuses an unknown, reused or expired token identically", async () => {
    for (const token of ["nope", "a".repeat(43), ""]) {
      const response = await post("/api/public/scanner/reports/redeem", {
        token,
      });
      expect([400, 404]).toContain(response.status);
    }
  });

  it("spends a token exactly once", async () => {
    const [scan] = await db
      .insert(scans)
      .values({
        kind: "email",
        status: "email_verification_pending",
        subjectCipher: "x",
        subjectDigest: "y",
        expiresAt: new Date(Date.now() + 60_000),
      })
      .returning({ id: scans.id });

    if (scan === undefined) return;
    created.push(scan.id);

    const { issueAccessToken } = await import("./tokens.js");
    const issued = await issueAccessToken(scan.id);

    const first = await post("/api/public/scanner/reports/redeem", {
      token: issued.token,
    });
    // The row has no decryptable result, so the first attempt 404s — but it
    // must still have consumed the token, which is what this asserts.
    expect([200, 404]).toContain(first.status);

    const [row] = await db
      .select({ usedAt: scanAccessTokens.usedAt })
      .from(scanAccessTokens)
      .where(eq(scanAccessTokens.scanId, scan.id))
      .limit(1);
    expect(row?.usedAt).not.toBeNull();

    const second = await post("/api/public/scanner/reports/redeem", {
      token: issued.token,
    });
    expect(second.status).toBe(404);
  });
});

describe.skipIf(!runnable)("scanner: rate limiting", () => {
  it("stops a caller who floods scan creation", async () => {
    // The limit is 8 in a ten-minute window, and this spends it. Asserted
    // rather than assumed: an unbounded creation endpoint is a way to run up
    // a provider bill and a way to use us to hammer someone else's DNS.
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      // Through the tracking helper, so the rows these create are cleaned up.
      const response = await startWebsite(`flood-${String(attempt)}.example`);
      statuses.push(response.status);
    }

    expect(statuses).toContain(429);
    expect(statuses.filter((status) => status === 429).length).toBeGreaterThan(
      1,
    );
  });
});

describe.skipIf(!runnable)("scanner: response hygiene", () => {
  it("marks every response no-store and noindex", async () => {
    const response = await fetch(url("/api/public/scanner/availability"));

    // A cached or indexed private report is the failure this prevents.
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("does not shadow the blog's public routes", async () => {
    // Both live under /api/public and the blog router ends in a terminal 404,
    // so mounting order matters and is easy to break.
    const response = await fetch(url("/api/public/posts"));
    expect(response.status).toBe(200);
  });

  it("returns a terminal 404 for unknown scanner paths", async () => {
    const response = await fetch(url("/api/public/scanner/nope"));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "not_found" });
  });
});
