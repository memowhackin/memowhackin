import type { LegalBlock, LegalInline } from "@/content/legal/types";

/*
 * Keys for the document's own lists.
 *
 * None of these items carries an id, so the key is derived from what the item
 * says: a link's target and text, a gap's catalogue key, a block's type and
 * opening words. That makes the key follow the content when a clause is edited
 * or a paragraph moves, which the array index cannot do — an inserted sentence
 * shifts every index after it and React reuses the wrong node.
 *
 * A document may legitimately repeat an item — the same defined term linked
 * twice in one clause — so identical signatures are numbered by how many
 * preceded them. The result is stable across renders of the same document and
 * unique within its list.
 */
export function inlineSignature(piece: LegalInline): string {
  if (typeof piece === "string") return `text:${piece}`;

  switch (piece.kind) {
    case "gap":
      return `gap:${piece.id}`;
    case "anchor":
      return `anchor:${piece.id}:${piece.text}`;
    case "route":
      return `route:${piece.to}:${piece.text}`;
    case "external":
      return `external:${piece.href}:${piece.text}`;
    case "mail":
      return `mail:${piece.address}:${piece.text}`;
    default:
      return piece satisfies never;
  }
}

/** The opening words of a block, which is what distinguishes one from the next. */
export function blockSignature(block: LegalBlock): string {
  switch (block.type) {
    case "paragraph":
    case "note":
      return `${block.type}:${block.content.map(inlineSignature).join("|")}`;
    case "list":
      return `list:${block.items
        .map((item) => item.map(inlineSignature).join("|"))
        .join("//")}`;
    case "records":
      return `records:${block.rows.map((row) => row.term).join("|")}`;
    default:
      return block satisfies never;
  }
}

/** Pair each item with a key, numbering repeats so every key stays unique. */
export function keyed<T>(
  items: readonly T[],
  signature: (item: T) => string,
): { key: string; item: T }[] {
  const seen = new Map<string, number>();

  return items.map((item) => {
    const sig = signature(item);
    const before = seen.get(sig) ?? 0;
    seen.set(sig, before + 1);
    return { key: before === 0 ? sig : `${sig}~${String(before)}`, item };
  });
}
