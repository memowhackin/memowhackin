import { describe, expect, it } from "vitest";
import type {
  EmailObservation,
  WebsiteObservation,
} from "./providers/types.js";
import {
  emailRiskBand,
  redactEmail,
  redactWebsite,
  riskBand,
} from "./redact.js";

/*
 * What must never leave the server.
 *
 * These assert absence, which is the awkward kind of test to write and the
 * only kind that catches a field quietly added to a type later. A serialized
 * scan of the whole payload is used rather than field-by-field checks, so a
 * new leaking property fails here without anyone remembering to test it.
 */

const websiteObservation: WebsiteObservation = {
  findings: [
    {
      id: "directory_listing",
      category: "exposed_surface",
      severity: "medium",
      confidence: "possible",
      evidence: "GET /backup/ returned an index listing with 42 entries",
    },
    {
      id: "server_version_disclosed",
      category: "software_disclosure",
      severity: "low",
      confidence: "high",
      evidence: "Server: nginx/1.18.0 (Ubuntu)",
    },
  ],
  assets: ["example.com", "vpn.example.com", "staging.example.com"],
  lookalikes: [
    { domain: "exarnple.com", hasMail: true },
    { domain: "example.net", hasMail: false },
  ],
  technologies: [
    { id: "nginx", name: "nginx", category: "server", version: "1.18.0" },
    { id: "cloudflare", name: "Cloudflare", category: "cdn" },
  ],
  waf: [
    {
      id: "cloudflare",
      name: "Cloudflare",
      kind: "waf",
      confidence: "confirmed",
    },
  ],
  paths: {
    entries: [
      {
        path: "/robots.txt",
        kind: "crawler",
        state: "found",
        contentType: "text/plain",
        bytes: 210,
      },
    ],
    disallowed: ["/admin/"],
    listings: ["/backup/"],
    securityTxt: false,
  },
  images: [
    {
      url: "https://example.com/logo.svg",
      kind: "logo",
      origin: "example.com",
      contentType: "image/svg+xml",
    },
  ],
  limitations: ["unauthenticated_only"],
};

describe("redactWebsite", () => {
  it("removes evidence, which is the attack-enabling detail", () => {
    const redacted = redactWebsite(websiteObservation);
    const serialized = JSON.stringify(redacted);

    // The readable path and the operating system came from an evidence
    // string, and both are gone with it.
    expect(serialized).not.toContain("/backup/");
    expect(serialized).not.toContain("Ubuntu");
    expect(serialized).not.toContain("evidence");
  });

  it("keeps the detected stack, which is a different thing from evidence", () => {
    const redacted = redactWebsite(websiteObservation);

    /*
     * A product name and version reported here is not a leak: the target
     * announced it in a header to every visitor, and naming it back is the
     * point of the stack list. What stays stripped is the surrounding
     * evidence — the path that was readable, the operating system in the
     * banner — because none of that is volunteered to a browser.
     */
    expect(redacted.technologies).toEqual([
      { id: "nginx", name: "nginx", category: "server", version: "1.18.0" },
      { id: "cloudflare", name: "Cloudflare", category: "cdn" },
    ]);
  });

  it("publishes the hosts, which came from a public log to begin with", () => {
    const redacted = redactWebsite(websiteObservation);

    // These were read out of Certificate Transparency, which anyone can query.
    // Withholding them protected nobody and removed the most useful thing on
    // the page. Evidence stays redacted; that is the line that matters.
    expect(redacted.assets).toEqual([
      "example.com",
      "vpn.example.com",
      "staging.example.com",
    ]);
  });

  it("publishes paths the site chose to serve, never ones it left open", () => {
    const redacted = redactWebsite(websiteObservation);

    /*
     * The whole distinction in one assertion. robots.txt is handed to every
     * crawler that asks and its Disallow list is world-readable by design, so
     * echoing it back discloses nothing new. An index at /backup/ is an
     * accident, and naming it to a caller who has not proved they own the
     * domain is the single detail that shortens a stranger's work — so it
     * reaches the owner as a finding, and the path dies with `evidence`.
     */
    expect(redacted.paths.entries.map((entry) => entry.path)).toEqual([
      "/robots.txt",
    ]);
    expect(redacted.paths.disallowed).toEqual(["/admin/"]);
    expect(JSON.stringify(redacted)).not.toContain("listings");
  });

  it("publishes the edge the site announced in its own headers", () => {
    const redacted = redactWebsite(websiteObservation);

    // Every visitor to a Cloudflare site receives the same `cf-ray` header we
    // read this from. Naming it back is not disclosure.
    expect(redacted.waf).toEqual([
      {
        id: "cloudflare",
        name: "Cloudflare",
        kind: "waf",
        confidence: "confirmed",
      },
    ]);
  });

  it("publishes homepage images, which the site already serves to everyone", () => {
    const redacted = redactWebsite(websiteObservation);

    expect(redacted.images).toEqual([
      {
        url: "https://example.com/logo.svg",
        kind: "logo",
        origin: "example.com",
        contentType: "image/svg+xml",
      },
    ]);
  });

  it("publishes lookalike domains, which are third-party registrations", () => {
    const redacted = redactWebsite(websiteObservation);

    // Not the customer's infrastructure: naming them helps the owner defend
    // and gives an attacker nothing they did not already register themselves.
    expect(redacted.lookalikes).toEqual([
      { domain: "exarnple.com", hasMail: true },
      { domain: "example.net", hasMail: false },
    ]);
  });

  it("keeps what makes the report useful", () => {
    const redacted = redactWebsite(websiteObservation);

    expect(redacted.findings).toHaveLength(2);
    expect(redacted.findings[0]?.id).toBe("directory_listing");
    expect(redacted.findings[0]?.confidence).toBe("possible");
    expect(redacted.limitations).toContain("unauthenticated_only");
  });
});

