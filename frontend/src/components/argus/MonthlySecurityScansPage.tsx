import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Check, Plus, RotateCcw, Timer } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { AgenticPentesting } from "@/components/argus/AgenticPentesting";
import { ArgusHero, type SkeletonNav } from "@/components/argus/ArgusHero";
import { FeatureRow, FeatureRows } from "@/components/argus/FeatureRow";
import { LightBand } from "@/components/argus/LightBand";
import { useSeo } from "@/localization/useSeo";
import { SERVICE_AREA_SERVED } from "@/config/services";

/*
 * Monthly security scans.
 *
 * The page argues a cadence: a pentest sets the baseline, and from then on the
 * first Monday of every month produces a pass that is compared against it. It
 * opens on the product at size, explains what agentic pentesting is, sets the
 * baseline against the months that follow as a real comparison, and then walks
 * its features on the home page's service rows.
 */

/**
 * The captured sidebar, with every nav item masked except Monthly scans, so the
 * hero shows the one screen this page is about. Percentages of the export, so
 * they hold at any rendered width; see `SkeletonNav`.
 */
const SKELETON_NAV: SkeletonNav = {
  sidebar: 19.1,
  rows: [
    { top: 23.1, height: 1.6 },
    { top: 27.7, height: 1.6 },
    { top: 32.2, height: 1.7 },
    { top: 41.6, height: 1.6 },
    { top: 51, height: 1.7 },
    { top: 55.7, height: 1.5 },
    { top: 65.2, height: 1.8 },
  ],
};

const PATH = "/argus/monthly-security-scans";
const KEY = "argusPages.monthly";

/**
 * The four states, dressed exactly as the portal dresses them.
 *
 * `chip` is the status badge on the light board — a tinted rounded chip with
 * a coloured edge, which is how the product marks a finding in its own UI.
 * `legend` is the same badge restyled for the dark page, where the
 * explanations live. `severity` is the solid pill the dashboard puts beside
 * every finding, muted to grey once the finding is fixed.
 */
const LIFECYCLE: readonly {
  kind: "new" | "open" | "resolved" | "reappearing";
  severity: "critical" | "high" | "medium";
  icon: LucideIcon;
  chip: string;
  legend: string;
}[] = [
  {
    kind: "new",
    severity: "medium",
    icon: Plus,
    chip: "border-indigo/30 bg-indigo/10 text-indigo",
    legend: "border-lavender/30 bg-lavender/10 text-lavender",
  },
  {
    kind: "open",
    severity: "high",
    icon: Timer,
    chip: "border-ink-deep/20 bg-ink-deep/5 text-ink-deep/75",
    legend: "border-warning/30 bg-warning/10 text-warning",
  },
  {
    kind: "resolved",
    severity: "critical",
    icon: Check,
    chip: "border-success/40 bg-success/10 text-success",
    legend: "border-success/30 bg-success/10 text-success",
  },
  {
    kind: "reappearing",
    severity: "high",
    icon: RotateCcw,
    chip: "border-ember/35 bg-ember/10 text-ember",
    legend: "border-ember/30 bg-ember/10 text-ember",
  },
];

/**
 * Where each state's widget hangs around the screenshot, in the order
 * `LIFECYCLE` lists them. Pulled outside the frame so they read as annotations
 * on the product rather than as part of it.
 *
 * The first one is held down at 15% rather than pinned to the top corner: the
 * capture opens on the sidebar's logo, and a card across it covers the one
 * mark on the screen that says whose product this is.
 */
const WIDGET_PLACEMENT = [
  "top-[15%] -left-8",
  "top-1/3 -right-10",
  "-bottom-6 -left-10",
  "bottom-1/4 -right-8",
] as const;

const FAQ_ENTRIES = ["scope", "timing", "certify"] as const;

const HERO_POINTS = ["schedule", "delta", "iso"] as const;

