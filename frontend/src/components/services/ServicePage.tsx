import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { ReportStack } from "@/components/common/ReportStack";
import { CrossingMark } from "@/components/common/CrossingMark";
import { SectionShell } from "@/components/common/SectionShell";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { SampleReportModal } from "@/components/landing/SampleReportModal";
import { ProcessTimeline } from "@/components/services/ProcessTimeline";
import { ServiceComparison } from "@/components/services/ServiceComparison";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import { SERVICE_AREA_SERVED, type ServiceDefinition } from "@/config/services";
import { site } from "@/config/site";

/**
 * The pages the reader is handed on to, resolved out of the navigation tree.
 *
 * Order follows the service's own list rather than the nav's, because the first
 * card is the one most people want next and that differs per service. A path
 * that no longer exists in the tree drops out silently: the alternative is a
 * card linking somewhere that 404s.
 */
function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );

  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

/**
 * The shape every service page takes: what the service is, what it covers, how
 * an engagement runs, what the client is left holding, why it is us, the
 * questions buyers ask, and the way on to the neighbouring services.
 *
 * One template for all three rather than three hand-built pages — the sections
 * are the same argument in the same order for every service we sell, and three
 * copies of it would drift the moment one of them was touched. What differs per
 * service is `ServiceDefinition` (which items each section holds) and the
 * translation block behind it.
 */
