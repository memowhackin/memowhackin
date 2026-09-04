import { describe, expect, it } from "vitest";
import {
  blockSignature,
  inlineSignature,
  keyed,
} from "@/components/legal/legalKeys";
import { legalDocuments } from "@/content/legal";
import type { LegalBlock, LegalInline } from "@/content/legal/types";

/*
 * React keys for the legal documents.
 *
 * These lists carry no ids, so the key is derived from the content. Two things
 * have to hold, and neither is visible in the browser until it goes wrong: a
 * key must be unique within its list, or React drops siblings silently; and it
 * must follow its item when the document is edited, or an inserted sentence
 * shifts every key after it and React reuses the wrong node.
 *
 * The last test runs against the real documents rather than fixtures, because
 * the failure this guards against is a clause somebody adds later.
 */

const link = (text: string, id: string): LegalInline => ({
  kind: "anchor",
  text,
  id,
});

describe("inlineSignature", () => {
  it("separates pieces that differ only in target", () => {
    expect(inlineSignature(link("this clause", "s1"))).not.toBe(
      inlineSignature(link("this clause", "s2")),
    );
  });

  it("separates pieces that differ only in text", () => {
    expect(inlineSignature(link("here", "s1"))).not.toBe(
      inlineSignature(link("there", "s1")),
    );
  });

  it("separates a link from a plain string that reads the same", () => {
    expect(inlineSignature("liability")).not.toBe(
      inlineSignature(link("liability", "s13")),
    );
  });

  it("gives the same piece the same signature every time", () => {
    // Stability is the whole point: a key that changes per render defeats it.
    expect(inlineSignature(link("here", "s1"))).toBe(
      inlineSignature(link("here", "s1")),
    );
  });
});

describe("keyed", () => {
  it("keys a list by content rather than position", () => {
    const items: LegalInline[] = ["one", "two", "three"];
    const before = keyed(items, inlineSignature);
    // A sentence inserted at the front must not renumber what follows it.
    const after = keyed(["zero", ...items], inlineSignature);

    expect(after.slice(1).map((entry) => entry.key)).toEqual(
      before.map((entry) => entry.key),
    );
  });

  it("keeps repeats unique", () => {
    // A document may link the same defined term twice in one clause.
    const repeated: LegalInline[] = [
      link("Section 13", "s13"),
      " and ",
      link("Section 13", "s13"),
    ];
    const keys = keyed(repeated, inlineSignature).map((entry) => entry.key);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("returns the items untouched, in order", () => {
    const items = ["a", "b", "c"];
    expect(keyed(items, inlineSignature).map((entry) => entry.item)).toEqual(
      items,
    );
  });
});

describe("every list in the real documents", () => {
  function inlineLists(block: LegalBlock): LegalInline[][] {
    switch (block.type) {
      case "paragraph":
      case "note":
        return [block.content];
      case "list":
        return block.items;
      case "records":
        return block.rows.map((row) => row.detail);
    }
  }

  const documents = Object.entries(legalDocuments).flatMap(([kind, byLocale]) =>
    Object.entries(byLocale).map(([locale, document]) => ({
      name: `${kind}/${locale}`,
      document,
    })),
  );

  it("covers more than one document, so the sweep is not vacuous", () => {
    expect(documents.length).toBeGreaterThan(1);
  });

  it.each(documents.map((entry) => [entry.name, entry] as const))(
    "keys %s uniquely at every level",
    (_name, entry) => {
      const sections = [
        ...entry.document.sections,
        ...entry.document.sections.flatMap(
          (section) => section.subsections ?? [],
        ),
      ];

      for (const section of sections) {
        const blockKeys = keyed(section.blocks, blockSignature).map(
          (item) => item.key,
        );
        expect(new Set(blockKeys).size).toBe(blockKeys.length);

        for (const block of section.blocks) {
          for (const list of inlineLists(block)) {
            const keys = keyed(list, inlineSignature).map((item) => item.key);
            expect(new Set(keys).size).toBe(keys.length);
          }
        }
      }
    },
  );
});
