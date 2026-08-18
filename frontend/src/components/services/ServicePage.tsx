import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { ReportStack } from "@/components/common/ReportStack";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { SampleReportModal } from "@/components/landing/SampleReportModal";
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

/** One numbered stage of an engagement. */
function ProcessStep({
  service,
  step,
  index,
}: {
  service: ServiceDefinition;
  step: string;
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
      data-testid={`service-step-${step}`}
      className={clsx(
        /*
         * The hairline sits on top of every row rather than between them, which
         * is what closes the list off at both ends — the same unbroken rule the
         * home page's service rows are drawn on. The last row's foot is closed
         * by the section's own padding.
         */
        "border-indigo-deep/60 grid gap-2 border-t py-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-6 lg:py-8",
        className,
      )}
    >
      {/*
        The step number, set in the display face at the weight the rest of the
        page gives a heading. It is decorative in the accessibility sense — the
        list is already ordered, and a screen reader announcing "one, one" is
        the kind of duplication `aria-hidden` exists for.
      */}
      <span
        aria-hidden="true"
        className="font-display text-lavender/70 text-lg leading-none tabular-nums sm:w-12 sm:text-xl lg:text-2xl"
      >
        {(index + 1).toString().padStart(2, "0")}
      </span>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-mist text-xl font-normal text-balance sm:text-2xl">
          {t(`servicePages.${service.key}.process.steps.${step}.title`)}
        </h3>
        <p className="text-mist/70 max-w-prose text-base leading-relaxed text-pretty">
          {t(`servicePages.${service.key}.process.steps.${step}.body`)}
        </p>
      </div>
    </li>
  );
}

/** One question, open on click and present in the markup either way. */
function FaqEntry({
  service,
  entry,
}: {
  service: ServiceDefinition;
  entry: string;
}) {
  const { t } = useTranslation();

  return (
    /*
     * A native `<details>`, not a state-driven panel. The answer is in the
     * document whether or not it is open, which is what a crawler and an answer
     * engine read — an accordion that mounts its answer on click ships a page of
     * questions with no answers on it. It also keeps the keyboard and the
     * screen-reader behaviour the browser already implements correctly.
     */
    <details
      data-testid={`service-faq-${entry}`}
      className="group border-indigo-deep bg-ink-deep overflow-hidden rounded-2xl border"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
        <h3 className="text-mist group-hover:text-lavender text-base font-medium text-pretty transition-colors sm:text-lg">
          {t(`servicePages.${service.key}.faq.items.${entry}.q`)}
        </h3>

        <ChevronDown
          aria-hidden="true"
          className="text-lavender/70 size-5 shrink-0 transition-transform duration-300 group-open:rotate-180"
        />
      </summary>

      <p className="text-mist/70 max-w-prose px-5 pb-5 text-base leading-relaxed text-pretty">
        {t(`servicePages.${service.key}.faq.items.${entry}.a`)}
      </p>
    </details>
  );
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
          {/* The site's own eyebrow, naming the group this page sits in — the
              same mark the blog and every home section are headed with. */}
          <p className="eyebrow text-lavender">{t("nav.services.label")}</p>

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

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.coverage.map((item, index) => (
            <CoverageCard
              key={item.key}
              service={service}
              item={item}
              index={index}
            />
          ))}
        </ul>
      </SectionShell>

      {/* How an engagement runs, start to finish. */}
      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-process`}
        innerClassName="flex flex-col gap-8 pb-16 lg:gap-10 lg:pb-24"
      >
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`servicePages.${service.key}.process.title`)}
          </h2>
          <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
            {t(`servicePages.${service.key}.process.intro`)}
          </p>
        </div>

        <ol className="flex flex-col">
          {service.process.map((step, index) => (
            <ProcessStep
              key={step}
              service={service}
              step={step}
              index={index}
            />
          ))}
        </ol>
      </SectionShell>

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

      {/* The questions buyers actually ask, answered on the page. */}
      <SectionShell
        className="bg-transparent"
        data-testid={`service-${service.key}-faq`}
        innerClassName="flex flex-col gap-8 pb-16 lg:pb-24"
      >
        <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
          {t(`servicePages.${service.key}.faq.title`)}
        </h2>

        <div className="flex max-w-4xl flex-col gap-3">
          {service.faqs.map((entry) => (
            <FaqEntry key={entry} service={service} entry={entry} />
          ))}
        </div>
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

/** One area the test covers. */
function CoverageCard({
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

  return (
    <li
      ref={ref}
      style={style}
      data-testid={`service-coverage-${item.key}`}
      className={clsx(
        "border-indigo-deep bg-ink-deep flex flex-col gap-3 rounded-2xl border p-5",
        className,
      )}
    >
      <Icon aria-hidden="true" className="text-lavender/70 size-6 shrink-0" />

      <h3 className="text-mist text-base font-medium text-pretty">
        {t(`servicePages.${service.key}.coverage.items.${item.key}.title`)}
      </h3>

      <p className="text-mist/60 text-sm leading-relaxed text-pretty">
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