export function ServicePage({ service }: { service: ServiceDefinition }) {
  const { t } = useTranslation();
  const [reportOpen, setReportOpen] = useState(false);
  const related = relatedLeaves(service.related);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: definitionRef, className: definitionReveal } =
    useReveal<HTMLDivElement>();
  const { ref: reportRef, className: reportReveal } =
    useReveal<HTMLDivElement>();
  const { ref: stackRef, className: stackReveal } = useReveal<HTMLDivElement>({
    delay: 120,
  });

  /*
   * Both are memoised because they land in `useSeo`'s dependency array: rebuilt
   * on every render they would rewrite the document head — and the JSON-LD
   * script with it — on every render. `t` is the dependency that matters; it
   * changes when the language does, which is exactly when these strings change.
   */
  const faq = useMemo(
    () =>
      service.faqs.map((entry) => ({
        question: t(`servicePages.${service.key}.faq.items.${entry}.q`),
        answer: t(`servicePages.${service.key}.faq.items.${entry}.a`),
      })),
    [service, t],
  );

  const serviceSchema = useMemo(
    () => ({
      name: t(`pages.${service.pageKey}.heading`),
      serviceType: service.serviceType,
      areaServed: SERVICE_AREA_SERVED,
    }),
    [service, t],
  );

  useSeo({
    title: t(`pages.${service.pageKey}.title`),
    description: t(`pages.${service.pageKey}.description`),
    path: service.path,
    service: serviceSchema,
    faq,
  });

  return (
    <div data-testid={`service-${service.key}`} className="bg-ink relative">
      {/* The tinted glow every page below the home page opens on, so a service
          page does not read as a different site. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.2) 0%, transparent 68%)",
        }}
      />

      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-hero`}
        innerClassName="flex flex-col items-center gap-6 pt-12 pb-16 text-center sm:pt-16 lg:pt-20 lg:pb-20"
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-center gap-6", heroReveal)}
        >
          <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`pages.${service.pageKey}.heading`)}
          </h1>

          <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
            {t(`pages.${service.pageKey}.body`)}
          </p>

          {/*
            Two actions, as the about page ends on: a service page is where the
            decision is made, and the reader who is not ready to book a slot is
            the one who wants to ask a question first. Sending both to the same
            place would be the same button twice.
          */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <BrandButton
              href={site.bookDemoUrl}
              variant="sweep"
              data-testid="page-book-demo"
              className="text-nowrap"
            >
              {t("nav.bookDemo")}
            </BrandButton>

            {/*
              A router link, not a `BrandButton`: that component is an `<a
              href>` that opens in a new tab, and both halves are wrong here.
              An internal destination has to go through the router or the
              Dutch build walks out of its own `/nl` prefix, and a page of this
              site opening in a second tab is not a thing the site does. The
              look comes from the shared class list, which exists for exactly
              this.
            */}
            <Link
              to="/contact"
              data-testid={`service-${service.key}-contact`}
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`servicePages.${service.key}.hero.secondary`)}
            </Link>
          </div>
        </div>
      </SectionShell>

      {/*
        What the service is, in the page's own words before any of its parts.
        Heading beside copy, on the grid the about page's story runs on.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-definition`}
        innerClassName="pb-16 lg:pb-24"
      >
        <div
          ref={definitionRef}
          className={clsx(
            "grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16",
            definitionReveal,
          )}
        >
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`servicePages.${service.key}.definition.title`)}
          </h2>

          <div className="text-mist/75 flex max-w-2xl flex-col gap-5 text-base leading-relaxed text-pretty sm:text-lg">
            <p>{t(`servicePages.${service.key}.definition.p1`)}</p>
            <p>{t(`servicePages.${service.key}.definition.p2`)}</p>
          </div>
        </div>
      </SectionShell>

      {/* What the engagement covers. */}
      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-coverage`}
        innerClassName="flex flex-col gap-8 pb-16 lg:gap-10 lg:pb-24"
      >
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`servicePages.${service.key}.coverage.title`)}
          </h2>
          <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
            {t(`servicePages.${service.key}.coverage.intro`)}
          </p>
        </div>

        {/*
          The ruled grid the home page draws its services on, rather than a row
          of panels. Six bordered cards read as a template someone filled in —
          the same shape whatever is written in them — and the site already has
          its own answer for a set of related things: an unbroken hairline with
          the brand's diamond where the rules meet, and the copy set straight
          onto the page with nothing drawn around it.

          The centre rule is its own layer, so it runs the full height of the
          grid instead of being interrupted at every cell boundary — the same
          reason the home page's service rows draw theirs that way.
        */}
        <div className="relative">
          <span
            aria-hidden="true"
            className="bg-indigo-deep/60 pointer-events-none absolute inset-y-0 left-1/2 hidden w-px lg:block"
          />

          {/* The last crossing. Every one above it is drawn by the cell that
              opens its row (see `CoverageEntry`), but the closing rule has no
              cell below it to carry its mark. */}
          <CrossingMark className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 translate-y-1/2 lg:block" />

          <ul className="border-indigo-deep/60 grid border-b lg:grid-cols-2">
            {service.coverage.map((item, index) => (
              <CoverageEntry
                key={item.key}
                service={service}
                item={item}
                index={index}
              />
            ))}
          </ul>
        </div>
      </SectionShell>

      {/*
        How an engagement runs, start to finish. Unwrapped, unlike every other
        section here: on a wide screen this one pins itself to the viewport and
        spends the scroll sideways, which needs the full width and its own
        height rather than a column and a padding rhythm. It brings its own
        shell in the layout that wants one.
      */}
      <ProcessTimeline service={service} />

      {/*
        The deliverable, against the report still life the home page closes its
        benefits section on — the same picture rather than a second rendering of
        the same idea.
      */}
      <SectionShell
        className="overflow-x-clip bg-transparent"
        data-testid={`service-${service.key}-report`}
        innerClassName="grid items-center gap-10 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-x-24 lg:pb-24"
      >
        <div
          ref={reportRef}
          className={clsx("flex flex-col gap-6", reportReveal)}
        >
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`servicePages.${service.key}.report.title`)}
          </h2>

          <p className="text-mist/75 max-w-prose text-base leading-relaxed text-pretty sm:text-lg">
            {t(`servicePages.${service.key}.report.body`)}
          </p>

          <ul className="flex flex-col gap-3">
            {service.deliverables.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2
                  aria-hidden="true"
                  className="text-lavender/70 mt-0.5 size-5 shrink-0"
                />
                <span className="text-mist/80 text-base leading-relaxed text-pretty">
                  {t(`servicePages.${service.key}.report.items.${item}`)}
                </span>
              </li>
            ))}
          </ul>

          {/*
            The same request the home page makes, wired to the same dialog. It
            is a `<button>` because it opens something rather than going
            somewhere, and takes the call-to-action's look from the shared class
            list instead of a second definition of it.
          */}
          <button
            type="button"
            data-testid={`service-${service.key}-sample-report`}
            onClick={() => {
              setReportOpen(true);
            }}
            className={brandButtonClass({ className: "mt-2 w-fit" })}
          >
            {t("benefits.cta")}
          </button>
        </div>

        <div
          ref={stackRef}
          className={clsx("mx-auto w-full max-w-lg lg:max-w-none", stackReveal)}
        >
          <ReportStack />
        </div>
      </SectionShell>

      <SampleReportModal
        open={reportOpen}
        onClose={() => {
          setReportOpen(false);
        }}
      />

      {/* Why it is us. */}
      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-reasons`}
        innerClassName="flex flex-col gap-8 pb-16 lg:gap-10 lg:pb-24"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`servicePages.${service.key}.reasons.title`)}
        </h2>

        <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {service.reasons.map((reason, index) => (
            <ReasonColumn
              key={reason}
              service={service}
              reason={reason}
              index={index}
            />
          ))}
        </ul>
      </SectionShell>

      {/* The same argument as the reasons above, but measured against what a
          conventional engagement gives you. */}
      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-comparison`}
        innerClassName="pb-16 lg:pb-24"
      >
        <ServiceComparison service={service} />
      </SectionShell>

      {/* The questions buyers actually ask, answered on the page. */}
      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-faq`}
        innerClassName="flex flex-col gap-8 pb-16 lg:pb-24"
      >
        <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
          {t(`servicePages.${service.key}.faq.title`)}
        </h2>

        <ServiceFaq serviceKey={service.key} entries={service.faqs} />
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid={`service-${service.key}-related`}
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("servicePages.labels.related")}
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((leaf, index) => (
              <PageLinkCard key={leaf.key} leaf={leaf} index={index} />
            ))}
          </ul>
        </SectionShell>
      )}

      <ClosingCta />
    </div>
  );
}

