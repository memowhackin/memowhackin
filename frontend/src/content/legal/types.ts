import type { SupportedLanguage } from "@/config/locale";

/*
 * The legal documents as data.
 *
 * A privacy policy and a set of terms are long, numbered, cross-referenced and
 * reviewed by people who are not developers, so they are kept as structured
 * content rather than as a few hundred translation keys or a wall of JSX. One
 * shape, four documents (two texts in two languages), one renderer: the
 * contents rail, the numbering, the anchors and the open-items list are all
 * derived from the structure, so the two languages cannot drift apart in
 * anything but their words — and a test asserts that they do not.
 *
 * `gap` is the one unusual element. It stands for a fact the law requires the
 * document to state and that nothing in this repository records: the legal
 * entity, its registration numbers, a retention period nobody has decided yet.
 * Each gap is marked where it belongs in the text and collected into a list at
 * the top of the page, so the document is complete in shape and honest about
 * what is still missing, rather than filled with plausible-looking guesses.
 */

export type LegalDocumentKind = "privacyPolicy" | "termsOfService";

/**
 * The routes a legal text may link to. A closed list, because the router's
 * `Link` only accepts paths it knows, and because a policy that links to a
 * page that has moved is a policy nobody trusts.
 */
export type LegalRoutePath =
  | "/contact"
  | "/security-scan"
  | "/privacy-policy"
  | "/terms-of-service";

/** A link to another page of this site. */
export interface LegalRouteLink {
  kind: "route";
  text: string;
  to: LegalRoutePath;
}

/** A link to a section of the same document. */
export interface LegalAnchorLink {
  kind: "anchor";
  text: string;
  /** The section or subsection id. */
  id: string;
}

/** A link that leaves the site. */
export interface LegalExternalLink {
  kind: "external";
  text: string;
  href: `https://${string}`;
}

/** An e-mail address. */
export interface LegalMailLink {
  kind: "mail";
  text: string;
  address: string;
}

export type LegalLink =
  | LegalRouteLink
  | LegalAnchorLink
  | LegalExternalLink
  | LegalMailLink;

/** A fact the document must state and the repository does not know. */
export interface LegalGap {
  kind: "gap";
  /** Key into the document's `gaps` catalogue, which carries the label. */
  id: string;
}

export type LegalInline = string | LegalLink | LegalGap;

export type LegalBlock =
  | { type: "paragraph"; content: LegalInline[] }
  | { type: "list"; items: LegalInline[][] }
  /**
   * A labelled overview — what is processed, why, on what basis, for how long.
   * Rendered as a definition list rather than a table so it reads on a phone
   * without a sideways scroll.
   */
  | { type: "records"; rows: { term: string; detail: LegalInline[] }[] }
  /** A short statement set apart from the running text. */
  | { type: "note"; content: LegalInline[] };

export interface LegalSubsection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
  subsections?: LegalSubsection[];
}

export interface LegalDocument {
  kind: LegalDocumentKind;
  locale: SupportedLanguage;
  title: string;
  lede: string;
  /** ISO date (YYYY-MM-DD) the text was last revised. */
  updatedAt: string;
  version: string;
  /** What each gap id stands for, in this language. */
  gaps: Record<string, string>;
  sections: LegalSection[];
}

/* Constructors, so a document reads as text rather than as JSON. */

export function route(text: string, to: LegalRoutePath): LegalRouteLink {
  return { kind: "route", text, to };
}

export function anchor(text: string, id: string): LegalAnchorLink {
  return { kind: "anchor", text, id };
}

export function external(
  text: string,
  href: `https://${string}`,
): LegalExternalLink {
  return { kind: "external", text, href };
}

export function mail(text: string, address: string): LegalMailLink {
  return { kind: "mail", text, address };
}

export function gap(id: string): LegalGap {
  return { kind: "gap", id };
}

export function p(...content: LegalInline[]): LegalBlock {
  return { type: "paragraph", content };
}

export function list(...items: LegalInline[][]): LegalBlock {
  return { type: "list", items };
}

export function records(
  ...rows: { term: string; detail: LegalInline[] }[]
): LegalBlock {
  return { type: "records", rows };
}

export function note(...content: LegalInline[]): LegalBlock {
  return { type: "note", content };
}

function* inlinesOf(block: LegalBlock): Generator<LegalInline> {
  switch (block.type) {
    case "paragraph":
    case "note":
      yield* block.content;
      return;
    case "list":
      for (const item of block.items) yield* item;
      return;
    case "records":
      for (const row of block.rows) yield* row.detail;
      return;
  }
}

/** Every block in the document, in reading order. */
export function* blocksOf(document: LegalDocument): Generator<LegalBlock> {
  for (const section of document.sections) {
    yield* section.blocks;
    for (const subsection of section.subsections ?? []) {
      yield* subsection.blocks;
    }
  }
}

/** Every inline element in the document, in reading order. */
export function* inlinesIn(document: LegalDocument): Generator<LegalInline> {
  for (const block of blocksOf(document)) yield* inlinesOf(block);
}

export interface OpenItem {
  id: string;
  label: string;
}

/**
 * The gaps a document still has, in the order they first appear, each once.
 * This is the list the page shows above the text, and the list a reviewer
 * works through before the document is published.
 */
export function openItems(document: LegalDocument): OpenItem[] {
  const seen = new Set<string>();
  const items: OpenItem[] = [];

  for (const inline of inlinesIn(document)) {
    if (typeof inline === "string" || inline.kind !== "gap") continue;
    if (seen.has(inline.id)) continue;
    seen.add(inline.id);
    items.push({ id: inline.id, label: document.gaps[inline.id] ?? inline.id });
  }

  return items;
}

/**
 * A DOM id for every gap marker in the document, keyed by the marker itself.
 *
 * The same fact is often missing in more than one place — the address opens
 * the document and closes it — and two elements cannot share an id. The first
 * occurrence of a gap takes the plain id the open-items list links to; later
 * ones are numbered.
 */
export function gapAnchors(document: LegalDocument): Map<LegalGap, string> {
  const anchors = new Map<LegalGap, string>();
  const counts = new Map<string, number>();

  for (const inline of inlinesIn(document)) {
    if (typeof inline === "string" || inline.kind !== "gap") continue;
    const seen = (counts.get(inline.id) ?? 0) + 1;
    counts.set(inline.id, seen);
    anchors.set(
      inline,
      seen === 1 ? `gap-${inline.id}` : `gap-${inline.id}-${String(seen)}`,
    );
  }

  return anchors;
}
