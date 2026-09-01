import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The second refusal to serve invented findings.
 *
 * `env.ts` already refuses to boot with `SCANNER_PROVIDER=fixture` under
 * `NODE_ENV=production`, and `env.test.ts` covers that. This is the other half:
 * even handed a configuration that should be impossible, the resolver must
 * still not hand fixtures out. Two independent refusals is the right number for
 * a failure whose shape is "we told a real company about vulnerabilities we
 * made up".
 *
 * That impossibility is why the environment is mocked rather than stubbed. The
 * combination cannot be produced through configuration — the first guard stops
 * the process before this code runs — so the only way to exercise this guard is
 * to simulate the first one having been loosened, which is precisely the day it
 * has to work.
 */

const envMock = vi.hoisted(() => ({
  env: { SCANNER_ENABLED: true, SCANNER_PROVIDER: "fixture" },
  isProduction: false,
}));

vi.mock("../../env.js", () => envMock);

const { resolveProviders } = await import("./index.js");

function configure(
  provider: "none" | "fixture" | "live",
  { production = false, enabled = true } = {},
) {
  envMock.env.SCANNER_ENABLED = enabled;
  envMock.env.SCANNER_PROVIDER = provider;
  envMock.isProduction = production;
}

beforeEach(() => {
  configure("fixture");
});

describe("resolveProviders", () => {
  it("refuses fixtures in production even when configured to serve them", () => {
    configure("fixture", { production: true });

    expect(resolveProviders()).toBeUndefined();
  });

  it("serves fixtures outside production, which is what they are for", () => {
    configure("fixture", { production: false });

    const providers = resolveProviders();
    expect(providers?.isFixture).toBe(true);
  });

  it("answers with nothing at all while the scanner is switched off", () => {
    configure("live", { enabled: false });

    expect(resolveProviders()).toBeUndefined();
  });

  it("treats `none` as no scanner rather than as a default", () => {
    configure("none");

    expect(resolveProviders()).toBeUndefined();
  });

  /*
   * A live website scan is real. The breach-data feed behind an email scan does
   * not exist yet, and pairing a genuine website report with invented personal
   * exposure would be the same lie in a more convincing wrapper — so in
   * production the email side reports itself unavailable instead.
   */
  it("never pairs a live website scan with fixture personal data", async () => {
    configure("live", { production: true });

    const providers = resolveProviders();
    expect(providers?.isFixture).toBe(false);
    expect(providers?.email.name).toBe("unavailable");

    const answer = await providers?.email.scanEmail("someone@example.com");
    // "We did not look", never "we looked and found nothing".
    expect(answer).toEqual({ ok: false, failure: "unavailable" });
  });

  it("keeps the email fixture in development, where nothing is published", () => {
    configure("live", { production: false });

    const providers = resolveProviders();
    expect(providers?.isFixture).toBe(false);
    expect(providers?.email.name).not.toBe("unavailable");
  });
});
