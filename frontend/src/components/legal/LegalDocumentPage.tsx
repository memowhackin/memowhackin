import { Link } from "@tanstack/react-router";
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { AlertTriangle, ArrowRight, ArrowUp } from "lucide-react";
import { LatticeDivider } from "@/components/common/LatticeDivider";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { site } from "@/config/site";
import {
  legalDocument,
  legalPaths,
  openItems,
  type LegalDocumentKind,
} from "@/content/legal";
import {
  gapAnchors,
  type LegalBlock,
  type LegalGap,
  type LegalInline,
  type LegalRoutePath,
  type LegalSection,
  type LegalSubsection,
} from "@/content/legal/types";
import { useSeo } from "@/localization/useSeo";

/**
 * A legal document, rendered from its structure (see `content/legal/types.ts`).
 *
 * The page is built like the blog article, because a policy is read the same
 * way — a long column of prose with a contents rail that follows the reader —
 * and differs from it where a legal text differs from an article: sections are
 * numbered, the rail lists the subsections too, the "records" blocks set the
 * data / purpose / basis / retention overviews as definition lists rather than
 * tables (which do not survive a phone), and there is no call to action at the
 * foot. What closes the page is the other document and a way to ask a
 * question, which is what a reader of a policy actually wants next.
 *
 * Every fact the text must state and the repository does not know is a `gap`.
 * It is drawn inline as an ember marker — unmistakably not prose — and listed
 * once at the top under "open items", each entry linking to where it sits in
 * the text. The list disappears on its own the moment the content has no gaps
 * left, so publishing is a matter of filling them in, not of remembering to
 * remove a banner.
 */

interface Heading {
  id: string;
  label: string;
  text: string;
  level: 2 | 3;
}

interface LegalDocumentPageProps {
  kind: LegalDocumentKind;
}

/**
 * What the inline renderer needs to know about the document it is inside: the
 * label for each gap, and the anchor each gap marker carries. Provided once by
 * the page rather than threaded through every block as a prop.
 */
interface GapContextValue {
  labels: ReadonlyMap<string, string>;
  anchors: ReadonlyMap<LegalGap, string>;
}

const GapContext = createContext<GapContextValue>({
  labels: new Map(),
  anchors: new Map(),
});

/** "01", "02" … for the section labels; "1.1" style for subsections. */
function sectionLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function subsectionLabel(section: number, index: number): string {
  return `${String(section + 1)}.${String(index + 1)}`;
}

/**
 * Which section the reader is in, for the rail's marker.
 *
 * Measured against a reading line a quarter of the way down the viewport: the
 * last heading above that line is the current one, so some heading is always
 * current and a jump from the rail lands the target exactly on it. (The blog
 * article uses the same rule for the same reasons.)
 */
function useActiveHeading(headings: readonly Heading[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const first = headings[0];
    if (first === undefined) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = document.documentElement.clientHeight * 0.25;

      let current = first.id;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= line) {
          current = heading.id;
        }
      }

      setActive(current);
    };

    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    frame = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  return active;
}

/**
 * Scroll to an in-page anchor, taking the jump away from the router.
 *
 * The router's scroll handling reaches an anchor click first and the hash
 * lands without the page moving; driving `scrollIntoView` here keeps CSS in
 * charge of the heading's scroll margin and of the reduced-motion rule.
 * History is replaced rather than pushed, so the back button leaves the page
 * instead of walking back up its own sections.
 */
function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView();
  window.history.replaceState(null, "", `#${id}`);
}

const LINK_CLASS =
  "text-lavender decoration-lavender/40 hover:text-lavender-soft hover:decoration-lavender-soft underline decoration-1 underline-offset-[0.2em] transition-colors";

/** A missing fact, marked where it belongs so it cannot be read as prose. */
function GapMarker({ gap }: { gap: LegalGap }) {
  const { t } = useTranslation();
  const { labels, anchors } = use(GapContext);

  return (
    /*
     * Inline, not inline-flex, so a long marker wraps with the sentence it
     * sits in rather than dropping onto a line of its own and stranding the
     * words around it. `box-decoration-break: clone` gives each wrapped line
     * its own border and padding, so the marker still reads as one tag.
     */
    <mark
      id={anchors.get(gap)}
      data-testid="legal-gap"
      data-gap={gap.id}
      className="border-ember/50 bg-ember/10 text-mist mx-0.5 inline rounded-md border border-dashed [box-decoration-break:clone] px-1.5 py-0.5 text-[0.8125em] leading-snug font-medium [-webkit-box-decoration-break:clone]"
    >
      <AlertTriangle
        aria-hidden="true"
        className="text-ember mr-1.5 inline-block size-[0.875em] align-[-0.1em]"
      />
      {t("legal.gapPrefix")}: {labels.get(gap.id) ?? gap.id}
    </mark>
  );
}

