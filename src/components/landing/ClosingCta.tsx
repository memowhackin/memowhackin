import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
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
 * The hands are pinned to the section's edges rather than to a percentage
 * offset. Anchored inwards they crept over the copy as the viewport narrowed —
 * at tablet width they landed directly on the headline. Flush to the edges the
 * clear span between the tips is a fixed 37% of the section, and the copy is
 * capped below that so the two can never meet.
 */
const HAND_CLEAR_SPAN = "lg:max-w-[min(33vw,38rem)]";

export function ClosingCta() {
  const { t } = useTranslation();
  const { ref: revealRef, className: revealClassName } =
    useReveal<HTMLDivElement>();

  return (
    <section
      data-testid="closing-cta"
      className="bg-ink relative isolate w-full"
    >
      {/*
        Both exports are opaque, with the `ink` page colour baked into their
        background — which is why they read as floating on this section and
        nowhere else. Below `lg` there is no room for them beside the copy, and
        a decorative hand is the right thing to drop.

        Nothing clips this section. In the frame the hands run past the block on
        both sides — the left forearm crosses into the footer, the right wrist
        leaves through the top — and clipping them to the block was what cut the
        forearm off flat. What keeps the overflow harmless is paint order: the
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
          "pointer-events-none absolute left-0 -z-10 hidden w-[30.21%] lg:block",
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
          "pointer-events-none absolute right-0 -z-10 hidden w-[34.01%] lg:block",
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
