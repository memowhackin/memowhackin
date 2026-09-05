import { describe, expect, it } from "vitest";
import { knowledgeBaseUrl } from "@/config/site";
import { SUPPORTED_LANGUAGES } from "@/config/locale";

/*
 * The knowledge base sits on its own host and numbers its languages the other
 * way round from this site: Dutch at the root, everything else behind a prefix,
 * where here English is the bare path.
 *
 * That inversion is the whole reason this function exists, and it is the thing
 * a future edit is most likely to get backwards — reusing `localizedPath`, or
 * "simplifying" both sites onto one scheme, sends every Dutch reader to a page
 * that does not exist. These assertions are what makes that fail loudly.
 *
 * The same mapping is spelt out again as 301s in `nginx.conf` and
 * `scripts/prerender.mjs`, which nothing here can reach; those carry a comment
 * pointing at each other.
 */
describe("knowledgeBaseUrl", () => {
  it("puts Dutch at the root, with no prefix", () => {
    expect(knowledgeBaseUrl("nl")).toBe("https://kennisbank.assistsec.nl");
  });

  it("prefixes every other language", () => {
    expect(knowledgeBaseUrl("en")).toBe("https://kennisbank.assistsec.nl/en");
  });

  it("never returns a trailing slash", () => {
    // kennisbank redirects /en/ back to /en, so a trailing slash costs a hop.
    for (const locale of SUPPORTED_LANGUAGES) {
      expect(knowledgeBaseUrl(locale).endsWith("/")).toBe(false);
    }
  });

  it("has an address for every language this site builds", () => {
    for (const locale of SUPPORTED_LANGUAGES) {
      expect(knowledgeBaseUrl(locale)).toMatch(
        /^https:\/\/kennisbank\.assistsec\.nl(\/[a-z]{2})?$/,
      );
    }
  });
});