/** Baseline versus the months after it, as the comparison it is. */
function ModelComparison() {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={clsx("flex flex-col gap-10", className)}>
      <div className="flex max-w-2xl flex-col gap-4">
        <h2 className="font-display text-service text-ink-deep font-normal text-balance">
          {t(`${KEY}.model.title`)}
        </h2>
        <p className="text-ink-deep/70 text-base leading-relaxed text-pretty sm:text-lg">
          {t(`${KEY}.model.p1`)}
        </p>
      </div>

      {/*
        Two cards with the join in a track of its own: the coin sits on a
        hairline in clear air rather than pinched between the card edges. On a
        phone the track turns sideways — cards stack, the rule runs across,
        and the coin stays centred on it.
      */}
      <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-0">
        {/* The pentest: the one-off, on the band's own light ground. */}
        <div className="border-ink-deep/10 flex flex-col gap-5 rounded-2xl border bg-white/70 p-6 lg:p-8">
          <h3 className="font-display text-ink-deep text-xl font-normal">
            {t(`${KEY}.model.pentest.title`)}
          </h3>
          <ul className="flex flex-col gap-3.5">
            {(["a", "b", "c"] as const).map((row) => (
              <li key={row} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="bg-indigo mt-2 size-1.5 shrink-0 rotate-45 rounded-xs"
                />
                <span className="text-ink-deep/75 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.model.pentest.${row}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* The join, decorative: the two headings carry the comparison for
            anyone who cannot see it. */}
        <div
          aria-hidden="true"
          className="relative flex min-h-14 items-center justify-center sm:min-h-0 sm:w-24"
        >
          <span className="bg-ink-deep/15 absolute inset-x-6 h-px sm:inset-x-auto sm:inset-y-8 sm:h-auto sm:w-px" />
          <span className="bg-ink-deep text-mist font-display relative grid size-11 place-items-center rounded-full text-xs tracking-wide uppercase">
            vs
          </span>
        </div>

        {/*
          The months after: the ARGUS side, raised out of the light band as a
          dark card — the same emphasis the service pages' comparison gives
          our column.
        */}
        <div className="border-lavender/25 bg-ink-deep flex flex-col gap-5 rounded-2xl border p-6 lg:p-8">
          <h3 className="font-display text-mist text-xl font-normal">
            {t(`${KEY}.model.monthly.title`)}
          </h3>
          <ul className="flex flex-col gap-3.5">
            {(["a", "b", "c"] as const).map((row) => (
              <li key={row} className="flex items-start gap-3">
                <Check
                  aria-hidden="true"
                  className="text-lavender mt-0.5 size-5 shrink-0"
                />
                <span className="text-mist/85 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.model.monthly.${row}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function MonthlySecurityScansPage() {
  const { t } = useTranslation();

  const { ref: lifeHeadRef, className: lifeHeadReveal } =
    useReveal<HTMLDivElement>();

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

      <ArgusHero
        base={KEY}
        image={{
          src: "/assets/dashboard-argus-1.png",
          width: 1115,
          height: 885,
        }}
        points={HERO_POINTS}
        skeletonNav={SKELETON_NAV}
        data-testid="argus-monthly-hero"
      />

      <AgenticPentesting data-testid="argus-monthly-agentic" />

      {/* Baseline versus monthly scans — the page's light passage. */}
      <LightBand data-testid="argus-monthly-model">
        <ModelComparison />
      </LightBand>

      {/* New, still open, resolved, reappearing: the four states a finding
          can be in after a scan, each wearing the chip the portal marks it
          with.

          `overflow-x-clip` because the glow behind the board is drawn wider
          than the board on purpose; without it that bleed is scrollable width
          on a phone, where the content column has no margin to absorb it. */}
      <SectionShell
        className="overflow-x-clip bg-transparent"
        data-testid="argus-monthly-lifecycle"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <div
          ref={lifeHeadRef}
          className={clsx("flex max-w-2xl flex-col gap-4", lifeHeadReveal)}
        >
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.lifecycle.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty">
            {t(`${KEY}.lifecycle.p1`)}
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <LifecycleBoard />

          {/* The legend: each badge from the board, explained in words. */}
          <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-4">
            {LIFECYCLE.map((entry, index) => (
              <LifecycleLegend key={entry.kind} entry={entry} index={index} />
            ))}
          </ul>
        </div>
      </SectionShell>

      {/* The features, on the home page's service rows. */}
      <FeatureRows data-testid="argus-monthly-rows">
        <FeatureRow
          data-testid="argus-monthly-trend"
          title={t(`${KEY}.trend.title`)}
          body={t(`${KEY}.trend.p1`)}
          framed
          visual={
            <img
              src="/assets/dashboard-argus-3.png"
              alt={t(`${KEY}.shots.trend`)}
              width={593}
              height={558}
              loading="lazy"
              className="block h-auto w-full"
            />
          }
        />

        <FeatureRow
          data-testid="argus-monthly-apps"
          imageFirst
          title={t(`${KEY}.apps.title`)}
          body={t(`${KEY}.apps.p1`)}
          framed
          visual={
            <img
              src="/assets/dashboard-argus-4.png"
              alt={t(`${KEY}.shots.apps`)}
              width={595}
              height={620}
              loading="lazy"
              className="block h-auto w-full"
            />
          }
        />

        <FeatureRow
          data-testid="argus-monthly-iso"
          title={t(`${KEY}.iso.title`)}
          body={t(`${KEY}.iso.p1`)}
          framed
          visual={
            <img
              src="/assets/dashboard-4.png"
              alt={t(`${KEY}.shots.iso`)}
              width={871}
              height={765}
              loading="lazy"
              className="block h-auto w-full"
            />
          }
        />
      </FeatureRows>

      <SectionShell
        className="bg-transparent"
        data-testid="argus-monthly-faq"
        innerClassName="py-14 lg:py-20"
      >
        <ServiceFaq base={`${KEY}.faq`} entries={FAQ_ENTRIES} />
      </SectionShell>

      <ClosingCta />
    </div>
  );
}

/**
 * The lifecycle on one screen: the real monthly-scan view, where findings are
 * already grouped by the state they landed in.
 *
 * The screenshot carries the product; the widgets around it carry the reading.
 * Each one is the portal's own state chip lifted out onto a small white card
 * and pinned to the edge of the frame, which is what turns a dense screen into
 * something a visitor can parse in a glance without us redrawing the UI.
 */
function LifecycleBoard() {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={clsx("relative mx-auto w-full max-w-5xl", className)}
    >
      {/*
        A soft indigo bloom behind the frame, the same one the ARGUS heroes
        use. It keeps a light screenshot from reading as a slab dropped onto a
        dark page.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(96,70,202,0.28) 0%, transparent 72%)",
        }}
      />

      {/* No white edge: the frame takes the page's own indigo hairline. */}
      <div className="border-indigo-deep/70 overflow-hidden rounded-2xl border">
        <img
          src="/assets/dashboard-argus-2.png"
          alt={t(`${KEY}.shots.lifecycle`)}
          width={1176}
          height={865}
          loading="lazy"
          className="block h-auto w-full"
        />
      </div>

      {/*
        The widgets. Hidden below `lg`, where there is no margin to hang them
        in and they would cover the screenshot they are annotating; the legend
        under the composition says the same things in text at every width.
      */}
      {LIFECYCLE.map((entry, index) => (
        <div
          key={entry.kind}
          aria-hidden="true"
          className={clsx(
            "border-ink-deep/10 absolute hidden max-w-[15rem] items-start gap-3 rounded-xl border bg-white p-3.5 shadow-[0_1rem_2.5rem_-1rem_rgba(13,11,33,0.55)] lg:flex",
            WIDGET_PLACEMENT[index],
          )}
        >
          <span
            className={clsx(
              "grid size-8 shrink-0 place-items-center rounded-full border",
              entry.chip,
            )}
          >
            <entry.icon className="size-3.5" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-ink-deep text-xs font-semibold">
              {t(`${KEY}.ui.lifecycle.${entry.kind}.chip`)}
            </span>
            <span className="text-ink-deep/60 text-[0.7rem] leading-snug text-pretty">
              {t(`${KEY}.ui.lifecycle.${entry.kind}.widget`)}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** One badge from the board, explained. The chip is the heading. */
function LifecycleLegend({
  entry,
  index,
}: {
  entry: (typeof LIFECYCLE)[number];
  index: number;
}) {
  const { t } = useTranslation();
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: index * 80,
  });

  return (
    <li
      ref={ref}
      style={style}
      data-testid={`argus-state-${entry.kind}`}
      className={clsx("flex flex-col gap-2.5", className)}
    >
      <span
        className={clsx(
          "flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide uppercase",
          entry.legend,
        )}
      >
        <entry.icon aria-hidden="true" className="size-3.5" />
        {t(`${KEY}.ui.lifecycle.${entry.kind}.chip`)}
      </span>
      <span className="text-mist/70 text-base leading-relaxed text-pretty">
        {t(`${KEY}.lifecycle.items.${entry.kind}.body`)}
      </span>
    </li>
  );
}
