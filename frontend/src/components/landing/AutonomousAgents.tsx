import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { chipClass } from "@/components/common/chipClass";
import type { Perch } from "@/components/landing/useSkylineAlerts";
import { useSkylineAlerts } from "@/components/landing/useSkylineAlerts";
import { sectionIds } from "@/config/site";

/**
 * The findings the agents surface, drawn from at random. Each carries the two
 * texts of its life: what the agent is doing while it scans, and what it found
 * once the find confirms.
 */
const alerts = [
  {
    key: "attack",
    label: "agents.alerts.attack",
    scanning: "agents.scanning.attack",
  },
  {
    key: "apiTesting",
    label: "agents.alerts.apiTesting",
    scanning: "agents.scanning.apiTesting",
  },
  {
    key: "files",
    label: "agents.alerts.files",
    scanning: "agents.scanning.files",
  },
  {
    key: "credentials",
    label: "agents.alerts.credentials",
    scanning: "agents.scanning.credentials",
  },
] as const;

/** The character pool a label resolves out of while it flips. */
const SCRAMBLE_CHARS = "01<>#$&/|";

/** How long the flip from scanning text to finding takes. */
const SCRAMBLE_MS = 650;

/**
 * The chip's label, resolving from one text to the next through scrambled
 * characters when the find confirms.
 *
 * The frames are written to `textContent` through a ref rather than state —
 * one label re-rendering thirty times over a scramble would be thirty renders
 * of the whole section. React owns the final text (it is what the ref renders
 * with), the animation only owns the frames in between. On the still
 * arrangement, and anywhere else the text arrives without changing, nothing
 * animates.
 */
function AlertLabel({ text, still }: { text: string; still: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  /*
   * Starts empty, not at `text`: null marks the first effect run, which sets
   * the label directly — the entrance is the chip's drop-in, not a scramble.
   */
  const shown = useRef<string | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const from = shown.current;
    shown.current = text;

    if (still || from === null || from === text) {
      element.textContent = text;
      return;
    }

    let frame = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - started) / SCRAMBLE_MS, 1);
      // Resolves left to right: the settled head grows, the tail churns.
      const settled = Math.floor(text.length * progress);
      let out = text.slice(0, settled);
      for (let i = settled; i < text.length; i += 1) {
        out +=
          text[i] === " "
            ? " "
            : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      element.textContent = out;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      // Interrupted mid-flip — an exit can arrive early — land on the text.
      element.textContent = text;
    };
  }, [text, still]);

  /*
   * Deliberately childless: the effect is the only writer. Rendering `{text}`
   * here as well put two owners on one text node — the confirm re-renders the
   * section mid-scramble, React patches the node the scramble had already
   * replaced, and the chip ends up showing both strings frozen side by side.
   */
  return <span ref={ref} />;
}

/**
 * The buildings an alert can land on, measured off the photograph.
 *
 * `left` and `top` are percentages of the section, which from `lg` up is locked
 * to the picture's own 1920×1406 — so each pair stays on the building it was
 * read off at every width. `drop` is the connector below the chip, in `vw` as
 * the drawn ones were, and is set per building so the line ends on that
 * building's face rather than in the sky above it or in the water below.
 *
 * Two bands, for one reason. The copy block runs down the middle of the section
 * to about 47% of its height and about 22–78% of its width, so the towers out on
 * the flanks can be called out from high up — the two tallest are — while
 * everything under the headline has to be tagged below it. That is why the
 * middle perches sit at around 51–55% with short connectors and the outer ones
 * at 31–44% with long ones.
 *
 * They are packed closer than any two lit at once are allowed to be; the
 * scheduler keeps them apart (see `MIN_SEPARATION`). The point of the surplus is
 * that the same building rarely lights up twice in a row.
 */
const perches: readonly Perch[] = [
  { key: "westBlock", left: 2, top: 44.5, drop: 7.5 },
  { key: "westCrown", left: 7.5, top: 31, drop: 9.8 },
  { key: "westLow", left: 14.5, top: 42.5, drop: 6.6 },
  { key: "midWest", left: 27, top: 50.5, drop: 3.6 },
  { key: "twinSpire", left: 34.5, top: 51.5, drop: 4.2 },
  { key: "paleTower", left: 42, top: 53, drop: 5 },
  { key: "flatTop", left: 50.5, top: 51.5, drop: 5.9 },
  { key: "litCrown", left: 61.5, top: 52, drop: 5.5 },
  { key: "midEast", left: 69.5, top: 54, drop: 4.6 },
  { key: "pinkRoof", left: 76, top: 55, drop: 4 },
  { key: "eastFins", left: 80, top: 36, drop: 9.5 },
  { key: "eastLow", left: 85.5, top: 54, drop: 5 },
];

/**
 * Where the alerts stand when they are not cycling: the two flanking towers and
 * the block in the middle, which is the widest spread the perches allow.
 */
const restingPerches = ["westCrown", "flatTop", "eastFins"] as const;

/**
 * One phase of an alert's animation: entering, leaving, or standing still.
 * Written as a function because the alternative is a nested ternary at each of
 * the three parts an alert is made of.
 */
