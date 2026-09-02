import { describe, expect, it } from "vitest";
import { SUPPORTED_LANGUAGES } from "@/config/locale";
import { legalDocuments, legalPaths } from "@/content/legal";
import {
  gapAnchors,
  inlinesIn,
  openItems,
  type LegalDocument,
  type LegalDocumentKind,
} from "@/content/legal/types";

const KINDS = Object.keys(legalDocuments) as LegalDocumentKind[];

/** The anchor ids of a document, in reading order, subsections included. */
function outline(document: LegalDocument): string[] {
  return document.sections.flatMap((section) => [
    section.id,
    ...(section.subsections ?? []).map((subsection) => subsection.id),
  ]);
}

/** Routes an internal link may point at. */
const INTERNAL_ROUTES = new Set([
  "/contact",
  "/security-scan",
  ...Object.values(legalPaths),
]);

describe("legal documents", () => {
  it("exist in every supported language", () => {
    for (const kind of KINDS) {
      for (const language of SUPPORTED_LANGUAGES) {
        const document = legalDocuments[kind][language];
        expect(document.kind).toBe(kind);
        expect(document.locale).toBe(language);
        expect(document.sections.length).toBeGreaterThan(5);
      }
    }
  });

  it("keep the same outline in every language", () => {
    // The two translations are the same document. Same sections, same order,
    // same anchors — so a link into one language lands in the other, and a
    // clause cannot quietly exist in only one of them.
    for (const kind of KINDS) {
      const reference = outline(legalDocuments[kind].en);
      for (const language of SUPPORTED_LANGUAGES) {
        expect(outline(legalDocuments[kind][language])).toEqual(reference);
      }
    }
  });

  it("give every section a unique anchor", () => {
    for (const kind of KINDS) {
      for (const language of SUPPORTED_LANGUAGES) {
        const ids = outline(legalDocuments[kind][language]);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
      }
    }
  });

  it("label every gap, and use every label", () => {
    for (const kind of KINDS) {
      for (const language of SUPPORTED_LANGUAGES) {
        const document = legalDocuments[kind][language];
        const used = new Set(openItems(document).map((item) => item.id));
        const labelled = new Set(Object.keys(document.gaps));

        expect([...used].sort()).toEqual([...labelled].sort());
        for (const item of openItems(document)) {
          expect(item.label).not.toBe(item.id);
        }
      }
    }
  });

  it("mark the same gaps in every language", () => {
    for (const kind of KINDS) {
      const reference = openItems(legalDocuments[kind].en).map(
        (item) => item.id,
      );
      for (const language of SUPPORTED_LANGUAGES) {
        expect(
          openItems(legalDocuments[kind][language]).map((item) => item.id),
        ).toEqual(reference);
      }
    }
  });

  it("only link to sections that exist and routes the site has", () => {
    for (const kind of KINDS) {
      for (const language of SUPPORTED_LANGUAGES) {
        const document = legalDocuments[kind][language];
        const anchors = new Set(outline(document));

        for (const inline of inlinesIn(document)) {
          if (typeof inline === "string" || inline.kind === "gap") continue;

          switch (inline.kind) {
            case "anchor":
              expect(anchors.has(inline.id), inline.id).toBe(true);
              break;
            case "route":
              expect(INTERNAL_ROUTES.has(inline.to), inline.to).toBe(true);
              break;
            case "external":
              expect(inline.href).toMatch(/^https:\/\/[^\s/]+/);
              break;
            case "mail":
              expect(inline.address).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
              break;
          }
        }
      }
    }
  });

  it("give every gap marker its own anchor, the first one plain", () => {
    for (const kind of KINDS) {
      const document = legalDocuments[kind].en;
      const anchors = [...gapAnchors(document).values()];

      expect(new Set(anchors).size).toBe(anchors.length);
      for (const item of openItems(document)) {
        expect(anchors).toContain(`gap-${item.id}`);
      }
    }
  });

  it("carry a revision date and version", () => {
    for (const kind of KINDS) {
      for (const language of SUPPORTED_LANGUAGES) {
        const document = legalDocuments[kind][language];
        expect(document.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(document.version).toMatch(/^\d+\.\d+$/);
        expect(document.updatedAt).toBe(legalDocuments[kind].en.updatedAt);
      }
    }
  });
});
