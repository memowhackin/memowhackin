import { describe, expect, it } from "vitest";
import { isTakeoverCandidate } from "./dns.js";
import { analyseDmarc, analyseSpf } from "./email.js";
import { cspIsPermissive, frameProtected, hstsMaxAge } from "./http.js";

/*
 * The grading logic, which is where a scanner is honest or is not.
 *
 * Each of these functions decides whether a real domain gets told it has a
 * problem. Two failure modes matter and they are not symmetric: a false
 * positive costs someone an afternoon chasing nothing and costs us their
 * trust, and a false negative tells them they are fine when they are not.
 * The cases below are mostly the near-misses where a naive check gets it
 * wrong.
 */

describe("analyseSpf", () => {
  it("grades the policy rather than counting records", () => {
    // A record that exists but ends in ~all is the single most common way SPF
    // is present and useless. A presence check calls this a pass.
    expect(analyseSpf(["v=spf1 include:_spf.google.com ~all"]).qualifier).toBe(
      "softfail",
    );
    expect(analyseSpf(["v=spf1 include:_spf.google.com -all"]).qualifier).toBe(
      "reject",
    );
    expect(analyseSpf(["v=spf1 ?all"]).qualifier).toBe("neutral");
    // +all is worse than nothing: an explicit licence to impersonate.
    expect(analyseSpf(["v=spf1 +all"]).qualifier).toBe("pass");
  });

  it("reports absence rather than guessing", () => {
    const none = analyseSpf(["some-unrelated-txt-record", "v=DMARC1; p=none"]);
    expect(none.present).toBe(false);
    expect(none.qualifier).toBe("none");
  });

  it("counts only the mechanisms that cost a DNS lookup", () => {
    // ip4 and ip6 are free; include, a, mx, exists and redirect are not.
    expect(analyseSpf(["v=spf1 ip4:1.2.3.4 ip6:::1 -all"]).lookups).toBe(0);
    expect(
      analyseSpf([
        "v=spf1 include:a.com include:b.com a:c.com mx:d.com exists:e.com -all",
      ]).lookups,
    ).toBe(5);
  });

  it("notices a duplicate record, which voids both", () => {
    expect(
      analyseSpf(["v=spf1 include:a.com -all", "v=spf1 include:b.com -all"])
        .duplicate,
    ).toBe(true);
    expect(analyseSpf(["v=spf1 -all"]).duplicate).toBe(false);
  });

  it("is case-insensitive, as DNS text records are in practice", () => {
    expect(analyseSpf(["V=SPF1 INCLUDE:A.COM -ALL"]).qualifier).toBe("reject");
  });
});

describe("analyseDmarc", () => {
  it("distinguishes monitoring from enforcement", () => {
    expect(analyseDmarc(["v=DMARC1; p=none; rua=mailto:a@b.com"]).policy).toBe(
      "none",
    );
    expect(analyseDmarc(["v=DMARC1; p=quarantine"]).policy).toBe("quarantine");
    expect(analyseDmarc(["v=DMARC1; p=reject"]).policy).toBe("reject");
  });

  it("reads percentage and reporting", () => {
    const partial = analyseDmarc(["v=DMARC1; p=reject; pct=20"]);
    expect(partial.percent).toBe(20);
    expect(partial.hasReporting).toBe(false);

    const full = analyseDmarc(["v=DMARC1; p=reject; rua=mailto:dmarc@b.com"]);
    expect(full.percent).toBe(100);
    expect(full.hasReporting).toBe(true);
  });

  it("reads a separate subdomain policy", () => {
    expect(analyseDmarc(["v=DMARC1; p=reject; sp=none"]).subdomainPolicy).toBe(
      "none",
    );
    expect(
      analyseDmarc(["v=DMARC1; p=reject"]).subdomainPolicy,
    ).toBeUndefined();
  });

  it("ignores records that are not DMARC", () => {
    // The _dmarc name can hold other text; matching loosely would grade a
    // verification token as a mail policy.
    const report = analyseDmarc([
      "google-site-verification=abc",
      "v=spf1 -all",
    ]);
    expect(report.present).toBe(false);
    expect(report.policy).toBe("missing");
  });

  it("tolerates the spacing people actually publish", () => {
    expect(analyseDmarc(["v=DMARC1;p = reject ; pct = 100"]).policy).toBe(
      "reject",
    );
  });
});

