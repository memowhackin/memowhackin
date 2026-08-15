/*
 * The grid follows how many articles there are.
 *
 * A fixed three-column track left a single post marooned against two empty
 * columns, which reads as a missing layout rather than as a short archive —
 * and a blog is at its shortest exactly when someone is first looking at it.
 * Below three, the row narrows and centres so the cards stay a card's width
 * instead of stretching to fill the page.
 */
export function gridColumns(count: number): string {
  if (count >= 3) return "sm:grid-cols-2 lg:grid-cols-3";
  if (count === 2) return "mx-auto max-w-4xl sm:grid-cols-2";
  return "mx-auto max-w-sm";
}
