import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import { site } from "@/config/site";

/*
 * The backdrop plays everywhere except where someone has asked it not to. A
 * looping video is exactly what `prefers-reduced-motion` is about, and deciding
 * here rather than in CSS means the file is never fetched in that case instead
 * of being fetched and then hidden.
 *
 * There is deliberately no width in this query. There used to be — the footage
 * was withheld under 48rem to keep a 1.7MB download off phones — but that asset
 * is long gone and the one in its place is a 164KB webm, less than the hero
 * screenshot beside it. What the breakpoint bought after that was nothing, and
 * what it cost was a width at which the backdrop changed character: the video
 * stopped and a CSS approximation took over, so the page had a seam at 768 that
 * had to be kept invisible from both sides. It never quite was. One backdrop, at
 * every width, is both simpler and the thing that actually moves on a phone.
 */
const BACKDROP_PLAYS = "(prefers-reduced-motion: no-preference)";

/*
 * The frame's backdrop ("Moodboard - 2 → Banner Bg") masks every one of its
 * layers with the same two shapes, both of them plain gradients once the
 * exported vectors are read back:
 *
 * - the fade holds full strength down to y=690 of 1080 and is gone by the foot,
 *   which is what carries the backdrop into the page colour behind the panel;
 * - the vignette is the inverse of the usual one. It is empty in the middle and
 *   reaches 0.8 at the edge, an ellipse 1881 by 726 about (960, 354). It is why
 *   the bars and the shafts show along the sides and leave the centre — where
 *   the headline goes — to the footage alone.
 *
 * The footage takes the fade only. Everything laid over it takes both.
 */
const BANNER_FADE =
  "linear-gradient(to bottom, #000 0, #000 63.89%, transparent 100%)";

const BANNER_VIGNETTE =
  "radial-gradient(97.99% 67.22% at 50% 32.78%, transparent 0%, rgb(0 0 0 / 0.8) 100%)";

const BANNER_INSET_MASK: CSSProperties = {
  maskImage: `${BANNER_FADE}, ${BANNER_VIGNETTE}`,
  maskComposite: "intersect",
  WebkitMaskImage: `${BANNER_FADE}, ${BANNER_VIGNETTE}`,
  WebkitMaskComposite: "source-in",
};

/*
 * The recolour. Every layer of the frame's backdrop is orange artwork under a
 * gradient set to `hue`, which keeps the artwork's light and its density and
 * takes only its colour from the brand ramp — the frame's stops are this ramp.
 * Tinting rather than grading is why nothing here has to match a hex.
 */
const TINT: CSSProperties = { background: "var(--brand-sweep-vertical)" };

/*
 * 2083x1172 at (-81, 0) on the frame's 1920x1080 banner.
 *
 * `max-w-none` is not decoration. The base layer caps every `video` at
 * `max-width: 100%`, so this box was coming out 1920 wide while the height took
 * — a 1.64 box for 16:9 footage, which `object-cover` then filled by cropping
 * the sides. That moved the plume a whole column left of where the frame has it
 * and cost it a third of its light: measured against the frame, 55.7 against
 * 75.5 at x=640, and 26.1 against 41.2 at x=800.
 */
const BANNER_FOOTAGE_BOX =
  "absolute top-0 left-[-4.219%] h-[108.52%] w-[108.49%] max-w-none";

/*
 * The two light shafts, blurred to 7.29vw — 140px on the frame's canvas.
 *
 * The exports are hard-edged diagonal bands, and laid on sharp that is exactly
 * what they read as: wedges cutting across the banner like a spotlight. The
 * frame has no such edge anywhere. What it has on the right is a broad, smooth
 * glow, and no single frame of the footage accounts for it — the whole clip was
 * searched against the frame's own column profile and the closest second still
 * left that side 6 short. Blurred, the same artwork becomes that glow: the
 * wedges go and the profile lands within 1.6 of the frame across the width.
 *
 * The first shaft carries most of that light and at full strength carries too
 * much — its quarter came out at 27.1 against the frame's 18.4 — so it is held
 * at 70%. The frame lists no opacity for the layer; this is read off the render.
 */
const BANNER_SHAFT_SOFTEN = "blur-[7.29vw]";

const BANNER_SHAFTS = [
  {
    key: "a",
    src: "/assets/hero-shaft-a.webp",
    className: "opacity-70",
  },
  {
    key: "b",
    src: "/assets/hero-shaft-b.webp",
    className: "mix-blend-soft-light",
  },
  {
    key: "b-flipped",
    src: "/assets/hero-shaft-b.webp",
    className: "mix-blend-plus-lighter -scale-y-100 opacity-20",
  },
] as const;

