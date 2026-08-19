import { describe, expect, it } from "vitest";
import { normalizeDomain, normalizeEmail } from "./normalize.js";

/*
 * The input boundary. Every case here is either something a real person types
 * or something an attacker types, and the difference has to be decided before
 * anything else in the system sees the value.
 */

function domainOf(raw: string): string | undefined {
  const result = normalizeDomain(raw);
  return result.ok ? result.value.value : undefined;
}

function domainError(raw: string): string | undefined {
  const result = normalizeDomain(raw);
  return result.ok ? undefined : result.error;
}

describe("normalizeDomain", () => {
  it("reduces what people actually paste to the bare host", () => {
    expect(domainOf("example.com")).toBe("example.com");
    expect(domainOf("  Example.COM  ")).toBe("example.com");
    expect(domainOf("https://example.com")).toBe("example.com");
    expect(domainOf("http://example.com/pricing?ref=x#top")).toBe(
      "example.com",
    );
    expect(domainOf("www.example.com")).toBe("example.com");
    expect(domainOf("https://www.example.com/a/b/c")).toBe("example.com");
    // A trailing root dot is legal DNS and the same name.
    expect(domainOf("example.com.")).toBe("example.com");
    expect(domainOf("example.com:8443")).toBe("example.com");
    expect(domainOf("example.com/admin")).toBe("example.com");
  });

  it("drops credentials rather than carrying them", () => {
    // Receiving a password we never asked for is a secret we then have to be
    // careful with. It must not survive into storage or a log.
    expect(domainOf("https://user:pass@example.com/x")).toBe("example.com");
    expect(domainOf("user@example.com")).toBe("example.com");
    expect(domainOf("https://user:pass@example.com")).not.toContain("pass");
  });

  it("keeps deep subdomains but strips only a leading www", () => {
    expect(domainOf("a.b.example.co.uk")).toBe("a.b.example.co.uk");
    // Only the leading label goes; an inner "www" is part of the name.
    expect(domainOf("www.www.example.com")).toBe("www.example.com");
  });

  it("converts internationalized names to the form that gets resolved", () => {
    expect(domainOf("bücher.de")).toBe("xn--bcher-kva.de");
    expect(domainOf("https://BÜCHER.de/pfad")).toBe("xn--bcher-kva.de");
    // Two spellings of one name must normalize to one subject, or they are
    // two rate-limit buckets and two scans.
    expect(domainOf("bücher.de")).toBe(domainOf("xn--bcher-kva.de"));
  });

  it("refuses IP literals in every shape they arrive in", () => {
    expect(domainError("127.0.0.1")).toBe("ip_not_allowed");
    expect(domainError("http://127.0.0.1/")).toBe("ip_not_allowed");
    expect(domainError("169.254.169.254")).toBe("ip_not_allowed");
    expect(domainError("http://[::1]/")).toBe("ip_not_allowed");
    expect(domainError("[::ffff:127.0.0.1]")).toBe("ip_not_allowed");
    expect(domainError("::1")).toBe("ip_not_allowed");
  });

  it("refuses non-web schemes", () => {
    expect(domainError("file:///etc/passwd")).toBe("unsupported_scheme");
    expect(domainError("gopher://example.com")).toBe("unsupported_scheme");
    expect(domainError("ftp://example.com")).toBe("unsupported_scheme");
  });

  it("refuses single-label hosts, which is where localhost lives", () => {
    expect(domainError("localhost")).toBe("public_suffix_only");
    expect(domainError("intranet")).toBe("public_suffix_only");
    expect(domainError("http://localhost:8001")).toBe("public_suffix_only");
  });

  it("refuses malformed names", () => {
    expect(domainError("")).toBe("empty");
    expect(domainError("   ")).toBe("empty");
    expect(domainError("example..com")).toBe("invalid_domain");
    expect(domainError("-example.com")).toBe("invalid_domain");
    expect(domainError("example-.com")).toBe("invalid_domain");
    expect(domainError("example.1")).toBe("invalid_domain");
    expect(domainError(`${"a".repeat(3000)}.com`)).toBe("too_long");
  });

  it("bounds a label to 63 characters", () => {
    expect(domainOf(`${"a".repeat(63)}.com`)).toBe(`${"a".repeat(63)}.com`);
    expect(domainError(`${"a".repeat(64)}.com`)).toBe("invalid_domain");
  });
});

function emailOf(raw: string): string | undefined {
  const result = normalizeEmail(raw);
  return result.ok ? result.value.value : undefined;
}

function emailError(raw: string): string | undefined {
  const result = normalizeEmail(raw);
  return result.ok ? undefined : result.error;
}

describe("normalizeEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(emailOf("name@company.com")).toBe("name@company.com");
    expect(emailOf("  name@company.com ")).toBe("name@company.com");
    expect(emailOf("first.last@sub.company.co.uk")).toBe(
      "first.last@sub.company.co.uk",
    );
  });

  it("lowercases the domain but never the local part", () => {
    // RFC 5321 leaves the local part to the receiving server, and helpfully
    // lowercasing it is how mail to a case-sensitive mailbox stops arriving.
    expect(emailOf("Name@Company.COM")).toBe("Name@company.com");
    expect(emailOf("CASE@example.com")).toBe("CASE@example.com");
  });

  it("keeps plus tags, which are part of the address the person chose", () => {
    expect(emailOf("user+scan@example.com")).toBe("user+scan@example.com");
    expect(emailOf("user+a@example.com")).not.toBe(emailOf("user@example.com"));
  });

  it("does not reject unusual but valid addresses", () => {
    // Each of these is deliverable and has been broken by an over-strict
    // validator somewhere. Refusing a real address locks a person out.
    expect(emailOf("a@b.co")).toBe("a@b.co");
    expect(emailOf("user_name-1@example-host.com")).toBe(
      "user_name-1@example-host.com",
    );
    expect(emailOf("very.long.name.with.dots@example.museum")).toBeDefined();
    expect(emailOf("!#$%&*+-/=?^_`{|}~@example.com")).toBeDefined();
  });

  it("punycodes an internationalized domain", () => {
    expect(emailOf("naam@bücher.de")).toBe("naam@xn--bcher-kva.de");
  });

  it("refuses what is definitely not an address", () => {
    expect(emailError("")).toBe("empty");
    expect(emailError("no-at-sign")).toBe("invalid_email");
    expect(emailError("@example.com")).toBe("invalid_email");
    expect(emailError("user@")).toBe("invalid_email");
    expect(emailError("user@localhost")).toBe("invalid_email");
    expect(emailError("user name@example.com")).toBe("invalid_email");
    expect(emailError("user@example.com, other@example.com")).toBe(
      "invalid_email",
    );
    // Header injection through the address field.
    expect(emailError("user@example.com\nBcc: victim@example.com")).toBe(
      "invalid_email",
    );
    expect(emailError(`${"a".repeat(300)}@example.com`)).toBe("too_long");
  });
});
