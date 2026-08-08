import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { SectionShell } from "@/components/common/SectionShell";
import { LogoMark } from "@/components/common/Logo";
import { site } from "@/config/site";

/**
 * What the report contains. The frame scatters these across the page at hand-set
 * angles, which worked while the page underneath was blank; over an actual
 * document they land on top of the content and collide as the column narrows,
 * so they run as a legible row beneath it instead.
 */
const reportLabels = ["summary", "vectors", "risk", "scope", "steps"] as const;

/** Severity mix drawn across the summary bar and the finding rows. */
const severities = [
  { key: "critical", color: "bg-ember", share: "22%" },
  { key: "high", color: "bg-warning", share: "28%" },
  { key: "medium", color: "bg-lavender", share: "32%" },
  { key: "low", color: "bg-indigo", share: "18%" },
] as const;

/** Finding rows: severity marker plus the line of text it stands for. */
const findingRows = [
  { key: "one", color: "bg-ember", width: "86%" },
  { key: "two", color: "bg-warning", width: "72%" },
  { key: "three", color: "bg-warning", width: "78%" },
  { key: "four", color: "bg-lavender", width: "64%" },
  { key: "five", color: "bg-indigo", width: "70%" },
] as const;

/** Findings-over-time column chart on the report's second block. */
const trendBars = [
  { key: "a", height: "35%" },
  { key: "b", height: "55%" },
  { key: "c", height: "42%" },
  { key: "d", height: "78%" },
  { key: "e", height: "62%" },
  { key: "f", height: "94%" },
  { key: "g", height: "70%" },
  { key: "h", height: "48%" },
] as const;

/**
 * Abstract render of the deliverable — a report page with a risk summary, a
 * ranked finding list and the closing figures.
 *
 * It carries no copy of its own on purpose: the section text and the chips
 * beneath it say what the report contains, so this is decorative and hidden
 * from assistive technology rather than a wall of untranslated placeholder.
 */
function ReportPreview() {
  return (
    <div
      className="border-lavender/25 bg-ink-deep/90 flex w-full flex-col gap-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-sm sm:gap-5 sm:p-7"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <LogoMark className="text-lavender h-[1.25em] w-auto shrink-0 text-base" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="bg-mist/70 block h-2 w-2/5 rounded-full" />
          <span className="bg-mist/25 block h-1.5 w-1/4 rounded-full" />
        </div>
        <span className="border-lavender/40 rounded-selector flex shrink-0 items-center gap-1 border px-2 py-1.5">
          <span className="bg-lavender/70 block h-1 w-1 rounded-full" />
          <span className="bg-lavender/70 block h-1 w-4 rounded-full" />
        </span>
      </div>

      <span className="bg-lavender/20 block h-px w-full" />

      {/* Risk summary bar. */}
      <div className="flex flex-col gap-2">
        <span className="bg-mist/30 block h-1.5 w-1/3 rounded-full" />
        <div className="flex h-2.5 w-full overflow-hidden rounded-full">
          {severities.map((severity) => (
            <span
              key={severity.key}
              className={severity.color}
              style={{ width: severity.share }}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {severities.map((severity) => (
            <span key={severity.key} className="flex items-center gap-1.5">
              <span className={clsx("size-1.5 rounded-full", severity.color)} />
              <span className="bg-mist/25 block h-1.5 w-8 rounded-full" />
            </span>
          ))}
        </div>
      </div>

      {/* Findings over time. */}
      <div className="border-lavender/10 bg-indigo-deep/25 flex h-24 shrink-0 items-end gap-1 rounded-lg border p-3 sm:h-28">
        {trendBars.map((bar) => (
          <span
            key={bar.key}
            className="from-indigo to-lavender flex-1 rounded-t-xs bg-gradient-to-t"
            style={{ height: bar.height }}
          />
        ))}
      </div>

      {/* Ranked findings. */}
      <ul className="flex flex-col gap-2.5">
        {findingRows.map((row) => (
          <li
            key={row.key}
            className="border-lavender/10 bg-indigo-deep/25 flex items-center gap-3 rounded-lg border p-3"
          >
            <span className={clsx("size-2 shrink-0 rounded-full", row.color)} />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span
                className="bg-mist/45 block h-1.5 rounded-full"
                style={{ width: row.width }}
              />
              <span className="bg-mist/20 block h-1.5 w-1/3 rounded-full" />
            </span>
          </li>
        ))}
      </ul>

      {/* Closing figures. */}
      <div className="grid grid-cols-3 gap-2">
        {severities.slice(0, 3).map((severity) => (
          <div
            key={severity.key}
            className="border-lavender/10 bg-indigo-deep/25 flex flex-col gap-1.5 rounded-lg border p-3"
          >
            <span
              className={clsx("block h-1.5 w-6 rounded-full", severity.color)}
            />
            <span className="bg-mist/35 block h-2.5 w-3/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Report preview on the left, benefit copy and sample-report CTA on the right. */
export function Benefits() {
  const { t } = useTranslation();

  return (
    <SectionShell
      data-testid="benefits"
      className="bg-ink"
      innerClassName="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12 lg:py-28 xl:gap-20"
    >
      <div className="flex flex-col gap-6">
        {/*
          The stack sizes to the report rather than to a drawn aspect ratio: at
          narrow widths a fixed ratio was shorter than the page's own content,
          which then spilled over everything below it.
        */}
        <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:max-w-none">
          {/* The two report pages stacked behind the front one. */}
          <div
            className="border-lavender/15 absolute inset-y-[3%] -left-[3%] w-[92%] rotate-[-7deg] rounded-2xl border bg-gradient-to-br from-[#1d1948] to-[#131029] shadow-2xl"
            aria-hidden="true"
          />
          <div
            className="border-lavender/20 absolute inset-y-[1.5%] left-[2%] w-[95%] rotate-[-3.5deg] rounded-2xl border bg-gradient-to-br from-[#161238] to-[#0f0d24] shadow-2xl"
            aria-hidden="true"
          />

          <div className="relative">
            <ReportPreview />
          </div>
        </div>

        <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
          {reportLabels.map((label) => (
            <li
              key={label}
              data-testid={`benefit-label-${label}`}
              className="border-lavender/40 bg-indigo-deep/60 text-mist rounded-md border px-3 py-2 text-xs shadow-[0_0_1.5rem_rgba(173,157,238,0.25)] sm:text-sm"
            >
              {t(`benefits.labels.${label}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-8">
        <h2 className="font-display text-section text-mist font-normal text-balance">
          {t("benefits.title")}
        </h2>

        <div className="text-mist/80 flex flex-col gap-5 text-base leading-relaxed text-pretty">
          <p>{t("benefits.reportIntro")}</p>
          <p>{t("benefits.reportBody")}</p>
        </div>

        <BrandButton
          href={`${site.scannerBaseUrl}/sample-report`}
          data-testid="benefits-sample-report"
          className="w-fit"
        >
          {t("benefits.cta")}
        </BrandButton>
      </div>
    </SectionShell>
  );
}
