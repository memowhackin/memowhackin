import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { sectionIds, site } from "@/config/site";

/**
 * Agent alerts pinned over the skyline. Positions are the Figma coordinates as
 * percentages of the photograph, so they hold as the image scales. `drop` is
 * the connector line that runs from the alert down into the city (Line 589-592
 * in the frame).
 */
const alerts = [
  { key: "attack", label: "agents.alerts.attack", position: "left-[5.1%] top-[53.7%]", drop: "7rem" },
  { key: "apiTesting", label: "agents.alerts.apiTesting", position: "left-[26.9%] top-[42.6%]", drop: "7rem" },
  { key: "files", label: "agents.alerts.files", position: "left-[52%] top-[43.5%]", drop: "4.25rem" },
  { key: "credentials", label: "agents.alerts.credentials", position: "left-[70%] top-[50.5%]", drop: "7rem" },
] as const;

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
      className="bg-ink-deep relative isolate w-full overflow-hidden"
    >
      <img
        src="/assets/skyline.webp"
        alt={t("agents.skylineAlt")}
        width={1920}
        height={1406}
        loading="lazy"
        className="absolute inset-x-0 bottom-0 -z-20 h-full w-full object-cover object-bottom"
      />
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #0d0b21 0%, #0d0b2199 18%, #0d0b2100 45%, #0d0b2166 88%, #110f2a 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 pt-16 pb-72 text-center sm:px-10 sm:pt-24 sm:pb-96 lg:px-16 lg:pt-32 lg:pb-[34rem] xl:pb-[40rem] 2xl:px-0">
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

        <p className="text-mist text-base">{t("agents.subtitle")}</p>

        <BrandButton
          href={site.bookDemoUrl}
          variant="dark"
          data-testid="agents-book-demo"
          className="mt-2"
        >
          {t("agents.cta")}
        </BrandButton>
      </div>

      {alerts.map((alert) => (
        <span
          key={alert.key}
          data-testid={`agents-alert-${alert.key}`}
          className={clsx(
            "bg-lavender text-ink-deep absolute hidden items-center gap-2 rounded-md px-2.5 py-1.5 text-xs leading-none font-medium shadow-lg lg:inline-flex xl:text-sm",
            alert.position,
          )}
        >
          <span
            className="bg-ink-deep size-1.5 rounded-xs"
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
    </section>
  );
}
