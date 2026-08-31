import { describe, expect, it } from "vitest";
import { latestPosts, TEASER_COUNT } from "./latestPosts";
import type { BlogSummary } from "@/config/blog";

function post(overrides: Partial<BlogSummary> & { slug: string }): BlogSummary {
  return {
    title: overrides.slug,
    category: "news",
    excerpt: "",
    date: "2026-01-01",
    readMinutes: 1,
    published: true,
    featured: false,
    ...overrides,
  };
}

/*
 * The home page's teaser. The CMS this runs against has three published posts
 * in it, so none of the rules below can be observed from live data — which is
 * exactly why they are pinned here.
 */
describe("latestPosts", () => {
  it("puts the newest article first", () => {
    const chosen = latestPosts([
      post({ slug: "older", date: "2026-03-01" }),
      post({ slug: "newest", date: "2026-09-30" }),
      post({ slug: "middle", date: "2026-06-15" }),
    ]);

    expect(chosen.map((entry) => entry.slug)).toEqual([
      "newest",
      "middle",
      "older",
    ]);
  });

  it("shows no more than three, dropping the oldest", () => {
    const chosen = latestPosts(
      [
        "2026-01-01",
        "2026-02-01",
        "2026-03-01",
        "2026-04-01",
        "2026-05-01",
      ].map((date) => post({ slug: date, date })),
    );

    expect(chosen).toHaveLength(TEASER_COUNT);
    expect(chosen.map((entry) => entry.slug)).toEqual([
      "2026-05-01",
      "2026-04-01",
      "2026-03-01",
    ]);
  });

  it("never shows a draft", () => {
    const chosen = latestPosts([
      post({ slug: "draft", date: "2026-12-01", published: false }),
      post({ slug: "live", date: "2026-01-01" }),
    ]);

    expect(chosen.map((entry) => entry.slug)).toEqual(["live"]);
  });

  /*
   * The CMS dates posts by day but orders them by publication time, so posts
   * written on one day arrive newest-first already and the sort must not
   * disturb them. Every post in this repository's own CMS shares a date, which
   * makes this the case that actually decides the order on the live site.
   */
  it("keeps the CMS's order when two posts share a date", () => {
    const chosen = latestPosts([
      post({ slug: "published-at-noon", date: "2026-08-14" }),
      post({ slug: "published-at-dawn", date: "2026-08-14" }),
    ]);

    expect(chosen.map((entry) => entry.slug)).toEqual([
      "published-at-noon",
      "published-at-dawn",
    ]);
  });

  it("returns nothing when the CMS is unreachable and the list is empty", () => {
    expect(latestPosts([])).toEqual([]);
  });
});
