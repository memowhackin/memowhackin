import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { Check } from "lucide-react";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { FlowScene } from "@/components/argus/FlowScene";
import { LightBand } from "@/components/argus/LightBand";
import { PortalCapture } from "@/components/argus/PortalCapture";
import {
  Callout,
  ControlList,
  FindingsRows,
  PortalPanel,
  SampleNote,
  ScanStrip,
} from "@/components/argus/PortalUI";
import {
  AppList,
  DeltaBoard,
  MonthCalendar,
  TrendChart,
  type DeltaKind,
} from "@/components/argus/PortalViz";
import { relatedLeaves } from "@/components/argus/related";
import { useSeo } from "@/localization/useSeo";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * Monthly security scans.
 *
 * The page argues a cadence: a pentest sets the baseline, and from then on the
 * first Monday of every month produces a pass that is compared against it. So
 * the page is built around time — a calendar, a strip of months, a trend line —
 * where the retest page is built around one finding and the workspace page
 * around one live screen.
 *
 * Every picture is drawn from `PortalUI`/`PortalViz` in the page's own tokens,
 * with sample data marked as sample data. Each major panel is a
 * `PortalCapture` slot: dropping the named crop into `public/assets/argus/`
 * replaces the drawing with the real screenshot, no code change.
 */

const PATH = "/argus/monthly-security-scans";
const KEY = "argusPages.monthly";

const FLOW_STEPS = [
  "pentest",
  "baseline",
  "monday",
  "scan",
  "compare",
  "posture",
] as const;

const DELTA_KINDS: readonly DeltaKind[] = [
  "new",
  "open",
  "resolved",
  "reappearing",
];

/** The sample trend the posture sections draw: open findings, by month. */
const TREND_VALUES = [14, 11, 12, 9, 7, 8, 5, 4] as const;

const FAQ_ENTRIES = ["scope", "timing", "certify"] as const;

/*
 * October 2026 opens on a Thursday, so the first Monday is the 5th. Real
 * calendar arithmetic for the sample month, because a drawn calendar with the
 * highlight on an impossible day is the kind of detail a security buyer
 * notices.
 */
const CALENDAR = { offset: 3, days: 31, scanDay: 5 } as const;

/** The findings queue as the baseline pentest fills it. */
function PentestStage() {
  const { t } = useTranslation();
  const severities = ["critical", "high", "medium"] as const;

  return (
    <PortalPanel label={t(`${KEY}.ui.pentestLabel`)}>
      <FindingsRows
        rows={severities.map((severity) => ({
          severity,
          name: t(`${KEY}.ui.findings.${severity}.name`),
          meta: t(`${KEY}.ui.findings.${severity}.meta`),
        }))}
      />
    </PortalPanel>
  );
}

/** The moment the pentest's result becomes the reference point. */
function BaselineStage() {
  const { t } = useTranslation();
  const rows = ["critical", "high", "medium"] as const;

  return (
    <PortalPanel label={t(`${KEY}.ui.baselineLabel`)}>
      <ul className="divide-indigo-deep/60 divide-y">
        {rows.map((row) => (
          <li
            key={row}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span className="text-mist/75 text-sm">
              {t(`${KEY}.ui.baseline.${row}.label`)}
            </span>
            <span className="text-mist font-mono text-sm tabular-nums">
              {t(`${KEY}.ui.baseline.${row}.count`)}
            </span>
          </li>
        ))}
      </ul>
      <div className="border-indigo-deep/60 flex items-center gap-2 border-t px-4 py-3">
        <Check aria-hidden="true" className="text-lavender size-4 shrink-0" />
        <span className="text-mist/60 text-xs">
          {t(`${KEY}.ui.baseline.note`)}
        </span>
      </div>
    </PortalPanel>
  );
}