/** One run of text: strings, links and gap markers. */
function Inline({ content }: { content: readonly LegalInline[] }) {
  return (
    <>
      {content.map((piece, index) => {
        if (typeof piece === "string") return piece;

        switch (piece.kind) {
          case "gap":
            return <GapMarker key={index} gap={piece} />;

          case "anchor":
            return (
              <a
                key={index}
                href={`#${piece.id}`}
                className={LINK_CLASS}
                onClick={(event) => {
                  jumpTo(event, piece.id);
                }}
              >
                {piece.text}
              </a>
            );

          case "route":
            return (
              <Link key={index} to={piece.to} className={LINK_CLASS}>
                {piece.text}
              </Link>
            );

          case "external":
            return (
              <a
                key={index}
                href={piece.href}
                className={LINK_CLASS}
                target="_blank"
                rel="noreferrer noopener"
              >
                {piece.text}
              </a>
            );

          case "mail":
            return (
              <a
                key={index}
                href={`mailto:${piece.address}`}
                className={LINK_CLASS}
              >
                {piece.text}
              </a>
            );
        }
      })}
    </>
  );
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-mist/85 text-base leading-relaxed text-pretty sm:text-lg">
          <Inline content={block.content} />
        </p>
      );

    case "list":
      return (
        <ul className="text-mist/85 flex flex-col gap-2.5 text-base leading-relaxed sm:text-lg">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3.5 text-pretty">
              {/* The square marker the chips and lists on this site use. */}
              <span
                aria-hidden="true"
                className="bg-lavender mt-[0.7em] size-1.5 shrink-0 sm:mt-[0.75em]"
              />
              <span className="min-w-0">
                <Inline content={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "records":
      return (
        <dl className="border-indigo-deep divide-indigo-deep/70 divide-y rounded-2xl border">
          {block.rows.map((row) => (
            <div
              key={row.term}
              className="grid gap-1.5 px-5 py-4 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6 sm:px-6"
            >
              <dt className="text-lavender text-sm leading-6 font-medium">
                {row.term}
              </dt>
              <dd className="text-mist/85 min-w-0 text-base leading-relaxed text-pretty">
                <Inline content={row.detail} />
              </dd>
            </div>
          ))}
        </dl>
      );

    case "note":
      return (
        <p className="border-lavender/60 bg-lavender/[0.06] text-mist rounded-r-xl border-l-2 px-5 py-4 text-base leading-relaxed text-pretty sm:text-lg">
          <Inline content={block.content} />
        </p>
      );
  }
}

