import { describe, expect, it } from "vitest";
import { permutations } from "./lookalike.js";

/*
 * The permutation generator. The failure that matters most is generating the
 * original domain back and then reporting a company as its own impersonator,
 * so that is asserted first and hardest.
 */

describe("permutations", () => {
  it("never produces the domain it was given", () => {
    for (const domain of ["assistsec.nl", "example.com", "a.co.uk", "ab.io"]) {
      expect(permutations(domain), domain).not.toContain(domain);
    }
  });

  it("produces the classic misspelling shapes", () => {
    const found = permutations("assistsec.nl");

    expect(found).toContain("assistec.nl"); // omission
    expect(found).toContain("assist-sec.nl"); // hyphenation
    expect(found).toContain("assistsec.com"); // TLD swap
    expect(found).toContain("secure-assistsec.nl"); // affix
  });

  it("keeps the suffix intact and swaps only the name", () => {
    for (const candidate of permutations("example.com")) {
      expect(candidate.split(".").length).toBeGreaterThanOrEqual(2);
      expect(candidate.endsWith(".")).toBe(false);
    }
  });

  it("treats a two-label public suffix as the suffix", () => {
    // Splitting "a.co.uk" at the last dot would generate permutations of
    // "a.co", which are different registrable names entirely.
    const found = permutations("shop.co.uk");
    expect(found).toContain("shop.com");
    expect(found.some((c) => c.endsWith(".co.uk"))).toBe(true);
  });

  it("is bounded, so one long domain cannot fire hundreds of queries", () => {
    const found = permutations("averyverylongcompanynameindeed.com");
    expect(found.length).toBeLessThanOrEqual(64);
  });

  it("returns no duplicates", () => {
    const found = permutations("assistsec.nl");
    expect(new Set(found).size).toBe(found.length);
  });
});
