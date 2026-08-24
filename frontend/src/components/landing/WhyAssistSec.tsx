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

/** The diamond the frame puts at both ends of every rail junction. */
function RailNode({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden="true"
      style={style}
      className={clsx(
        "bg-lavender/70 absolute hidden size-1.5 -translate-x-1/2 rotate-45 rounded-xs lg:block",
        className,
      )}
    />
  );
}

/** One pillar. Split out so each can hold its own reveal state. */
function Pillar({
  pillar,
  index,
}: {
  pillar: (typeof pillars)[number];
  index: number;
}) {
  const { t } = useTranslation();
  const {
    ref: revealRef,
    className: revealClassName,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay: index * 120 });

  return (
    <li
      ref={revealRef}
      style={revealStyle}
      data-testid={`why-${pillar.key}`}
      /*
       * No horizontal padding on the cell. The upper rail is drawn per cell as
       * `inset-x-0`, so any padding here becomes a gap in the line where one
       * pillar meets the next; the copy is held in by its own `max-w` instead.
       */
      className={clsx(
        "flex flex-col items-center gap-6 text-center",
        revealClassName,
      )}
    >
      <div className="relative flex w-full items-center justify-center">
        {/* Upper rail, threaded through the icon circles. */}
        <span
          className="bg-lavender/40 absolute inset-x-0 top-1/2 hidden h-px lg:block"
          aria-hidden="true"
        />

        {/*
          Translucent with a ring, as drawn — an opaque `ink-deep` disc punched
          a hole in the gradient behind it. The drops that turn off this rail
          belong to the section, not to a cell: they have to reach the lower
          rail, which is past the end of every cell.
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
 * "Get hacked by AssistSec." — three pillars threaded onto the hairline rails
 * from the design, with the demo call-to-action sitting on the lower rail.
 *
 * Each pillar draws its own segment of the upper rail across its own cell, so
 * the line stays centred on the icons however the icon size scales.
 */
export function WhyAssistSec() {
  const { t } = useTranslation();

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
        join them do. The frame runs a drop off the upper rail at each of the two
        gaps between the discs, all the way down into the lower rail, with a
        diamond at both ends — so the three pillars and the button read as one
        bracketed figure rather than as a row with a line under it.

        Each drop is drawn here rather than inside a cell for the simple reason
        that it has to outlive one: it starts on the disc's centre line and ends
        on the lower rail, which is past the foot of every cell. Held inside a
        cell at a fixed 13rem it stopped in mid-air short of the rail.

        `top` is the disc's own centre and `bottom` is half the button — so both
        ends stay on their rails as the disc scales and the copy reflows.
      */}
      <div className="relative flex w-full flex-col gap-12 lg:gap-16">
        {(["left-1/3", "left-2/3"] as const).map((column) => (
          <Fragment key={column}>
            <span
              aria-hidden="true"
              className={clsx(
                "bg-lavender/40 absolute bottom-6 hidden w-px lg:block",
                column,
              )}
              style={{ top: RAIL_LINE }}
            />
            <RailNode
              className={clsx("-translate-y-1/2", column)}
              style={{ top: RAIL_LINE }}
            />
            <RailNode className={clsx("bottom-6 translate-y-1/2", column)} />
          </Fragment>
        ))}

        <ul className="grid w-full gap-12 lg:grid-cols-3 lg:gap-0">
          {pillars.map((pillar, index) => (
            <Pillar key={pillar.key} pillar={pillar} index={index} />
          ))}
        </ul>

        <div className="relative flex w-full justify-center">
          {/* Lower rail the call-to-action sits on, edge to edge as drawn. */}
          <div
            className="bg-lavender/40 absolute inset-x-0 top-1/2 hidden h-px lg:block"
            aria-hidden="true"
          />

          {/*
          The same size as every other in-page call to action. At `sm` this one
          came out 126×41 in 14px type against the 148×48 in 16px that the
          skyline, the report and the closing block all use — the one primary
          action on the page that looked like a secondary one.
        */}
          <BrandButton
            href={site.bookDemoUrl}
            data-testid="why-book-demo"
            className="relative"
          >
            {t("why.cta")}
          </BrandButton>
        </div>
      </div>
    </SectionShell>
  );
}
