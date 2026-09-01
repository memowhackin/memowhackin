import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The boot-time refusals.
 *
 * `env.ts` is the first of the two independent guards that stop invented
 * security findings reaching a real visitor — the second is in
 * `scanner/providers/index.ts`, which refuses to hand fixtures out even if this
 * one is ever loosened. Two refusals is the right number for a failure whose
 * shape is "we told a real company it had vulnerabilities we made up", and
 * until now neither of them had a test.
 *
 * The module throws from its top level, because a process that cannot be
 * configured correctly must not come up half-configured and start answering.
 * So each case stubs the environment, drops the module cache and asserts on the
 * import itself.
 */

const BASE: Record<string, string> = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  DB_NAME: "as_landing",
  DB_USER: "admin",
  DB_PASSWORD: "secret",
  ALLOWED_ORIGINS: "http://localhost:3000",
};

/** 32 bytes, the only length the scanner's encryption key may be. */
const KEY = Buffer.alloc(32, 7).toString("base64");

beforeEach(() => {
  vi.resetModules();
  // A stray value from the developer's own .env would decide the outcome.
  // Deleted rather than blanked: an empty string is a value, and these are
  // enums for which "" is simply a different way to be invalid.
  for (const name of Object.keys(process.env)) {
    if (name.startsWith("SCANNER_")) vi.stubEnv(name, undefined);
  }
  vi.stubEnv("NODE_ENV", "test");
  for (const [name, value] of Object.entries(BASE)) vi.stubEnv(name, value);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function withScanner(overrides: Record<string, string>) {
  const settings: Record<string, string> = {
    SCANNER_ENABLED: "true",
    SCANNER_PROVIDER: "live",
    SCANNER_MAIL_TRANSPORT: "log",
    SCANNER_ENCRYPTION_KEY: KEY,
    SCANNER_PUBLIC_BASE_URL: "https://assistsec.nl",
    ...overrides,
  };
  for (const [name, value] of Object.entries(settings)) vi.stubEnv(name, value);
  return import("./env.js");
}

describe("the fixture provider in production", () => {
  it("refuses to boot", async () => {
    await expect(
      withScanner({ NODE_ENV: "production", SCANNER_PROVIDER: "fixture" }),
    ).rejects.toThrow(/fixture data must never be served in production/);
  });

  it("is allowed outside production, where that is the point of it", async () => {
    const { env } = await withScanner({
      NODE_ENV: "development",
      SCANNER_PROVIDER: "fixture",
    });

    expect(env.SCANNER_PROVIDER).toBe("fixture");
  });

  it("still refuses when the scanner is switched on in production", async () => {
    // The guard must key on the provider, not on some proxy for "is this a
    // real deployment" that a future edit could make true in development.
    await expect(
      withScanner({
        NODE_ENV: "production",
        SCANNER_ENABLED: "true",
        SCANNER_PROVIDER: "fixture",
      }),
    ).rejects.toThrow(/Invalid environment/);
  });
});

describe("the scanner's required settings", () => {
  it("refuses a key that is not 32 bytes", async () => {
    await expect(
      withScanner({
        SCANNER_ENCRYPTION_KEY: Buffer.alloc(16).toString("base64"),
      }),
    ).rejects.toThrow(/SCANNER_ENCRYPTION_KEY/);
  });

  it("refuses a missing key rather than encrypting under an empty one", async () => {
    await expect(withScanner({ SCANNER_ENCRYPTION_KEY: "" })).rejects.toThrow(
      /SCANNER_ENCRYPTION_KEY/,
    );
  });

  it("refuses a base URL carrying a path, which would break report links", async () => {
    await expect(
      withScanner({ SCANNER_PUBLIC_BASE_URL: "https://assistsec.nl/reports" }),
    ).rejects.toThrow(/SCANNER_PUBLIC_BASE_URL/);
  });

  it("refuses `none` as a provider while the scanner is enabled", async () => {
    await expect(withScanner({ SCANNER_PROVIDER: "none" })).rejects.toThrow(
      /SCANNER_PROVIDER/,
    );
  });

  it("asks for none of it while the scanner is off", async () => {
    // The whole feature is a liability on a deployment that does not use it,
    // so its settings must not become required for everybody else.
    const { env } = await withScanner({
      SCANNER_ENABLED: "false",
      SCANNER_PROVIDER: "none",
      SCANNER_ENCRYPTION_KEY: "",
      SCANNER_PUBLIC_BASE_URL: "",
    });

    expect(env.SCANNER_ENABLED).toBe(false);
  });
});

describe("the environment it will boot with", () => {
  it("splits and trims the origin allowlist", async () => {
    vi.stubEnv(
      "ALLOWED_ORIGINS",
      "https://assistsec.nl, http://localhost:3000",
    );
    const { env } = await withScanner({});

    expect(env.allowedOrigins).toEqual([
      "https://assistsec.nl",
      "http://localhost:3000",
    ]);
  });

  it("never yields a wildcard origin, which is invalid with credentials", async () => {
    vi.stubEnv("ALLOWED_ORIGINS", "*");
    const { env } = await withScanner({});

    // A literal "*" is not a wildcard here — it is an origin that no browser
    // will ever send, so it fails closed rather than allowing everything.
    expect(env.allowedOrigins).toEqual(["*"]);
    expect(env.allowedOrigins).not.toContain("");
  });
});
