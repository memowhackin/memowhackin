/**
 * Map over items with a ceiling on how many run at once.
 *
 * The path and image checks each fan out over a couple of dozen URLs against a
 * single target. `Promise.all` over that list opens every socket at once, which
 * is both slower — the target's own connection limit becomes the bottleneck and
 * everything queues behind it anyway — and indistinguishable from a small flood
 * to whoever is reading the target's logs. A free scanner that anyone can point
 * at any domain has to stay boring on the wire.
 *
 * Results keep the order of `items`, not the order they finished in.
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  work: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);

  /*
   * One iterator, shared by every worker. Each `for...of` pull is a `next()`
   * call on the same cursor, so the workers divide the list between them
   * without an index to guard or a value to test against `undefined` — which
   * an index-and-lookup version has to do, and gets subtly wrong for a list
   * that legitimately holds one.
   */
  const queue = items.entries();

  async function worker(): Promise<void> {
    for (const [index, item] of queue) {
      results[index] = await work(item);
    }
  }

  const size = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: size }, () => worker()));
  return results;
}
