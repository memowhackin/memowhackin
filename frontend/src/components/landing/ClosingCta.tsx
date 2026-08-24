import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import { useReveal } from "@/components/common/useReveal";
import { site } from "@/config/site";

/**
 * Final conversion block, with the two robotic hands reaching in from the sides.
 *
 * Both are placed where the frame places them, measured off its 1920 canvas.
 * The headline starts at y=8875 there, which is where the section's top padding
 * puts it here, the headline being the first thing in the column — so both
 * offsets are written against that padding, as the same fractions of the
 * viewport that the hands' own widths are.
 *
 * - the left hand's box starts 4px under the headline (0.21vw), flush left, and
 *   its fingertip comes to rest just outside the copy pointing up into it;
 * - the right hand hangs 320px *above* the headline. Its artwork begins 37.2%
 *   down its own box, so the export is cropped to that band and the offset
 *   drops to 4.98vw — which lands the fingertip 48px above the top of
 *   "Interested in a pentest?", pointing down onto the words. It is not level
 *   with the left hand and is not meant to be: the frame has the two reaching
 *   past each other, one from under the line and one from over it.
 */
const HAND_TIP_LINE = {
  left: "lg:top-[calc(8rem+0.21vw)] xl:top-[calc(10rem+0.21vw)]",
  right: "lg:top-[calc(8rem-4.98vw)] xl:top-[calc(10rem-4.98vw)]",
} as const;

/*
 * Movement tied to the scroll, so where reduced motion is asked for the
 * listener is never attached and the hands hold their closest pose (the
 * utilities' fallback). Same reasoning as ScrollFillText.
 */
const REACH_ON_SCROLL = "(prefers-reduced-motion: no-preference)";

/*
 * The share of the section that has to be on screen for the target to reach 1.
 *
 * The target is the section's visible fraction over this, which makes the
 * mapping symmetric by construction: it rises as the section scrolls in from
 * either edge and falls as it leaves through either edge, so the reach also
 * plays for a reader scrolling back up out of the footer. Edge-position ramps
 * could not do that reliably — how high the section's bottom can sit at the
 * end of the page depends on the footer's height and the viewport's, and a
 * threshold tuned on one screen left the hands short of their pose on
 * another.
 */
const REACH_AT_VISIBLE = 0.85;

/**
 * Writes `--cta-reach` on the section: 0 with the section out of the
 * reader's view in either direction, 1 once the headline has reached them
 * (see the `cta-hand-*` utilities).
 *
 * The written value chases the scroll target rather than being it. A value
 * set 1:1 from the scroll has two failures: locked to the reader's own hand
 * it does not read as animation at all, and for a reader who arrives with the
 * section already in view — a reload at the foot of the page, a jump to the
 * footer — it lands at its final number before the first paint and nothing
 * ever moves. The follower starts at 0 on mount and closes the gap with a
 * short ~55ms time constant, so the hands still reach in on arrival however
 * the reader got there, and still smooth a notchy wheel, but stay close enough
 * to the scroll that they read as tied to it rather than drifting after it.
 *
 * One custom property per frame and no state, so nothing re-renders. The loop
 * only runs while there is a gap to close; at rest there is no frame work.
 */
function useHandReach<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const reaches = useMediaQuery(REACH_ON_SCROLL);

  useEffect(() => {
    if (!reaches) return;

    let frame = 0;
    let current = 0;
    let last = performance.now();

    const tick = (now: number) => {
      frame = 0;
      const element = ref.current;
      if (!element) return;

      const viewport = document.documentElement.clientHeight;
      const box = element.getBoundingClientRect();
      /*
       * The top is deliberately not clamped: at the foot of the page the
       * footer pushes this section partly above the viewport, and that
       * overhang has been scrolled past, not left unseen — the same doctrine
       * as useReveal. The section only ever enters and leaves through the
       * bottom edge, and `visible` swings with that edge alone.
       */
      const visible = Math.min(box.bottom, viewport) - box.top;
      // Against the section's height, capped short of the viewport's, so a
      // section taller than the screen can still reach a full pose.
      const span = Math.min(box.height, viewport * 0.8);
      const fraction = Math.min(Math.max(visible / span, 0), 1);
      const target = Math.min(fraction / REACH_AT_VISIBLE, 1);

      /*
       * Exponential approach, framerate-independent: the same share of the
       * remaining gap closes per unit of time whatever the display's refresh
       * rate. The clamp keeps a background-tab wakeup from arriving as one
       * enormous step.
       */
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      /*
       * A ~55ms time constant. It still smooths the steps a notchy mouse wheel
       * arrives in, and still animates the hand in from nothing on first mount,
       * but it is tight enough that the hand reads as tied to the scrollbar
       * rather than chasing it. The old ~270ms trailed far enough behind that
       * on a short page — where a scrollbar drag crosses the whole reach ramp
       * in one flick — the hand went on drifting inward for most of a second
       * after the scroll had already stopped, which read as motion of its own.
       */
      current += (target - current) * (1 - Math.exp(-dt * 18));
      if (Math.abs(target - current) < 0.002) current = target;

      // The pose is only defined between its rest and its reach; a stray frame
      // outside that range would flick the hand off-screen or past the copy.
      const shown = Math.min(Math.max(current, 0), 1);
      element.style.setProperty("--cta-reach", shown.toFixed(4));
      if (current !== target) frame ||= requestAnimationFrame(tick);
    };

    const schedule = () => {
      // Scroll fires far faster than paint, so readings coalesce onto a frame.
      last = performance.now();
      frame ||= requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reaches]);

  return ref;
}

