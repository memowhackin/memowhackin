/*
 * Post URLs.
 *
 * A slug is the permanent address of an article, so two properties matter more
 * than prettiness: it must be unique, and once published it must never move.
 * Everything here serves those two.
 *
 * The output alphabet is deliberately `[a-z0-9-]` and nothing else. It used to
 * be "any Unicode letter or number", which quietly produced unreachable posts:
 * `safeSlug` — which every public lookup runs the incoming URL through — strips
 * to ASCII, so a Cyrillic or CJK title was stored under a slug that no request
 * could ever resolve to, and every such post collapsed to the same empty
 * lookup. Titles in scripts that do not transliterate get an id-based slug
 * instead of a broken one.
 */

/** Matches the `slug` column, and the CHECK constraint on it. */
export const MAX_SLUG_LENGTH = 140;

/**
 * The readable part of a slug, derived from a title.
 *
 * Returns an empty string when a title has nothing to transliterate — an emoji,
 * punctuation, or a script this drops. Callers are expected to handle that;
 * `buildSlug` is the one that decides what to do about it.
 */
export function slugify(title: string): string {
  const folded = title
    .toLowerCase()
    .normalize("NFKD")
    /*
     * Drop the combining marks NFKD just split off. Without this an accented
     * letter decomposes into a base letter plus a mark, the mark is not a
     * letter, and "bèta" slugs as "be-ta" instead of "beta".
     */
    .replaceAll(/\p{Mark}+/gu, "")
    .replaceAll(/[^a-z0-9]+/g, "-");

  return trimHyphens(truncate(folded, MAX_SLUG_LENGTH));
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
    .slice(0, MAX_SLUG_LENGTH);
}

function trimHyphens(value: string): string {
  return value.replaceAll(/^-+|-+$/g, "");
}

/**
 * Cut to length on a word boundary where one is close enough.
 *
 * A blind `slice` splits the final word and can leave a trailing hyphen, so two
 * long titles that differ only past the cut produce slugs differing only by
 * that hyphen. Backing up to the last separator keeps the tail readable.
 */
function truncate(value: string, max: number): string {
  if (value.length <= max) return value;

  const cut = value.slice(0, max);
  const boundary = cut.lastIndexOf("-");
  // Only honour the boundary if it does not throw most of the slug away.
  return boundary > max * 0.6 ? cut.slice(0, boundary) : cut;
}

/**
 * The disambiguating suffix, taken from the post's own id.
 *
 * Medium's `practical-guide-for-x-9a6a4a3a8302` shape, with the id it is built
 * from being the row's primary key rather than a fresh random value: the same
 * post always yields the same suffix, so the URL is reproducible from the
 * database alone and nothing about it drifts if the row is re-saved.
 */
export function slugSuffix(id: string): string {
  return id.replaceAll("-", "").slice(0, 8);
}

/**
 * The slug for a post, given its id and title.
 *
 * `taken` decides whether a candidate is already in use — the caller supplies
 * it because only it knows the locale and which row is being updated. When the
 * readable form is free it is used as-is, which keeps the common case clean;
 * otherwise the id suffix is appended, which cannot collide with another post
 * because no two rows share an id.
 *
 * A title with nothing to transliterate falls back to `post-<suffix>`: a URL
 * that is ugly but real, rather than an error the author cannot act on — the
 * editor has no slug field, so a rejection there is a dead end.
 */
export async function buildSlug(
  id: string,
  title: string,
  taken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  const suffix = slugSuffix(id);
  const base = slugify(title);

  if (base.length === 0) return `post-${suffix}`;
  if (!(await taken(base))) return base;

  // Leave room for the suffix rather than overflowing the column.
  const room = MAX_SLUG_LENGTH - suffix.length - 1;
  return `${trimHyphens(truncate(base, room))}-${suffix}`;
}
