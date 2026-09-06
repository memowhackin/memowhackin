import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { SectionShell } from "@/components/common/SectionShell";
import { useSeo } from "@/localization/useSeo";
import {
  gapAnchors,
  openItems,
  type LegalBlock,
  type LegalDocument,
  type LegalGap,
  type LegalInline,
} from "@/content/legal/types";
import { legalDocument, legalPaths } from "@/content/legal";
import type { LegalDocumentKind } from "@/content/legal";

/*
 * One renderer for every legal text.
 *
 * The documents are data (see `content/legal/types.ts`), so the numbering, the
 * anchors, the contents rail and the open-items list are all derived here
 * rather than written into each text. That is what keeps two languages of two
 * documents from drifting apart in anything but their words.
 *
 * Nothing about a document's *content* lives in this file. If a section is
 * missing, it is missing from the content module, not from here.
 */

/** What a renderer needs besides the block itself: where gaps anchor, and what they are called. */
interface GapContext {
  anchors: Map<LegalGap, string>;
  labels: Record<string, string>;
  /** "To be completed", so a marker reads as unfinished and not as a value. */
  prefix: string;
}

function InlineContent({
  content,
  anchors,
}: {
  content: LegalInline[];
  anchors: GapContext;
}) {
  return (
    <>
      {content.map((inline, index) => (
        // The array is static content in reading order and never reordered,
        // so the index is a stable identity here.
        <InlineFragment key={index} inline={inline} anchors={anchors} />
      ))}
    </>
  );
}

function InlineFragment({
  inline,
  anchors,
}: {
  inline: LegalInline;
  anchors: GapContext;
}) {
  if (typeof inline === "string") return <>{inline}</>;

  const linkClass =
    "text-lavender underline decoration-lavender/40 underline-offset-4 transition-colors hover:decoration-lavender";

  switch (inline.kind) {
    case "route":
      return (
        <Link to={inline.to} className={linkClass}>
          {inline.text}
        </Link>
      );
    case "anchor":
      return (
        <a href={`#${inline.id}`} className={linkClass}>
          {inline.text}
        </a>
      );
    case "external":
      return (
        <a
          href={inline.href}
          target="_blank"
          rel="noreferrer noopener"
          className={linkClass}
        >
          {inline.text}
        </a>
      );
    case "mail":
      return (
        <a href={`mailto:${inline.address}`} className={linkClass}>
          {inline.text}
        </a>
      );
    case "gap":
      /*
       * A fact the document must state and this repository does not know.
       * Marked in place and collected above the text, so the page is honest
       * about what is still open rather than quietly reading as complete.
       */
      return (
        <mark
          id={anchors.anchors.get(inline)}
          data-testid="legal-gap"
          title={anchors.prefix}
          className="bg-lavender/15 text-lavender-soft rounded px-1.5 py-0.5 text-sm"
        >
          {anchors.labels[inline.id] ?? inline.id}
        </mark>
      );
  }
}

function Block({ block, anchors }: { block: LegalBlock; anchors: GapContext }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-mist/80 text-base leading-relaxed text-pretty">
          <InlineContent content={block.content} anchors={anchors} />
        </p>
      );
    case "list":
      return (
        <ul className="text-mist/80 flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed">
          {block.items.map((item, index) => (
            <li key={index} className="text-pretty">
              <InlineContent content={item} anchors={anchors} />
            </li>
          ))}
        </ul>
      );
    case "records":
      /*
       * A definition list rather than a table: on a phone a four-column table
       * either scrolls sideways or collapses into something unreadable, and
       * this content is read on phones.
       */
      return (
        <dl className="border-indigo-deep/60 flex flex-col gap-4 border-l pl-4">
          {block.rows.map((row) => (
            <div key={row.term} className="flex flex-col gap-1">
              <dt className="text-mist text-sm font-medium">{row.term}</dt>
              <dd className="text-mist/70 text-sm leading-relaxed text-pretty">
                <InlineContent content={row.detail} anchors={anchors} />
              </dd>
            </div>
          ))}
        </dl>
      );
    case "note":
      return (
        <p className="border-lavender/40 bg-lavender/5 text-mist/85 rounded-selector border-l-2 px-4 py-3 text-sm leading-relaxed text-pretty">
          <InlineContent content={block.content} anchors={anchors} />
        </p>
      );
  }
}

