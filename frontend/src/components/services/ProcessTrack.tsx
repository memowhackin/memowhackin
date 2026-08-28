import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useHorizontalPin } from "@/components/common/useHorizontalPin";
import { StepGlyph } from "@/components/services/StepGlyph";
import { stepTone } from "@/components/services/stepTone";
import type { ServiceDefinition } from "@/config/services";

/**
 * How wide one stage is.
 *
 * Wide enough that its copy sets at the measure the rest of the page uses, and
 * narrow enough that the next stage is always partly on screen — a panel that
 * fills the viewport gives no reason to keep scrolling, and one that fits three
 * times over turns the section into a shelf of cards.
 */
const PANEL_WIDTH = "34rem";

/**
 * One stage, as a panel on the track.
 *
 * The whole of it is on the page at all times, whether or not it is the one at
 * the middle: what the focus changes is only how much of it is lit. Nothing
 * here is revealed by arriving, so a reader who lands mid-section — a jump from
 * the search bar, a link into the page — is not looking at blanks.
 */
function ProcessPanel({
  service,
  step,
  index,
  total,
  active,
}: {
  service: ServiceDefinition;
  step: string;
  index: number;
  total: number;
  active: boolean;
}) {
  const { t } = useTranslation();

  return (
    <li
      style={stepTone(index, total)}
      data-panel=""
      data-step-index={index}
      data-testid={`service-step-${step}`}
      aria-current={active ? "step" : undefined}
      className={clsx(
        "group w-[var(--panel-w)] shrink-0 pr-10 last:pr-0 xl:pr-16 xl:last:pr-0",
        "motion-safe:transition-opacity motion-safe:duration-500",
        active ? "opacity-100" : "opacity-45",
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="font-display text-4xl leading-none text-[var(--step-tone)] tabular-nums xl:text-5xl"
          >
            <span className="opacity-45">0</span>
            {index + 1}
          </span>

          <StepGlyph step={step} active={active} />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-display text-mist text-xl font-normal text-balance xl:text-2xl">
            {t(`servicePages.${service.key}.process.steps.${step}.title`)}
            <span aria-hidden="true" className="text-lavender">
              .
            </span>
          </h3>

          <p className="text-mist/70 text-base leading-relaxed text-pretty">
            {t(`servicePages.${service.key}.process.steps.${step}.body`)}
          </p>
        </div>
      </div>
    </li>
  );
}

/**
 * The stages of an engagement, laid along a track the reader drives sideways.
 *
 * The section is taller than the screen by exactly the distance the track has
 * to travel. While that extra height is scrolled through, the pane inside is
 * `sticky` and holds still, and the track is translated by the same amount — so
 * scrolling down walks the stages left, scrolling up walks them back, and when
 * the last one is reached the page carries on down as if nothing had happened.
 * Arriving from below is the same thing in reverse, with no special case for it.
 *
 * See `useHorizontalPin` for why none of this touches the wheel event.
 *
 * The heading stays in the pane rather than scrolling away above it: it is the
 * question the six panels answer, and for the length of a pinned section the
 * reader has nothing else on screen to place them against.
 */
export function ProcessTrack({ service }: { service: ServiceDefinition }) {
  const { t } = useTranslation();
  const total = service.process.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const { outerRef, windowRef, trackRef } = useHorizontalPin<
    HTMLElement,
    HTMLDivElement,
    HTMLOListElement
  >({
    steps: total,
    onStep: setActiveIndex,
    enabled: true,
  });

  const panelWidth = { "--panel-w": PANEL_WIDTH } as CSSProperties;

  return (
    <section
      ref={outerRef}
      data-testid={`service-${service.key}-track`}
      /* The hook on the no-scripting fallback in `index.css`. */
      data-pinned-track=""
      /*
       * The section's own height is the screen plus the track's overhang, and
       * that overhang is measured, so the pin lasts exactly as long as there is
       * something left to move and not a pixel longer. Before the first
       * measurement the fallback is 0: the section is one screen tall and reads
       * as an ordinary block rather than a hole in the page.
       */
      style={{ height: "calc(100vh + var(--pin-shift, 0px))" }}
      className="relative"
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-10 overflow-hidden py-16 lg:gap-14">
        {/*
          Centred, unlike the same heading in the vertical layout.

          Left-aligned it sat in the top corner of an otherwise empty screen —
          the pane is a whole viewport wide and only the track below it fills
          that width, so the two lines read as stranded rather than as the
          section's opening. Centred, they sit over the middle of the track and
          the pane reads as one composition.
        */}
        <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-3 px-6 text-center sm:px-10 lg:px-16 2xl:px-0">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`servicePages.${service.key}.process.title`)}
          </h2>
          <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
            {t(`servicePages.${service.key}.process.intro`)}
          </p>
        </div>

        {/*
          The frame clips at the column's edges and carries no padding of its
          own: `clientWidth` counts padding in, and the travel is measured
          against it, so a padded frame would report more room than the panels
          actually get and the track would stop short of its last panel.

          The gutter lives on the track instead, which is what puts the first
          panel on the same left edge as the heading above it — and because it
          travels with the track, it slides away with the first panel rather
          than holding an indent open all the way along.
        */}
        <div
          ref={windowRef}
          className="mx-auto w-full max-w-[90rem] overflow-hidden"
        >
          <ol
            ref={trackRef}
            style={{
              ...panelWidth,
              /*
               * The travel itself: the whole track slid left by the same
               * distance the section's extra height is being scrolled through,
               * so a pixel of scroll is a pixel of sideways movement.
               */
              transform:
                "translateX(calc(-1 * var(--pin-progress, 0) * var(--pin-shift, 0px)))",
            }}
            /*
             * `translateX` on a composited layer, driven by one custom property
             * the hook rewrites per frame. Moving `scrollLeft` instead would put
             * layout on every one of those frames, and moving `margin` would put
             * layout and paint.
             */
            className="flex pl-6 will-change-transform sm:pl-10 lg:pl-16"
          >
            {service.process.map((step, index) => (
              <ProcessPanel
                key={step}
                service={service}
                step={step}
                index={index}
                total={total}
                active={index === activeIndex}
              />
            ))}

            {/*
              The column's gutter at the far end, as an element rather than as
              padding on the track.

              A scroll container's right padding is not counted in its
              `scrollWidth` — so measured that way the travel came up one gutter
              short and the last panel finished flush against the edge of the
              screen while the first had started on the column's margin. A child
              box is always counted.
            */}
            <span aria-hidden="true" className="w-6 shrink-0 sm:w-10 lg:w-16" />
          </ol>
        </div>
      </div>
    </section>
  );
}
