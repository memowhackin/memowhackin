import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { sectionIds, site } from "@/config/site";

/**
 * Agent alerts pinned over the skyline. Positions are percentages of the band
 * between the copy and the foot of the city, so they hold as the section grows
 * and shrinks. `drop` is the connector tick that pins each alert to the roof
 * below it (Line 589-592 in the frame).
 */
const alerts = [
  {
    key: "attack",
    label: "agents.alerts.attack",
    position: "left-[4%] top-[26%]",
    drop: "h-10",
  },
  {
    key: "apiTesting",
    label: "agents.alerts.apiTesting",
    position: "left-[27%] top-[4%]",
    drop: "h-16",
  },
  {
    key: "files",
    label: "agents.alerts.files",
    position: "left-[52%] top-[12%]",
    drop: "h-12",
  },
  {
    key: "credentials",
    label: "agents.alerts.credentials",
    position: "left-[70%] top-[20%]",
    drop: "h-14",
  },
] as const;

/** Shared chip styling for both the pinned and the stacked presentation. */
/*
 * Look only — no display utility. The pinned copies below are switched off with
 * `hidden`, and Tailwind emits that rule ahead of the display utilities, so an
 * `inline-flex` baked in here would beat it and paint both sets at once.
 */
const alertClassName =
  "bg-lavender text-ink-deep items-center gap-2 rounded-md px-2.5 py-1.5 text-xs leading-none font-medium shadow-lg sm:text-sm";

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
      /*
       * The height tracks the viewport width, not its height. The photograph
       * is 1920×1406, so a cover fit scales it with the width: at a fixed
       * height the slice on show shrank as the screen widened, and past about
       * 2000px the city had scrolled out of frame entirely, leaving flat navy.
       * Tying the two together keeps roughly the same band of the picture at
       * every width.
       */
      className="bg-ink-deep relative isolate flex min-h-[clamp(26rem,40vw,58rem)] w-full flex-col overflow-hidden"
    >
      {/*
        The photograph is a warm sunset — oranges and pinks — which was the one
        warm thing on an otherwise indigo page and read as a stock image dropped
        into the layout. Desaturating it and laying the brand indigo over it in
        `color` blend mode keeps the photograph's luminance while taking its hue
        from the palette, so the city belongs to the rest of the site.
      */}
      <div className="absolute inset-0 -z-20">
        <img
          src="/assets/skyline.webp"
          alt={t("agents.skylineAlt")}
          width={1920}
          height={1406}
          loading="lazy"
          /* Anchored just above the bottom edge: the last strip of the photo is
             unlit foreground, and dropping it keeps the rooftops in the frame. */
          className="size-full object-cover object-[50%_82%] [filter:saturate(0.55)]"
        />
        <div
          className="bg-indigo absolute inset-0 mix-blend-color"
          aria-hidden="true"
        />
      </div>

      {/*
        Legibility wash. The headline sits over the busiest part of the picture,
        so the top stays dark through the copy and only opens up below the call
        to action, where the rooftops and the alerts are.
      */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #0d0b21 0%, #0d0b21d9 24%, #0d0b2159 52%, #0d0b2166 82%, #110f2a 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 pt-14 pb-10 text-center sm:px-10 sm:pt-20 lg:px-16 lg:pt-24 2xl:px-0">
        {/*
          The frame draws this on two fixed rows and closes the word gaps to
          hit them. Reproducing that with negative `word-spacing` pulled the
          words of the second row into each other and left the full stop
          floating clear of "work" — Geist Mono's space is already 0.6em, so
          subtracting a third of an em from it is far too much. The measure and
          `text-balance` set the two rows instead, which also lets the break
          move as the type scales and as the copy changes language.
        */}
        <h2 className="font-display text-display text-lavender-soft mx-auto max-w-[19ch] font-normal text-balance lg:leading-[1.05]">
          {t("agents.title")}
        </h2>

        <p className="text-mist/90 max-w-xl text-base text-pretty sm:text-lg">
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
              className={clsx(alertClassName, "inline-flex")}
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
      {/*
        The band only has to hold the pinned alerts, which start at `lg`. Below
        that it is just sky, so it keeps a slim margin under the copy instead of
        a screen of empty city.
      */}
      <div className="relative min-h-16 flex-1 sm:min-h-28 lg:min-h-60">
        {alerts.map((alert) => (
          <span
            key={alert.key}
            data-testid={`agents-alert-${alert.key}`}
            className={clsx(
              "absolute hidden flex-col items-start lg:flex",
              alert.position,
            )}
          >
            <span className={clsx(alertClassName, "inline-flex")}>
              <span
                className="bg-ink-deep size-1.5 shrink-0 rounded-xs"
                aria-hidden="true"
              />
              {t(alert.label)}
            </span>

            {/*
              A short tick, not a full drop to the floor: it reads as the alert
              being pinned to the roof just below it. Run to the bottom of the
              band instead and it becomes a long line trailing off into the dark
              base of the photograph.
            */}
            <span
              className={clsx(
                "border-lavender/50 ml-2 w-0 border-l border-dotted",
                alert.drop,
              )}
              aria-hidden="true"
            />
          </span>
        ))}
      </div>
    </section>
  );
}
