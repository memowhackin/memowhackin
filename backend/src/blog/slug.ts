/*
 * Slug rules, kept identical to the ones the landing site used when posts were
 * files: lowercase, accents folded, everything that is not a letter or number
 * collapsed to a single hyphen. Existing post URLs must not change.
 */
export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize("NFKD")
      // Drop the combining marks NFKD just split off. Without this an accented
      // letter decomposes into a base letter plus a mark, the mark is not a
      // letter, and "bèta" slugs as "be-ta" instead of "beta".
      .replaceAll(/\p{Mark}+/gu, "")
      .replaceAll(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replaceAll(/^-+|-+$/g, "")
      .slice(0, 140)
  );
}

/**
 * The filesystem-safe form. Anything that reaches a path or a URL goes through
 * here, so a slug can never contain a separator, a dot, or a traversal segment
 * regardless of what the database holds.
 */
export function safeSlug(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]/g, "")
    .slice(0, 140);
}
