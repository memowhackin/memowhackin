const WORDS_PER_MINUTE = 200;

/**
 * Reading time from the body text, rounded up, at 200 words a minute — the same
 * calculation the landing's editor used. Computed from the sanitized body on
 * the server; a client-supplied number is a claim, not a fact.
 */
export function readMinutes(body: string): number {
  const words = body
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
