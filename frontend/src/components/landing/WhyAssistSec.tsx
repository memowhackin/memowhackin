import { Fragment, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { site } from "@/config/site";

const pillars = [
  { key: "scope", icon: "/assets/icon-scope.svg" },
  { key: "experts", icon: "/assets/icon-experts.svg" },
  { key: "insight", icon: "/assets/icon-insight.svg" },
] as const;

/**
 * The icon disc, and the line the rails are threaded along — the rails meet the
 * discs at their centres, so both are written from this one value.
 */
const DISC = "clamp(6rem,13vw,9.5rem)";
const RAIL_LINE = `calc(${DISC} / 2)`;

/**
 * The disc itself, as the frame fills it: lavender at a fifth fading out down
 * the circle, over a dark wash, on a 10px backdrop blur.
 *
 * The icon export cannot supply this. It carries the circle in a `foreignObject`
 * — the backdrop blur is an HTML div inside the SVG — and a `foreignObject` is
 * inert when the file is used as an `<img>` source, so all that arrives is the
 * glyph. The disc has to be built under it, which is what this is. It had been
 * standing in as a flat 8% white.
 */
const DISC_FILL =
  "bg-[linear-gradient(180deg,rgb(173_157_238/0.2)_0%,rgb(173_157_238/0)_100%),linear-gradient(0deg,rgb(34_18_15/0.2)_0%,rgb(34_18_15/0.2)_100%)]";

/**
 * The figure wires itself up once, in the order the eye is meant to read it:
 * ports on the discs, the upper rail out of the discs to the junctions, the
 * drops down to their feet, the lower rail in to the button. Milliseconds after
 * the figure comes into view. The opening offset is what the pillars' own
 * reveal (0/120/240ms of stagger on 700ms) needs to be mostly in first.
 */
const DRAW = {
  port: 500,
  rail: 650,
  junction: 1300,
  drop: 1350,
  foot: 1900,
  lower: 1950,
  ctaPort: 2450,
} as const;

/**
 * Then a light runs the same route on a loop — upper rail, drops, lower rail,
 * and into the button. The keyframes (see `--animate-rail-flow-*`) are one leg
 * of a 6s cycle each, so a leg's place in the sequence is only its delay.
 */
const FLOW = { start: 2800, leg: 1200 } as const;

interface RailProps {
  axis: "x" | "y";
  /**
   * Which end the segment grows out of when it draws in: `start` is the left or
   * top end, `end` the right end. The light always travels away from that end —
   * from the disc to the junction, down the drop, and in towards the button.
   */
  from: "start" | "end";
  drawDelay: number;
  flowDelay: number;
  revealed: boolean;
  /** Placement and visibility, from the parent: position, offsets, `lg:block`. */
  className: string;
  style?: CSSProperties;
}

/**
 * One segment of rail: the hairline, and the length of light that runs it. The
 * light is not clipped to the rail — it is thicker than the line and glows —
 * so it is the keyframes that keep it out of sight past either end.
 *
 * Every animation is behind `motion-safe`, in the same shape as `useReveal`: a
 * reader who has asked for reduced motion gets the finished, still figure on
 * the first paint and never the hidden one — and never the moving light, whose
 * span is `hidden` unless motion is welcome.
 */
function Rail({
  axis,
  from,
  drawDelay,
  flowDelay,
  revealed,
  className,
  style,
}: RailProps) {
  const horizontal = axis === "x";

  return (
    <span
      aria-hidden="true"
      style={{ ...style, animationDelay: `${drawDelay.toString()}ms` }}
      className={clsx(
        "bg-lavender/40",
        horizontal ? "h-px" : "w-px",
        horizontal
          ? from === "start"
            ? "origin-left"
            : "origin-right"
          : "origin-top",
        revealed
          ? horizontal
            ? "motion-safe:animate-rail-draw-x"
            : "motion-safe:animate-rail-draw-y"
          : horizontal
            ? "motion-safe:scale-x-0"
            : "motion-safe:scale-y-0",
        className,
      )}
    >
      <span
        style={{ animationDelay: `${flowDelay.toString()}ms` }}
        className={clsx(
          "absolute hidden",
          horizontal
            ? "top-1/2 left-0 h-[3px] w-[45%] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgb(237_233_255/0.95),transparent)] shadow-[0_0_0.5rem_rgb(237_233_255/0.7)]"
            : "top-0 left-1/2 h-[45%] w-[3px] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgb(237_233_255/0.95),transparent)] shadow-[0_0_0.5rem_rgb(237_233_255/0.7)]",
          revealed && "motion-safe:block",
          revealed &&
            (horizontal
              ? from === "start"
                ? "motion-safe:animate-rail-flow-x"
                : "motion-safe:animate-rail-flow-x-back"
              : "motion-safe:animate-rail-flow-y"),
        )}
      />
    </span>
  );
}

interface MarkProps {
  delay: number;
  revealed: boolean;
  className: string;
  style?: CSSProperties;
}

/** The diamond where a drop leaves the upper rail or lands on the lower one. */
function Junction({ delay, revealed, className, style }: MarkProps) {
  return (
    <span
      aria-hidden="true"
      style={{ ...style, animationDelay: `${delay.toString()}ms` }}
      className={clsx(
        "bg-lavender/80 size-1.5 rotate-45 rounded-xs shadow-[0_0_0.375rem_rgb(173_157_238/0.7)]",
        revealed ? "motion-safe:animate-rail-node" : "motion-safe:opacity-0",
        className,
      )}
    />
  );
}

/** The dot where a rail meets the edge of a disc or of the button. */
function Port({ delay, revealed, className, style }: MarkProps) {
  return (
    <span
      aria-hidden="true"
      style={{ ...style, animationDelay: `${delay.toString()}ms` }}
      className={clsx(
        "bg-lavender-soft/90 size-1.5 shrink-0 rounded-full shadow-[0_0_0.375rem_rgb(237_233_255/0.7)]",
        revealed ? "motion-safe:animate-rail-node" : "motion-safe:opacity-0",
        className,
      )}
    />
  );
}

/** One pillar. Split out so each can hold its own reveal state. */
function Pillar({
  pillar,
  index,
  railsRevealed,
}: {
  pillar: (typeof pillars)[number];
  index: number;
  railsRevealed: boolean;
}) {
  const { t } = useTranslation();
  const {
    ref: revealRef,
    className: revealClassName,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay: index * 120 });

  const first = index === 0;
  const last = index === pillars.length - 1;

  return (
    <li
      ref={revealRef}
      style={revealStyle}
      data-testid={`why-${pillar.key}`}
      /*
       * No horizontal padding on the cell. The upper rail is drawn per cell as
       * far as the cell's edge, so any padding here becomes a gap in the line
       * where one pillar meets the next; the copy is held in by its own `max-w`
       * instead.
       */
      className={clsx(
        "flex flex-col items-center gap-6 text-center",
        revealClassName,
      )}
    >
      <div className="relative flex w-full items-center justify-center">
        {/*
          The upper rail, in two pieces per cell: from the cell's edge to the
          disc's edge, and from the disc's other edge to the cell's other edge.
          It stops at the ring and is met there by a port, so the line reads as
          plugged into the disc rather than passing underneath it — through a
          translucent disc the old edge-to-edge line showed as a bar across the
          icon. The outermost cells have no outer piece: the rail runs from the
          first disc to the last and no further.
        */}
        {!first && (
          <Rail
            axis="x"
            from="end"
            drawDelay={DRAW.rail}
            flowDelay={FLOW.start}
            revealed={railsRevealed}
            className="absolute top-1/2 left-0 hidden lg:block"
            style={{ right: `calc(50% + ${RAIL_LINE})` }}
          />
        )}
        {!last && (
          <Rail
            axis="x"
            from="start"
            drawDelay={DRAW.rail}
            flowDelay={FLOW.start}
            revealed={railsRevealed}
            className="absolute top-1/2 right-0 hidden lg:block"
            style={{ left: `calc(50% + ${RAIL_LINE})` }}
          />
        )}
        {!first && (
          <Port
            delay={DRAW.port}
            revealed={railsRevealed}
            className="absolute top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ left: `calc(50% - ${RAIL_LINE})` }}
          />
        )}
        {!last && (
          <Port
            delay={DRAW.port}
            revealed={railsRevealed}
            className="absolute top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ left: `calc(50% + ${RAIL_LINE})` }}
          />
        )}

        {/*
          Translucent with a ring, as drawn — an opaque `ink-deep` disc punched
          a hole in the gradient behind it.
        */}
        <img
          src={pillar.icon}
          alt=""
          width={156}
          height={156}
          loading="lazy"
          aria-hidden="true"
          className={clsx(
            "ring-lavender-soft/25 relative rounded-full ring-1 backdrop-blur-[0.625rem]",
            DISC_FILL,
          )}
          style={{ width: DISC, height: DISC }}
        />
      </div>

      <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
        {t(`why.${pillar.key}.title`)}
      </h3>

      {/*
        Narrow enough that each sentence takes its own line, which is how the
        frame breaks all three. At 18rem the first line ran on into the second
        sentence and the block came out ragged against its neighbours.

        Measured against the three: the widest single sentence sets the floor at
        193px, and the first that would pull a word up from the sentence after it
        sets the ceiling at 198px. 12.2rem sits in that window. It is narrow
        because the copy is what makes it narrow — if these strings change, or a
        licensed Uncut Sans replaces the Inter standing in for it, this wants
        measuring again rather than nudging.
      */}
      <p className="text-mist/80 max-w-[12.2rem] text-sm leading-6 text-pretty">
        {t(`why.${pillar.key}.body`)}
      </p>
    </li>
  );
}