/** The calendar with the first Monday lit. */
function MondayStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.scheduleLabel`)}>
      <MonthCalendar
        month={t(`${KEY}.ui.calendar.month`)}
        weekdays={t(`${KEY}.ui.calendar.weekdays`).split(" ")}
        offset={CALENDAR.offset}
        days={CALENDAR.days}
        scanDay={CALENDAR.scanDay}
        scanLabel={t(`${KEY}.ui.calendar.scanLabel`)}
      />
    </PortalPanel>
  );
}

/** The pass itself, mid-run. */
function ScanStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.runLabel`)}>
      <ul className="divide-indigo-deep/60 divide-y">
        {(["inventory", "checks", "compare"] as const).map((row, index) => (
          <li key={row} className="flex flex-col gap-2 px-4 py-3">
            <span className="flex items-center justify-between gap-3">
              <span
                className={clsx(
                  "text-sm",
                  index < 2 ? "text-mist/85" : "text-mist/40",
                )}
              >
                {t(`${KEY}.ui.run.${row}.name`)}
              </span>
              <span
                className={clsx(
                  "shrink-0 text-xs",
                  index === 0 && "text-success",
                  index === 1 && "text-lavender",
                  index === 2 && "text-mist/35",
                )}
              >
                {t(`${KEY}.ui.run.${row}.state`)}
              </span>
            </span>

            {/* The one in-flight row carries the only moving part. */}
            {index === 1 && (
              <span className="bg-indigo-deep/60 h-1 overflow-hidden rounded-full">
                <span
                  className="bg-lavender block h-full origin-left rounded-full"
                  style={{ transform: "scaleX(0.62)" }}
                />
              </span>
            )}
          </li>
        ))}
      </ul>
    </PortalPanel>
  );
}