/*
 * One bar: nothing for its first fifth, then white climbing towards its right
 * edge. Written against a 150 tile — two bars — so the stops are 21/150 and
 * 99/150.
 *
 * The export's own fill peaks at 0.28, and at that strength the bars stand out
 * about four times as hard as the frame renders them: measured against the
 * frame, the periodic component of a row sits at an RMS of 1.0-1.7 of 255,
 * where 0.28 puts it at 3.7-5.4. The frame stacks 28 separate bars, each with
 * its own falloff, and the export flattens all of that into one ramp; 0.05 is
 * that ramp at the weight the stack actually reads.
 */
const BAR_RAMP =
  "linear-gradient(90deg, rgb(255 255 255 / 0) 0, rgb(255 255 255 / 0) 14%, rgb(255 255 255 / 0.05) 66%, rgb(255 255 255 / 0) 66%)";

/**
 * Opening statement: the blue shafted backdrop from the Figma frame, the
 * headline block, and the portal screenshot sitting on the full-bleed diamond
 * band that runs behind it.
 */
export function Hero() {
  const { t } = useTranslation();
  const backdropPlays = useMediaQuery(BACKDROP_PLAYS);

  return (
    <section
      id="top"
      data-testid="hero"
      /*
       * Not clipped: the banner reaches a header's height above this section,
       * and a clip here is what kept cutting that off. The banner is the only
       * thing that leaves the box, it leaves it upwards over a section that is
       * the same ground colour, and it is flush to both edges — so nothing
       * escapes sideways.
       */
      className="bg-ink-deep relative isolate w-full"
    >
      {/*
        The backdrop the frame draws behind the hero ("Moodboard - 2 → Banner
        Bg"): slow smoke, the fine banding of the overlapping bars over the top,
        and the whole thing falling away to nothing at the edges.

        It starts a header above this section, not at its top edge. In the frame
        the banner is the full 1080 of the viewport and the announcement strip
        and the nav are drawn *inside* it, on top — so anchoring the banner to
        the section, which begins under a header in normal flow, both cut its
        first 110px off and slid everything else down by that much. Measured
        against the frame that showed up as the top band reading 19 where the
        frame reads 28, and the plume landing a column to the left.

        The footage is the frame's own — the layer sits there as
        `12310771_1920_1080_24fps`, and it is orange. What turns it the blue of
        this page is the gradient laid over it in `hue`, which keeps the
        footage's light and its density and takes only its colour from the brand
        ramp. Tinting rather than grading is the frame's own trick, and it is
        why nothing here has to match a hex.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)*-1)] isolate -z-20 aspect-[1920/1080] min-h-[28rem] w-full overflow-hidden"
        aria-hidden="true"
      >
        {/*
          The footage, faded out over its bottom third by the frame's own
          "Banner" mask. The poster under it is the footage's first frame, and
          the loop returns to that frame, so the still and the moving version
          are the same picture — which is what lets the still stand in wherever
          the video is withheld.
        */}
        <div
          className="absolute inset-0 isolate"
          style={{ maskImage: BANNER_FADE, WebkitMaskImage: BANNER_FADE }}
        >
          {/*
            The frame does not lay the footage flush. It sits at 2083x1172 over
            a 1920x1080 box — the same 8.5% over on both axes — pulled 81 left
            and hung off the top edge, which is what puts the bright of the
            plume where the frame puts it rather than a hand's width to the
            left. Both the still and the video take the same box.
          */}
          {/*
            The still under the footage. It is the frame the loop returns to, so
            it stands in seamlessly while the video is still arriving, and for
            anyone who has asked for reduced motion.
          */}
          <div
            className={clsx(BANNER_FOOTAGE_BOX, "bg-cover bg-center")}
            style={{
              backgroundImage: "url('/assets/hero-motion-poster.webp')",
            }}
          />

          {backdropPlays && (
            <video
              className={clsx(BANNER_FOOTAGE_BOX, "object-cover")}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/assets/hero-motion-poster.webp"
              data-testid="hero-backdrop-video"
            >
              <source src="/assets/hero-motion.webm" type="video/webm" />
              <source src="/assets/hero-motion.mp4" type="video/mp4" />
            </video>
          )}

          <div className="absolute inset-0 mix-blend-hue" style={TINT} />
        </div>

        {/*
          The two light shafts the frame lays over the footage, the second of
          them twice: once in `soft-light`, then flipped and dropped to a fifth
          in `plus-lighter`. Each is tinted on its own, as the frame tints it,
          rather than the three being recoloured together at the end — the
          blends read off the tinted layer, so tinting after them lands
          somewhere else entirely.
        */}
        {BANNER_SHAFTS.map((shaft) => (
          <div
            key={shaft.key}
            className={clsx(
              "absolute inset-0 isolate",
              BANNER_SHAFT_SOFTEN,
              shaft.className,
            )}
            style={BANNER_INSET_MASK}
          >
            <img
              src={shaft.src}
              alt=""
              width={1920}
              height={1080}
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 mix-blend-hue" style={TINT} />
          </div>
        ))}

        {/*
          The bar bank: 28 bars in the frame, 99 wide on a 75 pitch so each one
          laps 24 over its neighbour. Two offset ramps stand in for the 28
          copies — one tile per 150, the second shifted by a bar — and the pair
          lands the same overlap the frame draws. In vw, because the frame's own
          geometry is: the backdrop is locked to its 1920x1080, so the bars and
          their pitch hold their proportions at any width.

          The frame's export puts a 90px background blur on this bank, and
          taking that literally was wrong. As CSS reads it, `backdrop-filter`
          blurs the whole banner — which spreads the plume's light into the dark
          sides and flattens the plume itself. Measured against the frame it
          cost the plume nearly half its strength ((33,29,72) against the
          frame's (52,44,126)) and lifted the dark quarters by a third. The
          frame renders that bank sharp, so it is sharp here.
        */}
        <div
          className="absolute inset-0"
          style={{
            ...BANNER_INSET_MASK,
            backgroundImage: `${BAR_RAMP}, ${BAR_RAMP}`,
            backgroundSize: "7.8125vw 100%",
            backgroundPosition: "0 0, 3.90625vw 0",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>

      {/*
        Keeps the copy legible over the brightest part of the backdrop. The
        frame has no scrim — it does not have to hold live text over a plume
        that moves. This is the least that does: nothing across the band the
        headline sits in, and weight only at the foot, where the backdrop has to
        arrive at the page colour under the panel.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-height)*-1)] -z-10 aspect-[1920/1080] min-h-[28rem] w-full"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #0d0b2100 0%, #0d0b2100 46%, #0d0b2173 72%, #0d0b21 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center px-6 pt-12 sm:px-10 sm:pt-16 lg:px-16 lg:pt-20 2xl:px-0">
        <div className="flex w-full max-w-[52.5rem] flex-col items-center gap-6 text-center">
          <h1 className="text-hero text-balance text-white">
            {t("hero.title")}
          </h1>

          <p className="max-w-[45rem] text-base leading-[1.6] text-pretty text-white/80 sm:text-lg">
            {t("hero.body")}
          </p>
        </div>

        <BrandButton
          href={site.bookDemoUrl}
          variant="sweep"
          data-testid="hero-book-demo"
          className="relative z-10 mt-8 sm:mt-10"
        >
          {t("hero.cta")}
        </BrandButton>
      </div>

      {/*
        Portal screenshot on the full-bleed diamond band, as in the frame, which
        runs the call to action down onto the top edge of the panel rather than
        clearing it — hence the negative margin and the raised button above.
      */}
      <div className="relative mt-10 sm:mt-12 lg:-mt-4">
        {/*
          The band is masked at both ends. Drawn as a plain box it began and
          ended on two razor-straight horizontal lines running the full width of
          the page, on either side of the panel — the single most unfinished
          edge on the landing page. Fading it in and out turns the same artwork
          into something the section can hold.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-repeat-x opacity-90 sm:h-56 lg:h-72"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/assets/lattice-band.webp')",
            backgroundSize: "auto 100%",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, #000 24%, #000 58%, transparent 100%)",
          }}
        />

        {/*
          The panel is taller than the room the section gives it, so the
          section's clip cut it off on a hard line part-way down a table. This
          dissolves the last of it into the background instead.

          It spans the section rather than the content column: the diamond band
          bleeds past the column's gutters, so a dissolve that stopped at the
          column left the band's own bottom edge standing.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 sm:h-40 lg:h-48"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, #0d0b21b3 55%, #0d0b21 100%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[91rem] px-6 sm:px-10 lg:px-16 2xl:px-0">
          {/*
            This is the page's largest contentful paint on every viewport, and
            the only image above the fold that is not decoration. It is left
            eager on purpose — the hints are the other half of that: the fetch
            goes out at high priority rather than at the default "low" the
            preload scanner assigns an image it has not laid out yet, and the
            decode is handed off the main thread so a 3076px-wide asset cannot
            block the first frame of the headline beside it.
          */}
          <img
            src="/assets/hero-dashboard.webp"
            alt={t("hero.dashboardAlt")}
            width={3076}
            height={1230}
            fetchPriority="high"
            decoding="async"
            className="border-indigo-deep/70 mx-auto block w-full rounded-t-2xl border border-b-0 shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