/**
 * "Find what's exploitable." — three pillars threaded onto the hairline rails
 * from the design, with the demo call-to-action sitting on the lower rail.
 *
 * The rails are one wired figure rather than lines behind a row: the upper
 * rail runs from disc to disc and stops at each ring, two drops leave it at the
 * gaps between the discs, and the lower rail runs from their feet in to the
 * edges of the button. It draws itself in on arrival, then carries a light
 * along that route on a loop — the pillars feeding the call to action.
 *
 * Each pillar draws its own pieces of the upper rail across its own cell, so
 * the line stays centred on the icons however the icon size scales.
 */
export function WhyAssistSec() {
  const { t } = useTranslation();
  /*
   * The figure's own observation, for the rails' timing. Only `revealed` is
   * taken from it — the fade and lift belong to the pillars, which run their
   * own; a second one on the container would move them twice.
   */
  const { ref: figureRef, revealed } = useReveal<HTMLDivElement>();

  return (
    <SectionShell
      data-testid="why-assistsec"
      className="brand-sky"
      /*
        The page's section rhythm is 16/24/28, which services, the report block
        and the blog all run. This section was on 16/20/24 — 96px of air at a
        desktop width where its neighbours have 112 — so the run through the
        middle of the page tightened for one section and then opened again.
      */
      innerClassName="flex flex-col items-center gap-12 py-16 sm:py-24 lg:gap-16 lg:py-28"
    >
      {/*
        The frame sets this in a pale lavender on the lavender sky, which no one
        can read. It stays light — it is meant to be a quiet line of light
        sitting in the gradient, not a dark heading stamped on it — and clears
        the contrast threshold through the wash above instead.

        The treatment is a watermark rather than a heading: a thin, widely
        tracked line whose fill fades from near-white at the cap line down into
        the lavender of the sky, so the words read as light etched into the
        gradient instead of type laid over it. The soft glow is the same idea —
        it lets the letters sit in the sky rather than on it. The top of the
        gradient is kept strong so the wash above still carries the contrast.
        The smallest step is 24px so the whole range is large text at every
        width rather than only on the desktop.
      */}
      <h2
        className="font-display bg-clip-text text-center text-2xl font-light tracking-[0.25em] text-balance text-transparent uppercase sm:text-[1.75rem] sm:tracking-[0.4em] lg:text-[2.25rem] lg:tracking-[0.5em]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgb(237 233 255 / 0.95) 0%, rgb(237 233 255 / 0.7) 45%, rgb(173 157 238 / 0.45) 100%)",
          filter: "drop-shadow(0 0.0625rem 0.75rem rgb(173 157 238 / 0.3))",
        }}
      >
        {t("why.title")}
      </h2>

      {/*
        The pillars and the call to action share one box, because the rails that
        join them do. A drop leaves the upper rail at each of the two gaps
        between the discs and runs down to the lower rail, with a junction mark
        at both ends — so the three pillars and the button read as one bracketed
        figure rather than as a row with a line under it.

        Each drop is drawn here rather than inside a cell for the simple reason
        that it has to outlive one: it starts on the disc's centre line and ends
        on the lower rail, which is past the foot of every cell.

        `top` is the disc's own centre and `bottom` is half the button — so both
        ends stay on their rails as the disc scales and the copy reflows.
      */}
      <div
        ref={figureRef}
        className="relative flex w-full flex-col gap-12 lg:gap-16"
      >
        {(["left-1/3", "left-2/3"] as const).map((column) => (
          <Fragment key={column}>
            <Rail
              axis="y"
              from="start"
              drawDelay={DRAW.drop}
              flowDelay={FLOW.start + FLOW.leg}
              revealed={revealed}
              className={clsx(
                "absolute bottom-6 hidden -translate-x-1/2 lg:block",
                column,
              )}
              style={{ top: RAIL_LINE }}
            />
            <Junction
              delay={DRAW.junction}
              revealed={revealed}
              className={clsx(
                "absolute hidden -translate-x-1/2 -translate-y-1/2 lg:block",
                column,
              )}
              style={{ top: RAIL_LINE }}
            />
            <Junction
              delay={DRAW.foot}
              revealed={revealed}
              className={clsx(
                "absolute bottom-6 hidden -translate-x-1/2 translate-y-1/2 lg:block",
                column,
              )}
            />
          </Fragment>
        ))}

        <ul className="grid w-full gap-12 lg:grid-cols-3 lg:gap-0">
          {pillars.map((pillar, index) => (
            <Pillar
              key={pillar.key}
              pillar={pillar}
              index={index}
              railsRevealed={revealed}
            />
          ))}
        </ul>

        {/*
          The lower rail is the row the button sits in, a third of the width
          and centred, so its two pieces run from exactly where the drops land
          to the edges of the button — however wide the label makes it — and
          end there in a port each. It used to run edge to edge behind the
          button, which read as the button laid over a line.
        */}
        <div className="flex w-full items-center justify-center lg:w-1/3 lg:self-center">
          <Rail
            axis="x"
            from="start"
            drawDelay={DRAW.lower}
            flowDelay={FLOW.start + FLOW.leg * 2}
            revealed={revealed}
            className="relative hidden flex-1 lg:block"
          />
          <Port
            delay={DRAW.ctaPort}
            revealed={revealed}
            className="hidden lg:block"
          />

          {/*
            The same size as every other in-page call to action. At `sm` this
            one came out 126×41 in 14px type against the 148×48 in 16px that the
            skyline, the report and the closing block all use — the one primary
            action on the page that looked like a secondary one.

            `isolate` keeps the halo's negative z-index inside this box, behind
            the button and nowhere further back.
          */}
          <span className="relative isolate lg:mx-3">
            <span
              aria-hidden="true"
              style={{
                animationDelay: `${(FLOW.start + FLOW.leg * 3).toString()}ms`,
              }}
              className={clsx(
                "bg-lavender/70 rounded-field absolute -inset-1 -z-10 opacity-0 blur-md",
                revealed && "motion-safe:animate-rail-cta-glow",
              )}
            />
            <BrandButton href={site.bookDemoUrl} data-testid="why-book-demo">
              {t("why.cta")}
            </BrandButton>
          </span>

          <Port
            delay={DRAW.ctaPort}
            revealed={revealed}
            className="hidden lg:block"
          />
          <Rail
            axis="x"
            from="end"
            drawDelay={DRAW.lower}
            flowDelay={FLOW.start + FLOW.leg * 2}
            revealed={revealed}
            className="relative hidden flex-1 lg:block"
          />
        </div>
      </div>
    </SectionShell>
  );
}
