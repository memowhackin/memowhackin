import { describe, expect, it } from "vitest";
import { validateDomain, validateEmail } from "./validate";

/*
 * The browser-side mirror of the server's rules. These assert that the field
 * agrees with the server on the obvious cases — a message that says "looks
 * fine" followed by a server rejection is worse than no message at all — and,
 * more importantly, that it does not refuse things the server accepts.
 */

const domainOk = (raw: string) => validateDomain(raw).ok;
const emailOk = (raw: string) => validateEmail(raw).ok;

function domainError(raw: string): string | undefined {
  const result = validateDomain(raw);
  return result.ok ? undefined : result.error;
}

describe("validateDomain", () => {
  it("accepts the shapes people paste", () => {
    for (const value of [
      "example.com",
      "  Example.COM ",
      "https://example.com",
      "http://example.com/pricing?a=b#c",
      "www.example.com",
      "a.b.example.co.uk",
      "example.com:8443",
      "example.com.",
    ]) {
      expect(domainOk(value), value).toBe(true);
    }
  });

  it("accepts internationalized names it cannot itself punycode", () => {
    // The browser has no reliable IDNA table, and the server converts
    // properly. Rejecting here would block a valid domain over our own
    // inability to spell it.
    expect(domainOk("bücher.de")).toBe(true);
    expect(domainOk("münchen.example.de")).toBe(true);
  });

  it("refuses what the server also refuses, with the same reason", () => {
    expect(domainError("")).toBe("empty");
    expect(domainError("localhost")).toBe("public_suffix_only");
    expect(domainError("127.0.0.1")).toBe("ip_not_allowed");
    expect(domainError("[::1]")).toBe("ip_not_allowed");
    expect(domainError("::1")).toBe("ip_not_allowed");
    expect(domainError("file:///etc/passwd")).toBe("unsupported_scheme");
    expect(domainError("ftp://example.com")).toBe("unsupported_scheme");
    expect(domainError("example..com")).toBe("invalid_domain");
    expect(domainError("-example.com")).toBe("invalid_domain");
  });
});

describe("validateEmail", () => {
  it("accepts ordinary and unusual-but-valid addresses", () => {
    for (const value of [
      "name@company.com",
      "first.last@sub.company.co.uk",
      "user+tag@example.com",
      "a@b.co",
      "user_name-1@example-host.com",
      "naam@bücher.de",
    ]) {
      expect(emailOk(value), value).toBe(true);
    }
  });

  it("refuses what is definitely not an address", () => {
    for (const value of [
      "",
      "no-at-sign",
      "@example.com",
      "user@",
      "user@localhost",
      "user name@example.com",
      "user@example..com",
      "a@b.com, c@d.com",
      "user@example.com\nBcc: victim@example.com",
    ]) {
      expect(emailOk(value), value).toBe(false);
    }
  });
});
