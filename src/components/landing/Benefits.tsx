import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { SectionShell } from "@/components/common/SectionShell";
import { site } from "@/config/site";

/**
 * The report chips. `position` and `rotation` are the Figma placements
 * expressed relative to the report frame so they scale with it.
 */
const reportLabels = [
  { key: "summary", position: "left-[70.7%] top-[7.5%]", rotation: "-4deg" },
  { key: "vectors", position: "left-[12.6%] top-[16.6%]", rotation: "-6deg" },
  { key: "risk", position: "left-[52.7%] top-[22.5%]", rotation: "-5deg" },
  { key: "scope", position: "left-[1%] top-[33.7%]", rotation: "-7deg" },
  { key: "steps", position: "left-[13.5%] top-[61.7%]", rotation: "-6deg" },
] as const;

/** Shared chip styling for both the scattered and the stacked presentation. */
const chipClassName =
  "border-lavender/40 bg-indigo-deep/80 text-mist rounded-md border px-3 py-2 text-xs shadow-[0_0_1.5rem_rgba(173,157,238,0.45)] backdrop-blur-sm sm:text-sm";

/** Report preview on the left, benefit copy and sample-report CTA on the right. */
export function Benefits() {
  const { t } = useTranslation();

  return (
    <SectionShell
      data-testid="benefits"
      className="bg-ink"
      innerClassName="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,706fr)_minmax(0,613fr)] lg:gap-[8%] lg:py-28"
    >
      <div className="border-lavender/20 relative aspect-[706/812] w-full max-w-[44rem] overflow-hidden rounded-2xl border">
        {/* The two report pages, tilted as they are in the frame. */}
        <div
          className="border-lavender/15 absolute top-[28%] -left-[2%] h-[110%] w-[78%] rounded-2xl border bg-gradient-to-br from-[#1d1948] to-[#131029] shadow-2xl"
          style={{ transform: "rotate(-9deg)" }}
          aria-hidden="true"
        />
        <div
          className="border-lavender/20 absolute top-[27%] left-[26%] h-[110%] w-[80%] rounded-2xl border bg-gradient-to-br from-[#161238] to-[#0f0d24] shadow-2xl"
          style={{ transform: "rotate(-9deg)" }}
          aria-hidden="true"
        />

        {/*
          The scattered placement needs the full-width frame to read; below xl
          the same labels are listed under the report instead (see below), which
          keeps them legible and stops them colliding as the column narrows.
        */}
        {reportLabels.map((label) => (
          <span
            key={label.key}
            data-testid={`benefit-label-${label.key}`}
            className={clsx(
              chipClassName,
              "absolute hidden whitespace-nowrap xl:block",
              label.position,
            )}
            style={{ transform: `rotate(${label.rotation})` }}
          >
            {t(`benefits.labels.${label.key}`)}
          </span>
        ))}
      </div>

      <ul className="-mt-6 flex flex-wrap gap-2 xl:hidden">
        {reportLabels.map((label) => (
          <li
            key={label.key}
            data-testid={`benefit-label-compact-${label.key}`}
            className={chipClassName}
          >
            {t(`benefits.labels.${label.key}`)}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-10">
        <h2 className="font-display text-section text-mist font-normal text-balance">
          {t("benefits.title")}
        </h2>

        <div className="text-mist/80 flex flex-col gap-6 text-base leading-6">
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
