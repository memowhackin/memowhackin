import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { sectionIds, site } from "@/config/site";

/**
 * Agent alerts pinned over the skyline. Positions are percentages of the band
 * of sky between the copy and the rooftops, so they hold as the section grows
 * and shrinks. `drop` is the connector line that runs from the alert down into
 * the city (Line 589-592 in the frame).
 */
const alerts = [
  {
    key: "attack",
    label: "agents.alerts.attack",
    position: "left-[4%] top-[34%]",
    drop: "5rem",
  },
  {
    key: "apiTesting",
    label: "agents.alerts.apiTesting",
    position: "left-[27%] top-[10%]",
    drop: "6rem",
  },
  {
    key: "files",
    label: "agents.alerts.files",
    position: "left-[52%] top-[13%]",
    drop: "4.5rem",
  },
  {
    key: "credentials",
    label: "agents.alerts.credentials",
    position: "left-[70%] top-[28%]",
    drop: "5rem",
  },
] as const;

/** Shared chip styling for both the pinned and the stacked presentation. */
const alertClassName =
  "bg-lavender text-ink-deep inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs leading-none font-medium shadow-lg sm:text-sm";

/**
 * The manifesto section: oversized mono headline over the skyline photograph,
 * with the agent alerts floating above the city.
 */
export function AutonomousAgents() {
  const { t } = useTranslation();

  return (
    <section
      id={sectionIds.demonstrate}
      data-testid="autonomous-agents"
      className="bg-ink-deep relative isolate flex min-h-[clamp(30rem,80svh,50rem)] w-full flex-col overflow-hidden"
    >
      <img
        src="/assets/skyline.webp"
        alt={t("agents.skylineAlt")}
        width={1920}
        height={1406}
        loading="lazy"
        className="absolute inset-0 -z-20 size-full object-cover object-bottom"
      />
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #0d0b21 0%, #0d0b2199 18%, #0d0b2100 45%, #0d0b2166 88%, #110f2a 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 pt-14 pb-10 text-center sm:px-10 sm:pt-20 lg:px-16 lg:pt-24 2xl:px-0">
        {/*
          The frame sets the headline on two fixed rows: 32px between words
          and 24px between the rows, which on top of the 0.9 type leading works
          out at 1.1. Geist Mono's own space is 0.6em wide, so word-spacing
          pulls it back to the drawn gap instead of adding to it. The row break
          lives in the translation as a newline so each language controls where
          it falls, rather than splitting the sentence into per-word keys.
        */}
        <h2 className="font-display text-display text-lavender-soft font-normal whitespace-pre-line lg:leading-[1.1] lg:[word-spacing:-0.333em]">
          {t("agents.title")}
        </h2>

        <p className="text-mist max-w-xl text-base text-pretty">
          {t("agents.subtitle")}
        </p>

        <BrandButton
          href={site.bookDemoUrl}
          variant="dark"
          data-testid="agents-book-demo"
          className="mt-2"
        >
          {t("agents.cta")}
        </BrandButton>

        {/*
          Below `lg` there is no clear sky to pin the alerts over, so the same
          four run as a wrapped row under the call to action instead of being
          dropped from the layout altogether.
        */}
        <ul className="mt-4 flex flex-wrap justify-center gap-2 lg:hidden">
          {alerts.map((alert) => (
            <li
              key={alert.key}
              data-testid={`agents-alert-compact-${alert.key}`}
              className={alertClassName}
            >
              <span
                className="bg-ink-deep size-1.5 shrink-0 rounded-xs"
                aria-hidden="true"
              />
              {t(alert.label)}
            </li>
          ))}
        </ul>
      </div>

      {/* The band of sky the alerts are pinned into. */}
      <div className="relative min-h-32 flex-1 sm:min-h-44 lg:min-h-60">
        {alerts.map((alert) => (
          <span
            key={alert.key}
            data-testid={`agents-alert-${alert.key}`}
            className={clsx(
              alertClassName,
              "absolute hidden lg:inline-flex",
              alert.position,
            )}
          >
            <span
              className="bg-ink-deep size-1.5 shrink-0 rounded-xs"
              aria-hidden="true"
            />
            {t(alert.label)}
            {/* Connector dropping from the alert into the skyline. */}
            <span
              className="border-lavender/60 absolute top-full left-2 w-0 border-l border-dotted"
              style={{ height: alert.drop }}
              aria-hidden="true"
            />
          </span>
        ))}
      </div>
    </section>
  );
}
