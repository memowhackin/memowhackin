import type { BlogSummary } from "@/config/blog";

/** How many articles the home page's blog teaser shows. */
export const TEASER_COUNT = 3;

/**
 * The articles the home page teases: newest first, published only, capped.
 *
 * A plain function in its own module rather than a `useMemo` body inside the
 * component, for the reason `brandButtonClass` sits outside `BrandButton`: a
 * module exporting both a component and a function cannot be hot-reloaded. It
 * also means the three rules below are testable without rendering anything,
 * which matters because a CMS with only three published posts in it can never
 * exercise the cap or the draft filter on its own.
 *
 * The sort is by `date`, which the CMS gives at day granularity, so two posts
 * published on the same day tie. `Array.prototype.sort` is stable, so a tie
 * keeps the order the CMS sent — and the CMS orders by publication timestamp,
 * newest first. That is what makes "latest first" hold to the minute even
 * though the field being compared only knows about days. The blog index sorts
 * the same way, so both pages agree.
 */
export function latestPosts(
  posts: readonly BlogSummary[],
): readonly BlogSummary[] {
  return (
    [...posts]
      // Drafts are the CMS's business; the site shows what is published.
      .filter((post) => post.published)
      // ISO dates compare correctly as strings, so no Date is constructed here.
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, TEASER_COUNT)
  );
}
