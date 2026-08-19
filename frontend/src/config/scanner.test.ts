import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The scanner client, which is the only place the browser talks to the scan
 * API. The properties worth asserting here are about what it sends and what it
 * refuses to leak, not about happy-path plumbing.
 */

let fetchMock: ReturnType<typeof vi.fn>;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  vi.resetModules();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function load() {
  vi.doMock("@/config/locale", () => ({
    DEFAULT_LOCALE: "en",
    SITE_LOCALE: "nl",
  }));
  return import("@/config/scanner");
}

describe("state helpers", () => {
  it("classifies running and terminal states exhaustively", async () => {
    const { isRunning, isTerminal } = await load();

    for (const status of [
      "queued",
      "discovering",
      "analyzing",
      "correlating",
      "generating_report",
    ] as const) {
      expect(isRunning(status), status).toBe(true);
      expect(isTerminal(status), status).toBe(false);
    }

    for (const status of [
      "complete",
      "failed",
      "rate_limited",
      "expired",
      "email_verification_pending",
    ] as const) {
      expect(isTerminal(status), status).toBe(true);
      expect(isRunning(status), status).toBe(false);
    }
  });
});

describe("startScan", () => {
  it("never puts the subject in the URL", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ id: "abc", kind: "website", status: "queued" }, 201),
    );
    const { startScan } = await load();

    await startScan({
      kind: "website",
      subject: "example.com",
      marketingConsent: false,
    });

    // A domain in a query string lands in proxy logs and browser history; an
    // address there also lands in the referrer of every later asset request.
    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toBe("/api/public/scanner/scans");
    expect(url).not.toContain("example.com");
  });

  it("sends the build's language so the mailed report matches the site", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "a" }, 201));
    const { startScan } = await load();

    await startScan({
      kind: "email",
      subject: "person@example.com",
      marketingConsent: true,
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const raw = typeof init.body === "string" ? init.body : "";
    const body: unknown = JSON.parse(raw);
    expect(body).toMatchObject({
      kind: "email",
      subject: "person@example.com",
      locale: "nl",
      marketingConsent: true,
    });
  });

  it("returns nothing for an email scan, so no id can be correlated", async () => {
    // A 202 with no id is what makes the response identical for an address
    // with exposure and one without.
    fetchMock.mockResolvedValue(
      jsonResponse({ status: "email_verification_pending" }, 202),
    );
    const { startScan } = await load();

    const result = await startScan({
      kind: "email",
      subject: "person@example.com",
      marketingConsent: false,
    });

    expect(result).toBeUndefined();
  });

  it("maps server failures onto codes the UI can translate", async () => {
    const { startScan, ScannerError } = await load();
    const cases: [number, unknown, string][] = [
      [429, {}, "rate_limited"],
      [503, {}, "unavailable"],
      [410, {}, "expired"],
      [404, {}, "not_found"],
      [500, {}, "network"],
    ];

    for (const [status, body, code] of cases) {
      fetchMock.mockResolvedValueOnce(jsonResponse(body, status));
      await expect(
        startScan({
          kind: "website",
          subject: "x.com",
          marketingConsent: false,
        }),
      ).rejects.toMatchObject({ code });
    }

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "invalid_subject", reason: "ip_not_allowed" }, 400),
    );
    await expect(
      startScan({
        kind: "website",
        subject: "1.1.1.1",
        marketingConsent: false,
      }),
    ).rejects.toMatchObject({
      code: "invalid_subject",
      reason: "ip_not_allowed",
    });

    expect(new ScannerError("network")).toBeInstanceOf(Error);
  });

  it("turns a dropped connection into a typed error, not a crash", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const { startScan } = await load();

    await expect(
      startScan({ kind: "website", subject: "x.com", marketingConsent: false }),
    ).rejects.toMatchObject({ code: "network" });
  });
});

describe("readScan", () => {
  it("reads results without trusting the payload's shape", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: "abc",
        kind: "website",
        status: "complete",
        riskBand: "elevated",
        result: {
          findings: [
            {
              id: "missing_csp",
              category: "headers",
              severity: "medium",
              confidence: "confirmed",
            },
            { nonsense: true },
          ],
          assetCount: 3,
          limitations: ["point_in_time", 42],
        },
        partial: false,
      }),
    );
    const { readScan } = await load();

    const scan = await readScan("abc");
    expect(scan.status).toBe("complete");
    expect(scan.riskBand).toBe("elevated");
    // Entries that are not findings are dropped rather than rendered as
    // undefined-shaped cards.
    expect(scan.websiteResult?.findings).toHaveLength(1);
    expect(scan.websiteResult?.limitations).toEqual(["point_in_time"]);
  });

  it("falls back to a safe status for an unknown one", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ id: "a", kind: "website", status: "something_new" }),
    );
    const { readScan } = await load();

    // Unknown means "we cannot show progress for this", which is closer to
    // failed than to complete. Guessing complete would render an empty report.
    expect((await readScan("a")).status).toBe("failed");
  });

  it("rejects an unparseable risk band rather than passing it through", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: "a",
        kind: "website",
        status: "complete",
        riskBand: "critical",
      }),
    );
    const { readScan } = await load();

    expect((await readScan("a")).riskBand).toBeNull();
  });
});

describe("redeemReport", () => {
  it("posts the token in the body, never the URL", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: "a",
        kind: "email",
        status: "complete",
        result: { records: [], limitations: [] },
      }),
    );
    const { redeemReport } = await load();

    await redeemReport("secret-token-value");

    const url = String(fetchMock.mock.calls[0]?.[0]);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const sent = typeof init.body === "string" ? init.body : "";
    expect(url).toBe("/api/public/scanner/reports/redeem");
    expect(url).not.toContain("secret-token-value");
    expect(sent).toContain("secret-token-value");
    expect(init.method).toBe("POST");
  });
});