function Blocks({ blocks }: { blocks: readonly LegalBlock[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function SubsectionView({
  subsection,
  label,
}: {
  subsection: LegalSubsection;
  label: string;
}) {
  return (
    <section
      id={subsection.id}
      aria-labelledby={`${subsection.id}-title`}
      className="flex flex-col gap-4"
    >
      <h3
        id={`${subsection.id}-title`}
        className="text-mist flex items-baseline gap-3 text-xl leading-snug font-medium text-pretty"
      >
        <span className="font-display text-lavender/80 text-sm tracking-[0.08em] tabular-nums">
          {label}
        </span>
        {subsection.title}
      </h3>
      <Blocks blocks={subsection.blocks} />
    </section>
  );
}

function SectionView({
  section,
  index,
}: {
  section: LegalSection;
  index: number;
}) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      data-testid={`legal-section-${section.id}`}
      className="border-indigo-deep/70 flex flex-col gap-6 border-t pt-10 first:border-t-0 first:pt-0"
    >
      <h2
        id={`${section.id}-title`}
        className="font-display text-mist flex flex-col gap-2 text-2xl leading-tight font-normal text-pretty sm:text-3xl"
      >
        <span className="text-lavender text-sm tracking-[0.14em] uppercase tabular-nums">
          {sectionLabel(index)}
        </span>
        {section.title}
      </h2>

      <Blocks blocks={section.blocks} />

      {(section.subsections ?? []).map((subsection, subIndex) => (
        <SubsectionView
          key={subsection.id}
          subsection={subsection}
          label={subsectionLabel(index, subIndex)}
        />
      ))}
    </section>
  );
}

/**
 * The document's sections as a rail the reader can jump from — the blog's
 * contents rail, with the numbering the sections carry. Rendered twice, once
 * per breakpoint, only one displayed: stacked under a long text a contents
 * list is no use, so on narrow screens it sits above the body.
 */
function Contents({
  headings,
  activeId,
  className,
  testId,
}: {
  headings: readonly Heading[];
  activeId: string | null;
  className?: string;
  testId: string;
}) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("legal.contents")}
      data-testid={testId}
      className={className}
    >
      <span className="text-lavender/90 block text-[0.8125rem] font-semibold tracking-[0.14em] uppercase">
        {t("legal.contents")}
      </span>

      <ul className="border-indigo-deep mt-4 flex flex-col border-l">
        {headings.map((heading) => {
          const active = heading.id === activeId;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                data-testid={`legal-toc-${heading.id}`}
                aria-current={active ? "true" : undefined}
                onClick={(event) => {
                  jumpTo(event, heading.id);
                }}
                className={clsx(
                  "-ml-px flex gap-2.5 border-l py-2 text-[0.9375rem] leading-snug text-pretty transition-colors",
                  heading.level === 3 ? "pr-3 pl-7" : "pr-3 pl-4",
                  active
                    ? "border-lavender text-lavender font-medium"
                    : "text-mist/65 hover:text-mist hover:border-lavender/40 border-transparent",
                )}
              >
                <span
                  className={clsx(
                    "font-display shrink-0 pt-[0.15em] text-xs tracking-[0.06em] tabular-nums",
                    active ? "text-lavender" : "text-mist/40",
                  )}
                >
                  {heading.label}
                </span>
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** A row of the closing list: the other document, or a way to ask. */
function ClosingRow({
  to,
  href,
  title,
  body,
  testId,
}: {
  to?: LegalRoutePath;
  href?: string;
  title: string;
  body: ReactNode;
  testId: string;
}) {
  const className =
    "group border-indigo-deep/60 flex items-center justify-between gap-4 border-t py-5";

  const inner = (
    <>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-mist group-hover:text-lavender-soft text-base font-medium transition-colors">
          {title}
        </span>
        <span className="text-mist/70 text-sm leading-relaxed text-pretty">
          {body}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="text-lavender size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
      />
    </>
  );

  if (to !== undefined) {
    return (
      <Link to={to} data-testid={testId} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={href} data-testid={testId} className={className}>
      {inner}
    </a>
  );
}

export function LegalDocumentPage({ kind }: LegalDocumentPageProps) {
  const { t, i18n } = useTranslation();
  const doc = legalDocument(kind, i18n.language);
  const path = legalPaths[kind];
  const otherKind: LegalDocumentKind =
    kind === "privacyPolicy" ? "termsOfService" : "privacyPolicy";

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();

  useSeo({
    title: t(`pages.${kind}.title`),
    description: t(`pages.${kind}.description`),
    path,
  });

  const headings = useMemo<Heading[]>(
    () =>
      doc.sections.flatMap((section, index) => [
        {
          id: section.id,
          label: sectionLabel(index),
          text: section.title,
          level: 2 as const,
        },
        ...(section.subsections ?? []).map((subsection, subIndex) => ({
          id: subsection.id,
          label: subsectionLabel(index, subIndex),
          text: subsection.title,
          level: 3 as const,
        })),
      ]),
    [doc],
  );
  const activeId = useActiveHeading(headings);

  const items = useMemo(() => openItems(doc), [doc]);
  const gapContext = useMemo<GapContextValue>(
    () => ({
      labels: new Map(Object.entries(doc.gaps)),
      anchors: gapAnchors(doc),
    }),
    [doc],
  );

  const updated = new Date(`${doc.updatedAt}T00:00:00Z`).toLocaleDateString(
    i18n.language,
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  );

  return (
    <GapContext value={gapContext}>
      <article data-testid={`legal-${kind}`} className="bg-ink relative">
        {/* The about page's opening: one statement over the glow. */}
        <SectionShell
          data-testid="legal-hero"
          className="bg-ink-deep"
          innerClassName="flex flex-col gap-6 pt-12 sm:pt-16 lg:pt-20 pb-14 sm:pb-16"
          backdrop={
            <div
              className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] opacity-40 blur-3xl"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(55% 80% at 50% 0%, #413994 0%, transparent 70%)",
              }}
            />
          }
        >
          <div
            ref={heroRef}
            className={clsx("flex max-w-3xl flex-col gap-6", heroReveal)}
          >
            <span className="eyebrow text-lavender">{t("legal.eyebrow")}</span>

            <h1 className="font-display text-mist text-3xl leading-tight font-normal text-pretty sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              {doc.title}
            </h1>

            <p className="text-mist/80 text-base leading-relaxed text-pretty sm:text-lg">
              {doc.lede}
            </p>

            {/*
              The two facts a reader checks before reading a policy: when it
              was last changed, and which version this is. Set as a ruled row
              rather than as a byline, so it reads as the document's own
              header rather than as an aside.
            */}
            <dl
              data-testid="legal-meta"
              className="border-indigo-deep text-mist/60 flex flex-wrap gap-x-8 gap-y-2 border-t pt-5 text-sm"
            >
              <div className="flex gap-2">
                <dt>{t("legal.updated")}</dt>
                <dd className="text-mist/85">{updated}</dd>
              </div>
              <div className="flex gap-2">
                <dt>{t("legal.version")}</dt>
                <dd className="text-mist/85">{doc.version}</dd>
              </div>
            </dl>
          </div>
        </SectionShell>

        <LatticeDivider data-testid="legal-lattice" />

        <SectionShell
          data-testid="legal-body"
          className="bg-ink"
          innerClassName="pt-6 pb-16 lg:pt-10 lg:pb-24"
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,44rem)] lg:justify-center lg:gap-14 xl:gap-20">
            {/*
              The rail follows the read from `lg` up and stacks above the text
              below it, where a sticky column would eat the viewport. Hidden in
              print: a printed policy needs its text, not its navigation.
            */}
            <aside className="hidden lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:block lg:self-start print:hidden">
              <Contents
                headings={headings}
                activeId={activeId}
                testId="legal-toc"
              />
            </aside>

            <div className="flex min-w-0 flex-col gap-12">
              {items.length > 0 && (
                <aside
                  data-testid="legal-open-items"
                  aria-labelledby="legal-open-items-title"
                  className="border-ember/40 bg-ember/[0.06] flex flex-col gap-4 rounded-2xl border p-5 sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      aria-hidden="true"
                      className="text-ember mt-0.5 size-5 shrink-0"
                    />
                    <div className="flex flex-col gap-1.5">
                      <h2
                        id="legal-open-items-title"
                        className="text-mist text-base font-medium"
                      >
                        {t("legal.openItems.title")}
                        <span className="text-mist/55 ml-2 text-sm font-normal">
                          {t("legal.openItems.count", { count: items.length })}
                        </span>
                      </h2>
                      <p className="text-mist/75 text-sm leading-relaxed text-pretty">
                        {t("legal.openItems.body")}
                      </p>
                    </div>
                  </div>

                  <ol className="text-mist/85 grid gap-2 text-sm leading-relaxed sm:grid-cols-2">
                    {items.map((item, index) => (
                      <li key={item.id} className="flex gap-2.5">
                        <span className="font-display text-ember/80 shrink-0 text-xs tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <a
                          href={`#gap-${item.id}`}
                          className="hover:text-lavender decoration-mist/25 hover:decoration-lavender underline decoration-1 underline-offset-[0.2em] transition-colors"
                          onClick={(event) => {
                            jumpTo(event, `gap-${item.id}`);
                          }}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ol>
                </aside>
              )}

              <Contents
                headings={headings}
                activeId={activeId}
                testId="legal-toc-inline"
                className="lg:hidden print:hidden"
              />

              <div className="flex flex-col gap-12" data-testid="legal-text">
                {doc.sections.map((section, index) => (
                  <SectionView
                    key={section.id}
                    section={section}
                    index={index}
                  />
                ))}
              </div>

              {/*
                What a reader of one policy wants next: the other one, and a
                way to ask. Ruled rows, as the contact page sets its channels.
              */}
              <div
                data-testid="legal-closing"
                className="border-indigo-deep/60 flex flex-col border-b print:hidden"
              >
                <ClosingRow
                  to={legalPaths[otherKind]}
                  title={t(`legal.related.${otherKind}.title`)}
                  body={t(`legal.related.${otherKind}.body`)}
                  testId={`legal-related-${otherKind}`}
                />
                <ClosingRow
                  href={`mailto:${site.contactEmail}`}
                  title={t("legal.related.contact.title")}
                  body={site.contactEmail}
                  testId="legal-related-contact"
                />
                <a
                  href="#main"
                  data-testid="legal-back-to-top"
                  onClick={(event) => {
                    event.preventDefault();
                    window.scrollTo({ top: 0 });
                  }}
                  className="text-lavender hover:text-lavender-soft border-indigo-deep/60 inline-flex w-fit items-center gap-2 border-t py-5 text-sm font-medium transition-colors"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                  {t("legal.backToTop")}
                </a>
              </div>
            </div>
          </div>
        </SectionShell>
      </article>
    </GapContext>
  );
}