/*
 * The hands are pinned to the section's edges rather than to a percentage
 * offset. Anchored inwards they crept over the copy as the viewport narrowed —
 * at tablet width they landed directly on the headline. Flush to the edges the
 * clear span between the tips is a fixed 37% of the section at rest, and the
 * copy is capped below that. At full reach the travel utilities grow each
 * hand a few percent around its outer corner, bringing the tip about 2.5vw
 * further in while the arm stays flush to the screen edge — which still
 * leaves the copy clear at every width from `lg` up (checked at 1024, 1440
 * and 1920).
 */
const HAND_CLEAR_SPAN = "lg:max-w-[min(33vw,38rem)]";

export function ClosingCta() {
  const { t } = useTranslation();
  const { ref: revealRef, className: revealClassName } =
    useReveal<HTMLDivElement>();
  const sectionRef = useHandReach<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      data-testid="closing-cta"
      className="bg-ink relative isolate w-full overflow-x-clip"
    >
      {/*
        Both exports are opaque, with the `ink` page colour baked into their
        background — which is why they read as floating on this section and
        nowhere else. Below `lg` there is no room for them beside the copy, and
        a decorative hand is the right thing to drop.

        Nothing clips this section vertically. In the frame the hands run past
        the block on both sides — the left forearm crosses into the footer, the
        right wrist leaves through the top — and clipping them to the block was
        what cut the forearm off flat. The x axis alone is clipped, because the
        entrance pulls each hand out past its own edge and the overhang would
        otherwise count into the page's scroll width. What keeps the vertical
        overflow harmless is paint order: the
        footer draws after this section and its own content lands on top of the
        hands, so the arm passes behind the partner row rather than over it, and
        the section above is the same `ink` these exports are cut from.
      */}
      <img
        src="/assets/robot-hand-left.webp"
        alt=""
        width={1160}
        height={1086}
        loading="lazy"
        aria-hidden="true"
        /* 580 of the frame's 1920, flush to the left edge. */
        className={clsx(
          "cta-hand-left pointer-events-none absolute left-0 -z-10 hidden w-[30.21%] lg:block",
          HAND_TIP_LINE.left,
        )}
      />
      <img
        src="/assets/robot-hand-right.webp"
        alt=""
        width={1306}
        height={457}
        loading="lazy"
        aria-hidden="true"
        /*
         * 653 wide, flush to the right edge. The frame draws this hand 786.6
         * wide running off the canvas; the export is the part of it that is on
         * the page, which is why the two hands are not the same width here.
         *
         * The export is also cut down to the band the artwork occupies — it
         * used to carry 37% empty ground above the hand and 25% below. That
         * ground is opaque, and with nothing clipping this section any more it
         * would have covered the end of the blog copy overhead.
         */
        className={clsx(
          "cta-hand-right pointer-events-none absolute right-0 -z-10 hidden w-[34.01%] lg:block",
          HAND_TIP_LINE.right,
        )}
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center px-6 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32 xl:py-40 2xl:px-0">
        <div
          ref={revealRef}
          className={clsx(
            "flex w-full flex-col items-center gap-6 text-center",
            HAND_CLEAR_SPAN,
            revealClassName,
          )}
        >
          <h2 className="font-display text-mist max-w-3xl text-2xl leading-tight font-normal text-balance sm:text-3xl lg:text-[2.5rem]">
            {t("cta.title")}
          </h2>

          <p className="text-mist/80 max-w-xl text-base leading-6 text-pretty">
            {t("cta.body")}
          </p>

          <BrandButton
            href={site.bookDemoUrl}
            data-testid="closing-book-demo"
            className="mt-2"
          >
            {t("cta.action")}
          </BrandButton>
        </div>
      </div>
    </section>
  );
}