function phaseClass(
  still: boolean,
  leaving: boolean,
  entering: string,
  exiting: string,
): string | undefined {
  if (still) return undefined;
  if (leaving) return exiting;
  return entering;
}

/*
 * Look only — no display utility. The alert layer is hidden below `lg`, and
 * Tailwind emits `hidden` ahead of the display utilities, so an `inline-flex`
 * baked in here would beat it and paint the chips on a phone too.
 */
const alertClassName = chipClass();

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
 * grows to fit and the alerts sit the section out entirely.
 */
export function AutonomousAgents() {
  const { t } = useTranslation();
  const {
    ref: skylineRef,
    sightings,
    still,
  } = useSkylineAlerts<HTMLDivElement>({
    perches,
    alertCount: alerts.length,
    resting: restingPerches,
  });

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
      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 pt-14 pb-24 text-center sm:px-10 sm:pt-20 lg:max-w-none lg:gap-[3.33vw] lg:px-16 lg:pt-[8.75vw] lg:pb-0">
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

        {/*
          Two renderings of one call to action. Over the skyline's dusk the
          `dark` block is the drawn button, but below `lg` the section is
          cropped and the button lands on the city itself, where near-black on
          the buildings all but disappears — so a phone gets the brand
          lavender instead, the same colour as the mark in the logo. Wrapped
          rather than class-overridden: the button's own background utilities
          would fight a responsive override in the cascade.

          The alerts do not run on a phone at all. The perches only hold from
          `lg`, and the wrapped row of static chips that used to stand in for
          them read as clutter under the button rather than as a live city.
        */}
        <div className="lg:hidden">
          <Link
            to="/contact"
            data-testid="agents-book-demo-mobile"
            className={brandButtonClass({ variant: "solid" })}
          >
            {t("agents.cta")}
          </Link>
        </div>
        <div className="hidden lg:block">
          <Link
            to="/contact"
            data-testid="agents-book-demo"
            className={brandButtonClass({ variant: "dark" })}
          >
            {t("agents.cta")}
          </Link>
        </div>
      </div>

      {/*
        The alerts landing on the rooftops.

        A layer of its own, pinned over the whole section rather than a row in
        the flow, because each alert has to sit on a particular building. It
        never takes the pointer: the call to action is underneath it.

        The positions are data, so they are inline styles — Tailwind can only
        emit classes it can see in the source, and `left-[61.5%]` assembled at
        runtime would come out as no rule at all.
      */}
      <div
        ref={skylineRef}
        className="pointer-events-none absolute inset-0 hidden lg:block"
        aria-hidden="true"
      >
        {sightings.map((sighting) => {
          const perch = perches[sighting.perchIndex];
          const alert = alerts[sighting.alertIndex];
          if (!perch || !alert) return null;

          return (
            <span
              key={sighting.id}
              data-testid={`agents-alert-${alert.key}`}
              className="absolute flex flex-col items-start"
              style={{
                left: `${perch.left.toString()}%`,
                top: `${perch.top.toString()}%`,
              }}
            >
              <span
                className={clsx(
                  alertClassName,
                  "inline-flex whitespace-nowrap",
                  phaseClass(
                    still,
                    sighting.leaving,
                    "motion-safe:animate-alert-in",
                    "motion-safe:animate-alert-out",
                  ),
                )}
              >
                {/*
                  The marker is the severity light: indigo while the agent
                  scans, ember once the find confirms. Written as a swap rather
                  than an override on `chipMarkerClass` — two background
                  utilities on one element are settled by sheet order, not by
                  the order they are listed here. The still arrangement keeps
                  the indigo marker: it depicts a monitored city at rest, not
                  a wall of live criticals.
                */}
                <span
                  className={clsx(
                    "size-1.5 shrink-0 transition-colors duration-300 sm:size-2",
                    !still && sighting.confirmed
                      ? "bg-ember"
                      : "bg-indigo-deep",
                  )}
                  aria-hidden="true"
                />
                <AlertLabel
                  text={t(sighting.confirmed ? alert.label : alert.scanning)}
                  still={still}
                />
              </span>

              {/*
                Connector running from the alert down onto the building. It
                starts 8px in from the chip's left edge, as drawn, and its
                length is the perch's — held in `vw` so the run scales with the
                section rather than sliding off the roof as the picture grows.
              */}
              <span
                className="relative ml-2 block w-0.5"
                style={{ height: `${perch.drop.toString()}vw` }}
              >
                <span
                  className={clsx(
                    "alert-drop absolute inset-0 origin-top",
                    phaseClass(
                      still,
                      sighting.leaving,
                      "motion-safe:animate-drop-in",
                      "motion-safe:animate-drop-out",
                    ),
                  )}
                />

                <span
                  className={clsx(
                    "alert-drop-tip",
                    phaseClass(
                      still,
                      sighting.leaving,
                      "motion-safe:animate-tip-in",
                      "motion-safe:animate-tip-out",
                    ),
                  )}
                >
                  {/*
                    The halo only pulses while the alerts are cycling. On the
                    still arrangement it would be the one thing on the page
                    still moving, which is exactly what that arrangement is for
                    avoiding.
                  */}
                  <span
                    className={clsx(
                      "alert-drop-pulse",
                      !still && "motion-safe:animate-alert-ping",
                    )}
                  />
                </span>
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