function Blocks({
  blocks,
  anchors,
}: {
  blocks: LegalBlock[];
  anchors: GapContext;
}) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => (
        <Block key={index} block={block} anchors={anchors} />
      ))}
    </div>
  );
}

export function LegalPage({ kind }: { kind: LegalDocumentKind }) {
  const { t, i18n } = useTranslation();
  const document: LegalDocument = legalDocument(kind, i18n.language);
  const anchors: GapContext = {
    anchors: gapAnchors(document),
    labels: document.gaps,
    prefix: t("legal.gapPrefix"),
  };
  const open = openItems(document);

  useSeo({
    title: `${document.title} | AssistSec`,
    description: document.lede,
    path: legalPaths[kind],
  });

  const updated = new Intl.DateTimeFormat(document.locale, {
    dateStyle: "long",
  }).format(new Date(document.updatedAt));

  return (
    <div data-testid={`legal-${kind}`} className="bg-ink relative">
      <SectionShell
        className="bg-transparent"
        data-testid={`legal-${kind}-body`}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
          <header className="flex flex-col gap-4">
            <p className="eyebrow text-lavender">{t("legal.eyebrow")}</p>
            <h1 className="font-display text-display text-lavender-soft font-normal text-balance">
              {document.title}
            </h1>
            <p className="text-mist/80 max-w-2xl text-lg leading-relaxed text-pretty">
              {document.lede}
            </p>
            <p className="text-mist/60 text-sm">
              {t("legal.updated")} {updated} · {t("legal.version")}{" "}
              {document.version}
            </p>
          </header>

          {/*
            What the document still has to have filled in, before the text
            rather than after it. A reader deserves to know the page is not
            final before they have read it, not once they reach the foot.
          */}
          {open.length > 0 && (
            <section
              data-testid="legal-open-items"
              className="border-lavender/30 bg-lavender/5 rounded-selector flex flex-col gap-3 border p-5"
            >
              <h2 className="text-mist text-base font-medium">
                {t("legal.openItems.title")} ·{" "}
                {t("legal.openItems.count", { count: open.length })}
              </h2>
              <p className="text-mist/70 text-sm leading-relaxed text-pretty">
                {t("legal.openItems.body")}
              </p>
              <ul className="text-mist/75 flex list-disc flex-col gap-1.5 pl-5 text-sm">
                {open.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#gap-${item.id}`}
                      className="text-lavender decoration-lavender/40 underline underline-offset-4"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav
            aria-label={t("legal.contents")}
            data-testid="legal-contents"
            className="border-indigo-deep/60 flex flex-col gap-2 border-y py-5"
          >
            <h2 className="text-mist eyebrow">{t("legal.contents")}</h2>
            <ol className="text-mist/75 flex flex-col gap-1.5 text-sm sm:columns-2">
              {document.sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="hover:text-lavender transition-colors"
                  >
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-12">
            {document.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="flex scroll-mt-32 flex-col gap-5"
              >
                <h2 className="text-mist text-2xl font-medium text-balance">
                  {index + 1}. {section.title}
                </h2>
                <Blocks blocks={section.blocks} anchors={anchors} />

                {(section.subsections ?? []).map((sub, subIndex) => (
                  <section
                    key={sub.id}
                    id={sub.id}
                    className="mt-2 flex scroll-mt-32 flex-col gap-4"
                  >
                    <h3 className="text-mist/90 text-lg font-medium text-balance">
                      {index + 1}.{subIndex + 1} {sub.title}
                    </h3>
                    <Blocks blocks={sub.blocks} anchors={anchors} />
                  </section>
                ))}
              </section>
            ))}
          </div>

          <p className="border-indigo-deep/60 border-t pt-6">
            <a
              href="#top"
              className="text-lavender decoration-lavender/40 text-sm underline underline-offset-4"
            >
              {t("legal.backToTop")}
            </a>
          </p>
        </div>
      </SectionShell>
    </div>
  );
}