describe("hstsMaxAge", () => {
  it("extracts the age, including when quoted or decorated", () => {
    expect(hstsMaxAge("max-age=31536000")).toBe(31_536_000);
    expect(hstsMaxAge("max-age=15768000; includeSubDomains; preload")).toBe(
      15_768_000,
    );
    expect(hstsMaxAge('max-age="600"')).toBe(600);
    expect(hstsMaxAge("MAX-AGE = 42")).toBe(42);
  });

  it("returns nothing when there is no usable age", () => {
    expect(hstsMaxAge(undefined)).toBeUndefined();
    expect(hstsMaxAge("includeSubDomains")).toBeUndefined();
  });
});

describe("cspIsPermissive", () => {
  it("treats unsafe-inline as no policy at all for script", () => {
    // The header being present is not the same as it doing anything.
    expect(cspIsPermissive("script-src 'self' 'unsafe-inline'")).toBe(true);
    expect(cspIsPermissive("default-src 'self' 'unsafe-inline'")).toBe(true);
    expect(cspIsPermissive("script-src *")).toBe(true);
  });

  it("accepts a policy that actually constrains script", () => {
    expect(cspIsPermissive("script-src 'self'")).toBe(false);
    expect(cspIsPermissive("script-src 'self' 'nonce-abc123'")).toBe(false);
    expect(cspIsPermissive("default-src 'none'; script-src 'self'")).toBe(
      false,
    );
  });

  it("does not fire on unsafe-inline in a directive where it is harmless", () => {
    // Inline styles are a different and much smaller problem; flagging them as
    // a script issue is a false positive.
    expect(
      cspIsPermissive("script-src 'self'; style-src 'self' 'unsafe-inline'"),
    ).toBe(false);
  });
});

describe("frameProtected", () => {
  it("accepts either mechanism", () => {
    expect(frameProtected("DENY", undefined)).toBe(true);
    expect(frameProtected("SAMEORIGIN", undefined)).toBe(true);
    // A modern policy with no legacy header is correct, and reporting it as a
    // finding is the classic false positive here.
    expect(frameProtected(undefined, "frame-ancestors 'none'")).toBe(true);
    expect(
      frameProtected(undefined, "default-src 'self'; frame-ancestors 'self'"),
    ).toBe(true);
  });

  it("reports genuinely unprotected responses", () => {
    expect(frameProtected(undefined, undefined)).toBe(false);
    expect(frameProtected(undefined, "default-src 'self'")).toBe(false);
    // ALLOW-FROM was never widely supported and is not protection.
    expect(frameProtected("ALLOW-FROM https://a.com", undefined)).toBe(false);
  });
});

describe("isTakeoverCandidate", () => {
  it("recognises platforms that hand out claimable subdomains", () => {
    expect(isTakeoverCandidate("myapp.herokuapp.com")).toBe(true);
    expect(isTakeoverCandidate("org.github.io")).toBe(true);
    expect(isTakeoverCandidate("bucket.s3.amazonaws.com")).toBe(true);
    // Trailing dot is legal DNS and the same name.
    expect(isTakeoverCandidate("thing.netlify.app.")).toBe(true);
  });

  it("ignores ordinary CNAME targets", () => {
    expect(isTakeoverCandidate("cdn.example.com")).toBe(false);
    expect(isTakeoverCandidate("example.com")).toBe(false);
    // A lookalike that merely contains the string must not match.
    expect(isTakeoverCandidate("github.io.evil.com")).toBe(false);
  });
});
