import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import {
  Callout,
  FindingDetail,
  FindingsRows,
  LatencyTrack,
  Marker,
  PortalPanel,
  SampleNote,
} from "@/components/argus/PortalUI";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * Live insights.
 *
 * The scanning page argues about coverage, so it is built on a wide table and a
 * grid of capabilities. This page argues about delay, which is a different
 * shape entirely: the picture that carries it is two clocks side by side, and
 * the middle of the page is one finding pulled apart rather than a list of
 * things the product does.
 *
 * That is why it is written out rather than composed from the same template.
 * The two pages should not look alike, because they are not saying the same
 * kind of thing.
 */

const PATH = "/argus/insights";
const KEY = "argusPages.insights";

function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );
  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

/** The queue and the finding opened from it, side by side. */
function PortalComposition() {
  const { t } = useTranslation();

  return (
    <div className="relative grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-8">
      <PortalPanel label={t(`${KEY}.ui.queueLabel`)}>
        <FindingsRows
          rows={(
            [
              ["bucket", "critical"],
              ["token", "high"],
              ["idor", "high"],
              ["headers", "medium"],
            ] as const
          ).map(([row, severity]) => ({
            severity,
            name: t(`${KEY}.ui.queue.${row}.name`),
            meta: t(`${KEY}.ui.queue.${row}.meta`),
          }))}
        />
      </PortalPanel>

      <div className="relative">
        <PortalPanel label={t(`${KEY}.ui.detailLabel`)}>
          <FindingDetail
            severity="critical"
            title={t(`${KEY}.ui.detail.title`)}
            state={t(`${KEY}.ui.detail.state`)}
            rows={(["reproduction", "reach", "rank", "fix"] as const).map(
              (row) => ({
                label: t(`${KEY}.ui.detail.rows.${row}.label`),
                value: t(`${KEY}.ui.detail.rows.${row}.value`),
                mono: row === "reproduction",
              }),
            )}
          />
        </PortalPanel>

        <Callout
          figure={t(`${KEY}.ui.callout.figure`)}
          label={t(`${KEY}.ui.callout.label`)}
          className="right-0 -bottom-8 sm:-right-6"
        />
      </div>
    </div>
  );
}

export function LiveInsightsPage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/retesting",
    "/argus/expert-chat",
    "/argus/continuous-scanning",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: shotRef, className: shotReveal } = useReveal<HTMLDivElement>({
    delay: 140,
  });
  const { ref: trackRef, className: trackReveal } = useReveal<HTMLDivElement>();

  useSeo({
    title: t("pages.argusInsights.title"),
    description: t("pages.argusInsights.description"),
    path: PATH,
    service: {
      name: t("pages.argusInsights.heading"),
      serviceType: "Live vulnerability reporting",
      areaServed: SERVICE_AREA_SERVED,
    },
  });

  /*
   * The same five parts, in the same order, as the rows of the panel above: the
   * marker beside each line here is the marker on that row. Renumbering one
   * without the other silently breaks the only thing tying them together.
   */
  const anatomy = ["reproduction", "reach", "rank", "fix", "state"];

  return (
    <div data-testid="argus-insights" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(96,70,202,0.2) 0%, transparent 72%)",
        }}
      />

      {/*
        Centred copy with the product underneath it at full width. The scanning
        page puts its picture beside the headline; this one puts it after, so
        the two pages do not open on the same shape.
      */}
      <SectionShell
        className="overflow-x-clip bg-transparent"
        data-testid="argus-insights-hero"
        innerClassName="flex flex-col items-center gap-12 pt-10 pb-16 lg:gap-16 lg:pt-16 lg:pb-24"
      >
        <div
          ref={heroRef}
          className={clsx(
            "flex max-w-3xl flex-col items-center gap-6 text-center",
            heroReveal,
          )}
        >
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${KEY}.hero.heading`)}
          </h1>

          <p className="text-mist/75 text-lg leading-relaxed text-pretty">
            {t(`${KEY}.hero.lede`)}
          </p>

          <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
            <BrandButton
              href={site.bookDemoUrl}
              variant="sweep"
              data-testid="page-book-demo"
              className="text-nowrap"
            >
              {t("nav.bookDemo")}
            </BrandButton>

            <Link
              to="/contact"
              data-testid="argus-insights-contact"
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`${KEY}.hero.secondary`)}
            </Link>
          </div>
        </div>

        <div
          ref={shotRef}
          className={clsx("flex w-full flex-col gap-12", shotReveal)}
        >
          <PortalComposition />
          <SampleNote />
        </div>
      </SectionShell>

      {/*
        The two clocks. This is the page's argument in one picture, so it gets a
        section to itself and nothing competes with it.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-insights-delay"
        innerClassName="flex flex-col gap-12 py-14 lg:py-20"
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.delay.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
            {t(`${KEY}.delay.body`)}
          </p>
        </div>

        <div ref={trackRef} className={clsx("w-full", trackReveal)}>
          <LatencyTrack
            lanes={(["report", "argus"] as const).map((lane) => ({
              name: t(`${KEY}.delay.lanes.${lane}.name`),
              tone: lane === "argus" ? "ours" : "them",
              /*
               * Both lanes are the same calendar, so a stop sits where its date
               * falls: day 3 of 31 is 10%, day 14 is 45%, day 30 is 97%. The
               * first version spread the ARGUS stops evenly across the track
               * while every one of them was labelled day 3, which drew a delay
               * the copy was busy saying does not exist.
               */
              positions: lane === "argus" ? [10] : [10, 45, 97],
              stops: (lane === "argus"
                ? (["sameDay"] as const)
                : (["found", "written", "delivered"] as const)
              ).map((stop) => ({
                label: t(`${KEY}.delay.lanes.${lane}.stops.${stop}.label`),
                day: t(`${KEY}.delay.lanes.${lane}.stops.${stop}.day`),
              })),
            }))}
          />
        </div>
      </SectionShell>

      {/*
        One finding, pulled apart. The numbers on the panel above are the same
        numbers as this list, which is the whole reason the list is numbered.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-insights-anatomy"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.anatomy.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
            {t(`${KEY}.anatomy.body`)}
          </p>
        </div>

        <ol className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-6 sm:grid-cols-2 lg:gap-x-20">
          {anatomy.map((part, index) => (
            <li
              key={part}
              data-testid={`argus-anatomy-${part}`}
              className="border-indigo-deep/60 flex gap-4 border-t pt-5"
            >
              <Marker index={index + 1} />
              <div className="flex min-w-0 flex-col gap-1.5">
                <span className="font-display text-mist text-lg font-normal">
                  {t(`${KEY}.anatomy.items.${part}.title`)}
                </span>
                <span className="text-mist/70 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.anatomy.items.${part}.body`)}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </SectionShell>

      {/* What it changes for the person holding the queue. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-insights-changes"
        innerClassName="flex flex-col gap-4 pb-16 lg:pb-24"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.changes.title`)}
        </h2>
        <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          {t(`${KEY}.changes.body`)}
        </p>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-insights-related"
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("argusPages.labels.related")}
          </h2>

          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
