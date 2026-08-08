import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { useReveal } from "@/components/common/useReveal";
import { site } from "@/config/site";

/**
 * Final conversion block, with the two robotic hands reaching in from the sides.
 *
 * Each hand hangs off its own fingertip rather than off the top of its box, so
 * both tips come to rest on the same line — one headline line under the top of
 * "Interested in a pentest?" — and point into the headline from either side:
 * the left hand up and to the right, the right hand up and to the left. Before
 * this the right hand pointed at the button instead, a whole block lower than
 * the words it is meant to be indicating.
 *
 * The tip sits at a fixed spot inside each export (11.5% down the left hand,
 * 45.1% down the right one) and the exports are sized in vw, so the lift that
 * puts the tip on that line is written in vw as well. What is left over —
 * `<section top padding> + 3rem`, 3rem being one line of the headline — is
 * where the tips land, at every width, since the headline is the first thing in
 * the column and therefore starts at the section's top padding.
 */
const HAND_TIP_LINE = {
  left: "lg:top-[calc(11rem-3.25vw)] xl:top-[calc(13rem-3.25vw)]",
  right: "lg:top-[calc(11rem-14.19vw)] xl:top-[calc(13rem-14.19vw)]",
} as const;

/*
 * Hanging the hands off their tips leaves the rest of each hand below the
 * headline, and the left one — wrist and forearm included — is the taller of
 * the two: it runs 26.82vw past its own top, so the last of it is 23.57vw below
 * the tip line. On a wide viewport that is more hand than the copy alone gives
 * the section height for, and the overflow that keeps the images off the footer
 * was cutting the forearm off flat.
 *
 * The section is floored at the depth the hand actually needs instead. It only
 * bites past ~1600px, where the vw-scaled hands outgrow the fixed-size copy;
 * narrower than that the copy is the taller of the two and the floor is slack.
 */
const HAND_CLEARANCE =
  "lg:min-h-[calc(11rem+23.57vw)] xl:min-h-[calc(13rem+23.57vw)]";

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
      className={clsx(
        "bg-ink relative isolate w-full overflow-hidden",
        HAND_CLEARANCE,
      )}
    >
      {/*
        Both exports are opaque, with the `ink` page colour baked into their
        background — which is why they read as floating on this section and
        nowhere else. Below `lg` there is no room for them beside the copy, and
        a decorative hand is the right thing to drop.
      */}
      <img
        src="/assets/robot-hand-left.webp"
        alt=""
        width={1160}
        height={1086}
        loading="lazy"
        aria-hidden="true"
        /*
         * 580 of the frame's 1920, flush to the left edge. Its index finger
         * ends 11.5% down the export, so 3.25vw (11.5% of the 28.28vw the
         * export stands at this width) is taken off the tip line to place it.
         */
        className={clsx(
          "pointer-events-none absolute left-0 -z-10 hidden w-[30.21%] lg:block",
          HAND_TIP_LINE.left,
        )}
      />
      <img
        src="/assets/robot-hand-right.webp"
        alt=""
        width={1306}
        height={1209}
        loading="lazy"
        aria-hidden="true"
        /*
         * 653 wide, flush to the right edge. The frame draws this hand 786.6
         * wide running off the canvas; the export is the part of it that is on
         * the page, which is why the two hands are not the same width here.
         *
         * This one reaches with a level finger halfway down its own export —
         * 45.1% — so it lifts by 14.19vw, far more than the left hand, and its
         * box starts above the section on a wide viewport. Only background is
         * up there; the hand itself begins 37.2% down.
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