/**
 * One area the test covers, laid on the grid rather than boxed.
 *
 * The cell keeps the column's air on the side the centre rule is on, which is
 * how the home page's rows are spaced against theirs. Below `lg` there is one
 * column and no centre rule, so the padding and the mark both drop away and
 * the areas read as a plain ruled list.
 */
function CoverageEntry({
  service,
  item,
  index,
}: {
  service: ServiceDefinition;
  item: ServiceDefinition["coverage"][number];
  index: number;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: Math.min(index, 4) * 60,
  });
  const rightColumn = index % 2 === 1;

  return (
    <li
      ref={ref}
      style={style}
      data-testid={`service-coverage-${item.key}`}
      className={clsx(
        /*
         * The icon hangs in its own column with the title and the copy sharing
         * the one beside it, which is the same figure the process steps make
         * with their numbers. Set inline before the title instead, it pushed
         * the heading a icon's width to the right of its own paragraph — a
         * misalignment that reads as an accident on a grid this exposed.
         */
        /*
         * `content-start` is load-bearing, not tidiness.
         *
         * The cells sit in a grid that stretches every one of them to the
         * tallest in its row, and each cell is itself a grid of two auto rows.
         * Left at the default, the leftover height is shared out *between*
         * those rows — so a cell whose copy runs a line shorter than its
         * neighbour's had its title pushed down by half the difference, and the
         * six titles came to rest at four different heights. Measured on the
         * API page before this: rows of `41px 65px` against `28px 78px` beside
         * it, a 13px stagger visible across the whole grid.
         *
         * Packing the rows to the top puts the spare height where it belongs —
         * under the last line — and the titles line up whatever the copy does.
         */
        "border-indigo-deep/60 relative grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-4 gap-y-2 border-t py-6 lg:py-8",
        rightColumn ? "lg:pl-10 xl:pl-14" : "lg:pr-10 xl:pr-14",
        className,
      )}
    >
      {/*
        The crossing where this row's rule meets the centre one, drawn by the
        cell that opens the right-hand column because that cell's top-left
        corner *is* the crossing. Deriving it from the cell rather than placing
        marks at fixed heights is what keeps them on the rules when a row grows
        a line taller in another language.
      */}
      {rightColumn && (
        <CrossingMark className="absolute top-0 left-0 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
      )}

      {/* Nudged down onto the title's first line rather than its box, which
          sits a shade higher than the letters do. */}
      <Icon
        aria-hidden="true"
        className="text-lavender/70 mt-1 size-5 shrink-0"
      />

      <h3 className="font-display text-mist text-lg font-normal text-balance sm:text-xl">
        {t(`servicePages.${service.key}.coverage.items.${item.key}.title`)}
      </h3>

      <p className="text-mist/70 col-start-2 max-w-prose text-base leading-relaxed text-pretty">
        {t(`servicePages.${service.key}.coverage.items.${item.key}.body`)}
      </p>
    </li>
  );
}

/** One reason to pick us, as a column under a hairline. */
function ReasonColumn({
  service,
  reason,
  index,
}: {
  service: ServiceDefinition;
  reason: string;
  index: number;
}) {
  const { t } = useTranslation();
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: Math.min(index, 4) * 60,
  });

  return (
    <li
      ref={ref}
      style={style}
      data-testid={`service-reason-${reason}`}
      /*
       * A rule above rather than a card around: three bordered panels here
       * would be the coverage grid again two sections later, and this is the
       * page's argument, not another list of parts.
       */
      className={clsx(
        "border-indigo-deep/60 flex flex-col gap-3 border-t pt-6",
        className,
      )}
    >
      <h3 className="font-display text-mist text-lg font-normal text-balance sm:text-xl">
        {t(`servicePages.${service.key}.reasons.items.${reason}.title`)}
      </h3>

      <p className="text-mist/70 text-base leading-relaxed text-pretty">
        {t(`servicePages.${service.key}.reasons.items.${reason}.body`)}
      </p>
    </li>
  );
}