/** What this pass changed, against the last. */
function CompareStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.compareLabel`)}>
      <DeltaBoard
        items={DELTA_KINDS.map((kind) => ({
          kind,
          count: t(`${KEY}.ui.delta.${kind}.count`),
          label: t(`${KEY}.ui.delta.${kind}.label`),
        }))}
      />
    </PortalPanel>
  );
}

/** Where the numbers have been heading. */
function PostureStage() {
  const { t } = useTranslation();

  return (
    <PortalPanel label={t(`${KEY}.ui.postureLabel`)}>
      <TrendChart
        months={t(`${KEY}.ui.trendMonths`).split(" ")}
        values={TREND_VALUES}
      />
    </PortalPanel>
  );
}

/** The hero's status composition: the cadence, at a glance. */
function StatusComposition() {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <PortalCapture shot="monthly-status" altKey={`${KEY}.shots.status`}>
        <PortalPanel label={t(`${KEY}.ui.statusLabel`)}>
          <dl className="divide-indigo-deep/60 m-0 divide-y">
            {(["next", "last"] as const).map((row) => (
              <div
                key={row}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <dt className="text-mist/55 text-xs tracking-wide uppercase">
                  {t(`${KEY}.ui.${row}Label`)}
                </dt>
                <dd className="text-mist m-0 font-mono text-sm tabular-nums">
                  {t(`${KEY}.ui.${row}Value`)}
                </dd>
              </div>
            ))}
          </dl>

          <div className="border-indigo-deep/60 border-t p-4 pb-5">
            {/* mar..oct, with sep — the last pass — lit and oct still to run,
                matching the dates in the rows above. */}
            <ScanStrip
              months={t(`${KEY}.ui.months`).split(" ")}
              covered={7}
              current={6}
            />
          </div>
        </PortalPanel>
      </PortalCapture>

      <Callout
        figure={t(`${KEY}.ui.callout.figure`)}
        label={t(`${KEY}.ui.callout.label`)}
        className="-bottom-8 left-0 sm:-left-8"
      />
    </div>
  );
}

/** One split section: copy on one side, a captured panel on the other. */
function SplitSection({
  section,
  testId,
  reverse,
  children,
}: {
  section: string;
  testId: string;
  reverse?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={testId}
      innerClassName="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20"
    >
      <div
        ref={ref}
        className={clsx(
          "flex flex-col gap-5",
          reverse === true && "lg:order-2",
          className,
        )}
      >
        <p className="eyebrow text-lavender/70">
          {t(`${KEY}.${section}.eyebrow`)}
        </p>
        <h2 className="font-display text-service text-mist font-normal text-balance">
          {t(`${KEY}.${section}.title`)}
        </h2>
        <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
          {t(`${KEY}.${section}.p1`)}
        </p>
      </div>

      <div
        className={clsx(
          "flex flex-col gap-3",
          reverse === true && "lg:order-1",
        )}
      >
        {children}
        <SampleNote />
      </div>
    </SectionShell>
  );
}

export function MonthlySecurityScansPage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/live-pentest-workspace",
    "/argus/collaborative-retesting",
    "/services/web-app-pentesting",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: shotRef, className: shotReveal } = useReveal<HTMLDivElement>({
    delay: 120,
  });
  const { ref: cycleRef, className: cycleReveal } = useReveal<HTMLDivElement>();
  const { ref: lifeRef, className: lifeReveal } = useReveal<HTMLUListElement>();
  const { ref: modelRef, className: modelReveal } = useReveal<HTMLDivElement>();

  const faq = useMemo(
    () =>
      FAQ_ENTRIES.map((entry) => ({
        question: t(`${KEY}.faq.items.${entry}.q`),
        answer: t(`${KEY}.faq.items.${entry}.a`),
      })),
    [t],
  );
  const serviceSchema = useMemo(
    () => ({
      name: t("pages.argusMonthly.heading"),
      serviceType: "Recurring security scanning",
      areaServed: SERVICE_AREA_SERVED,
    }),
    [t],
  );

  useSeo({
    title: t("pages.argusMonthly.title"),
    description: t("pages.argusMonthly.description"),
    path: PATH,
    service: serviceSchema,
    faq,
  });

  return (
    <div data-testid="argus-monthly" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(55% 100% at 50% 0%, rgba(96,70,202,0.22) 0%, transparent 70%)",
        }}
      />

      {/* Copy on the left, the cadence on the right, with room under the
          composition for the callout that hangs off its foot. */}
      <SectionShell
        className="overflow-x-clip bg-transparent"
        data-testid="argus-monthly-hero"
        innerClassName="grid grid-cols-1 items-center gap-14 pt-10 pb-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-x-16 lg:pt-16 lg:pb-28"
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-start gap-6", heroReveal)}
        >
          <p
            className="font-display text-lavender/80 text-sm font-light tracking-[0.5em] uppercase"
            aria-label="ARGUS"
          >
            Argus
          </p>

          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${KEY}.hero.heading`)}
          </h1>

          <p className="text-mist/75 max-w-xl text-lg leading-relaxed text-pretty">
            {t(`${KEY}.hero.lede`)}
          </p>

          <ul className="flex flex-col gap-2.5">
            {(["schedule", "delta", "iso"] as const).map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check
                  aria-hidden="true"
                  className="text-lavender mt-1 size-4 shrink-0"
                />
                <span className="text-mist/80 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.hero.points.${point}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-1 flex flex-wrap items-center gap-4">
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
              data-testid="argus-monthly-contact"
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`${KEY}.hero.secondary`)}
            </Link>
          </div>
        </div>

        <div ref={shotRef} className={clsx("flex flex-col gap-3", shotReveal)}>
          <StatusComposition />
          <SampleNote className="mt-8" />
        </div>
      </SectionShell>

      {/* The cycle, walked: pentest to baseline to first Monday to posture. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-monthly-cycle"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <div
          ref={cycleRef}
          className={clsx("flex flex-col gap-3", cycleReveal)}
        >
          <p className="eyebrow text-lavender/70">
            {t(`${KEY}.cycle.eyebrow`)}
          </p>
          <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.cycle.title`)}
          </h2>
        </div>

        <FlowScene
          base={`${KEY}.cycle`}
          steps={FLOW_STEPS}
          stages={[
            <PentestStage key="pentest" />,
            <BaselineStage key="baseline" />,
            <MondayStage key="monday" />,
            <ScanStage key="scan" />,
            <CompareStage key="compare" />,
            <PostureStage key="posture" />,
          ]}
          data-testid="argus-monthly-flow"
        />
      </SectionShell>

      {/* Baseline versus monthly scans — the page's light passage. */}
      <LightBand data-testid="argus-monthly-model">
        <div
          ref={modelRef}
          className={clsx("flex flex-col gap-10", modelReveal)}
        >
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="eyebrow text-indigo">{t(`${KEY}.model.eyebrow`)}</p>
            <h2 className="font-display text-service text-ink-deep font-normal text-balance">
              {t(`${KEY}.model.title`)}
            </h2>
            <p className="text-ink-deep/70 text-base leading-relaxed text-pretty sm:text-lg">
              {t(`${KEY}.model.p1`)}
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:gap-16">
            {(["pentest", "monthly"] as const).map((column) => (
              <div key={column} className="flex flex-col">
                <h3 className="font-display text-ink-deep border-ink-deep/20 border-b pb-4 text-xl font-normal">
                  {t(`${KEY}.model.${column}.title`)}
                </h3>
                <ul className="flex flex-col">
                  {(["a", "b", "c"] as const).map((row) => (
                    <li
                      key={row}
                      className="border-ink-deep/10 flex items-start gap-3 border-b py-4"
                    >
                      <span
                        aria-hidden="true"
                        className="bg-indigo mt-2 size-1.5 shrink-0 rotate-45 rounded-xs"
                      />
                      <span className="text-ink-deep/75 text-base leading-relaxed text-pretty">
                        {t(`${KEY}.model.${column}.${row}`)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </LightBand>

      {/* New, still open, resolved, reappearing: the four states a finding
          can be in after a pass, as content rather than as a screenshot. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-monthly-lifecycle"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="eyebrow text-lavender/70">
            {t(`${KEY}.lifecycle.eyebrow`)}
          </p>
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.lifecycle.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty">
            {t(`${KEY}.lifecycle.p1`)}
          </p>
        </div>

        <ul
          ref={lifeRef}
          className={clsx(
            "grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4",
            lifeReveal,
          )}
        >
          {DELTA_KINDS.map((kind) => (
            <li
              key={kind}
              data-testid={`argus-state-${kind}`}
              className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-5"
            >
              <span className="font-display text-mist text-lg font-normal">
                {t(`${KEY}.lifecycle.items.${kind}.title`)}
              </span>
              <span className="text-mist/70 text-base leading-relaxed text-pretty">
                {t(`${KEY}.lifecycle.items.${kind}.body`)}
              </span>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* Security posture over time. */}
      <SplitSection section="trend" testId="argus-monthly-trend">
        <PortalCapture shot="monthly-trend" altKey={`${KEY}.shots.trend`}>
          <PortalPanel label={t(`${KEY}.ui.postureLabel`)}>
            <TrendChart
              months={t(`${KEY}.ui.trendMonths`).split(" ")}
              values={TREND_VALUES}
            />
          </PortalPanel>
        </PortalCapture>
      </SplitSection>

      {/* Multiple applications, one overview. */}
      <SplitSection section="apps" testId="argus-monthly-apps" reverse>
        <PortalCapture shot="monthly-applications" altKey={`${KEY}.shots.apps`}>
          <PortalPanel label={t(`${KEY}.ui.appsLabel`)}>
            <AppOverview />
          </PortalPanel>
        </PortalCapture>
      </SplitSection>

      {/* ISO 27001 mapping, with its limits stated in the open. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-monthly-iso"
        innerClassName="grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20"
      >
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-lavender/70">{t(`${KEY}.iso.eyebrow`)}</p>
          <h2 className="font-display text-service text-mist font-normal text-balance">
            {t(`${KEY}.iso.title`)}
          </h2>
          <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
            {t(`${KEY}.iso.p1`)}
          </p>
          {/* The honest sentence, in the copy rather than in a footnote:
              mapping is traceability, not certification. */}
          <p className="border-lavender/40 text-mist/60 border-l-2 pl-4 text-sm leading-relaxed text-pretty">
            {t(`${KEY}.iso.note`)}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <PortalCapture shot="monthly-iso" altKey={`${KEY}.shots.iso`}>
            <PortalPanel label={t(`${KEY}.ui.isoLabel`)}>
              <ControlList
                rows={(["a", "b", "c"] as const).map((row) => ({
                  id: t(`${KEY}.ui.controls.${row}.id`),
                  title: t(`${KEY}.ui.controls.${row}.title`),
                  evidence: t(`${KEY}.ui.controls.${row}.evidence`),
                }))}
              />
            </PortalPanel>
          </PortalCapture>
          <SampleNote />
        </div>
      </SectionShell>

      <SectionShell
        className="bg-transparent"
        data-testid="argus-monthly-faq"
        innerClassName="py-14 lg:py-20"
      >
        <ServiceFaq base={`${KEY}.faq`} entries={FAQ_ENTRIES} />
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-monthly-related"
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("argusPages.labels.related")}
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

/** Every scoped application with its own count, plus the portfolio total. */
function AppOverview() {
  const { t } = useTranslation();
  const rows = ["portal", "api", "shop"] as const;

  return (
    <div className="flex flex-col">
      <AppList
        rows={rows.map((row) => ({
          name: t(`${KEY}.ui.apps.${row}.name`),
          open: t(`${KEY}.ui.apps.${row}.open`),
          delta: t(`${KEY}.ui.apps.${row}.delta`),
        }))}
      />

      <div className="border-indigo-deep/60 flex items-center justify-between gap-3 border-t px-4 py-3">
        <span className="text-mist/55 text-xs tracking-wide uppercase">
          {t(`${KEY}.ui.apps.totalLabel`)}
        </span>
        <span className="text-mist font-mono text-sm tabular-nums">
          {t(`${KEY}.ui.apps.totalValue`)}
        </span>
      </div>
    </div>
  );
}