describe("riskBand", () => {
  it("is driven by confirmed findings, not by noise", () => {
    // Five unverified maybes must not add up to "high", or the band becomes a
    // measure of how chatty the scanner was.
    const possible = Array.from({ length: 5 }, () => ({
      severity: "high",
      confidence: "possible",
    }));
    expect(riskBand(possible)).toBe("low");
  });

  it("escalates on confirmed severity", () => {
    expect(riskBand([])).toBe("low");
    expect(riskBand([{ severity: "low", confidence: "confirmed" }])).toBe(
      "moderate",
    );
    expect(riskBand([{ severity: "medium", confidence: "confirmed" }])).toBe(
      "moderate",
    );
    expect(
      riskBand([
        { severity: "medium", confidence: "confirmed" },
        { severity: "medium", confidence: "high" },
      ]),
    ).toBe("elevated");
    expect(riskBand([{ severity: "high", confidence: "confirmed" }])).toBe(
      "elevated",
    );
    expect(
      riskBand([
        { severity: "high", confidence: "confirmed" },
        { severity: "high", confidence: "confirmed" },
      ]),
    ).toBe("high");
  });
});

const emailObservation: EmailObservation = {
  records: [
    {
      source: "Forum Dump <script>alert(1)</script>",
      occurredAt: "2021-07-14",
      dataTypes: ["email", "password", "phone"],
      passwordExposed: true,
      phoneSuffix: "+31 6 12345642",
      countryCode: "netherlands",
      stealerLog: false,
      confidence: "confirmed",
    },
  ],
  limitations: ["known_sources_only"],
};

describe("redactEmail", () => {
  it("reduces a phone number to two digits", () => {
    const redacted = redactEmail(emailObservation);
    const serialized = JSON.stringify(redacted);

    expect(redacted.records[0]?.phoneSuffix).toBe("42");
    expect(serialized).not.toContain("12345");
    expect(serialized).not.toContain("+31");
  });

  it("reduces a date to year and month", () => {
    // The day is finer than the reader needs and finer than the data is.
    expect(redactEmail(emailObservation).records[0]?.occurredAt).toBe(
      "2021-07",
    );
  });

  it("drops a location that is not a two-letter country code", () => {
    expect(
      redactEmail(emailObservation).records[0]?.countryCode,
    ).toBeUndefined();

    const withCode = redactEmail({
      ...emailObservation,
      records: [{ ...emailObservation.records[0]!, countryCode: "nl" }],
    });
    expect(withCode.records[0]?.countryCode).toBe("NL");
  });

  it("strips markup from provider-controlled text", () => {
    // Defence in depth: the frontend never uses dangerouslySetInnerHTML for
    // this, but provider text should not carry markup into our data either.
    const source = redactEmail(emailObservation).records[0]?.source ?? "";
    expect(source).not.toContain("<");
    expect(source).not.toContain(">");
    expect(source).toBe("Forum Dump scriptalert(1)/script");
  });

  it("carries no password material of any fidelity", () => {
    const serialized = JSON.stringify(redactEmail(emailObservation));

    // The type has no field for it, which is the actual control. This asserts
    // the property that would break if one were ever added.
    expect(serialized).not.toMatch(/hash|plaintext|passwordValue|secret/i);
    expect(redactEmail(emailObservation).records[0]?.passwordExposed).toBe(
      true,
    );
  });

  it("drops data categories outside the closed set", () => {
    const redacted = redactEmail({
      ...emailObservation,
      records: [
        {
          ...emailObservation.records[0]!,
          // A provider inventing a category must not create an unknown key
          // that the UI cannot translate.
          dataTypes: ["email", "sexual_orientation"] as never,
        },
      ],
    });

    expect(redacted.records[0]?.dataTypes).toEqual(["email"]);
  });
});

describe("emailRiskBand", () => {
  it("treats stealer logs and password exposure as the serious cases", () => {
    const base = {
      source: "x",
      dataTypes: ["email"],
      passwordExposed: false,
      stealerLog: false,
      confidence: "confirmed",
    };

    expect(emailRiskBand([])).toBe("low");
    expect(emailRiskBand([base])).toBe("moderate");
    expect(emailRiskBand([{ ...base, passwordExposed: true }])).toBe(
      "elevated",
    );
    expect(
      emailRiskBand([
        { ...base, passwordExposed: true },
        { ...base, passwordExposed: true },
      ]),
    ).toBe("high");
    // Infostealer output leads straight to account takeover.
    expect(emailRiskBand([{ ...base, stealerLog: true }])).toBe("high");
  });
});
