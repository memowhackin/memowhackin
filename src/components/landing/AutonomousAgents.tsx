import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { sectionIds, site } from "@/config/site";

/**
 * Agent alerts scattered over the skyline.
 *
 * The columns are the Figma placements as fractions of the 1920 canvas, and
 * `drop` is the frame's own connector length (Lines 589-592: 189px, or 114px
 * for the short one over the centre) held as a fraction too, so the whole
 * arrangement scales with the section instead of being re-guessed per
 * breakpoint.
 *
 * Rows included: the section holds the frame's own 1920×1406, so these are the
 * drawn positions unchanged.
 */
const alerts = [
  {
    key: "apiTesting",
    label: "agents.alerts.apiTesting",
    position: "left-[26.93%] top-[42.6%]",
    drop: "h-[9.84vw]",
  },
  {
    key: "files",
    label: "agents.alerts.files",
    position: "left-[54.74%] top-[47.08%]",
    drop: "h-[5.94vw]",
  },
  {
    key: "credentials",
    label: "agents.alerts.credentials",
    position: "left-[68.44%] top-[48.29%]",
    drop: "h-[9.84vw]",
  },
  {
    key: "attack",
    label: "agents.alerts.attack",
    position: "left-[5.05%] top-[53.7%]",
    drop: "h-[9.84vw]",
  },
] as const;

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
 *
 * From `lg` up the section is the frame's 1920×1406, which is also the exact
 * proportion of the photograph, so nothing is cropped and every placement
 * inside it is the drawn one. An earlier pass cut this to 1920×1100 because the
 * section looked like a screen of empty dark — but that was the heavy wash that
 * used to sit over the picture, not the height.
 *
 * Below `lg` the copy needs more room than the ratio allows, so the section
 * grows to fit and the alerts stack under the call to action instead.
 */
export function AutonomousAgents() {
  const { t } = useTranslation();

  return (
    <section
      id={sectionIds.demonstrate}
      data-testid="autonomous-agents"
      className="bg-ink-deep relative isolate w-full overflow-hidden lg:aspect-[1920/1406]"
    >
      {/*
        The photograph carries the whole section on its own. Sampling the
        frame's render against this file, the two agree to within a few values
        at every depth: the lavender sky, the warm horizon and the dark base are
        all in the picture, and its last rows land on #110f2a — the colour the
        next section opens on. So it is drawn untouched, at its own 1920×1406.

        It had been desaturated and given an indigo `color` blend to pull the
        warm sunset into the palette. That was a misread: the warmth is the
        design.
      */}
      <img
        src="/assets/skyline.webp"
        alt={t("agents.skylineAlt")}
        width={1920}
        height={1406}
        loading="lazy"
        className="absolute inset-0 -z-20 size-full object-cover object-bottom"
      />

      {/*
        The one departure from the frame. Over the untouched sky the headline
        sits at about 2.6:1 and the sub-heading nearer 1.9:1, which is not
        readable. This is the lightest scrim that carries them past 4.5:1; it is
        gone by the horizon, so the city and the alerts below are the
        photograph as drawn.
      */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(13,11,33,0.55) 0%, rgba(13,11,33,0.42) 28%, rgba(13,11,33,0) 52%)",
        }}
      />

      {/*
        Spacing runs in `vw` from `lg` up for the same reason as the alerts: the
        frame's 168px lead-in and 64px gaps are fractions of a 1920 canvas, and
        holding them as fractions keeps the copy sitting where it was drawn.
      */}
      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 pt-14 pb-12 text-center sm:px-10 sm:pt-20 lg:max-w-none lg:gap-[3.33vw] lg:px-16 lg:pt-[8.75vw] lg:pb-0">
        {/*
          Straight from the frame (node 83:41778): each word is its own element
          on two rows, `gap-[32px]` between words and `gap-[24px]` between the
          rows, over `leading-[0.9]` at 120px.

          Geist Mono's own space is 0.6em — 72px at that size — and the
          -0.06em tracking takes another 7.2px off it, so word-spacing has to
          give back 32.8px, not the 40px that the raw 72→32 difference
          suggests. At -0.333em the gap measured 24.8px against the drawn 32.
          0.9 leading plus the 24px row gap is a line box of 1.1. Splitting the
          sentence into per-word elements to match literally would hard-code
          English word order, so the break stays a newline in the translation
          and each language decides where it falls.

          All of this is scoped to `lg`: below it the forced break made four
          ragged rows on a phone, so the newline collapses to an ordinary space
          and the headline wraps to fit.
        */}
        <h2 className="font-display text-display text-lavender-soft mx-auto max-w-[19ch] font-normal text-balance whitespace-normal lg:max-w-none lg:leading-[1.1] lg:whitespace-pre-line lg:[word-spacing:-0.2733em]">
          {t("agents.title")}
        </h2>

        <p className="text-mist/90 max-w-xl text-base text-pretty sm:text-lg">
          {t("agents.subtitle")}
        </p>

        <BrandButton
          href={site.bookDemoUrl}
          variant="dark"
          data-testid="agents-book-demo"
        >
          {t("agents.cta")}
        </BrandButton>

        {/*
          The scatter is drawn for a 1920 canvas and only has room from `2xl`.
          Below that the copy block takes a larger share of the section — the
          type does not shrink in step with the width — and the middle alert
          lands on the call to action. So the same four run as a wrapped row
          under it instead of being dropped from the layout altogether.
        */}
        <ul className="mt-2 flex flex-wrap justify-center gap-2 2xl:hidden">
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

      {alerts.map((alert) => (
        <span
          key={alert.key}
          data-testid={`agents-alert-${alert.key}`}
          className={clsx(
            "absolute hidden flex-col items-start 2xl:flex",
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

          {/* Connector running from the alert down into the skyline. */}
          <span
            className={clsx(
              "border-lavender/50 ml-2 w-0 border-l border-dotted",
              alert.drop,
            )}
            aria-hidden="true"
          />
        </span>
      ))}
    </section>
  );
}
