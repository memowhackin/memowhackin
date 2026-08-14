import clsx from "clsx";

/**
 * The lavender chip the design labels things with — the agent alerts strung
 * across the skyline and the capability tags on the constellation are the same
 * component in the frame ("Workflows"), and had drifted into two near-copies
 * here.
 *
 * The frame's metrics are 16/20 type on 10/12/10/8 padding with an 8px square
 * marker, drawn for a 1920 canvas. Taken literally those hold at every width,
 * which is what put three of these on a 272px-wide graphic on a phone and had
 * them overlapping each other by 23px. The chip scales with what it is labelling
 * instead, reaching the drawn size at `lg` where the artwork is full size.
 *
 * Everything else is straight from the node: `accent` on `pink` rather than the
 * page colour, the hairline warm-grey edge, and the two-layer shadow that lifts
 * it off whatever it is pinned to.
 */
export function chipClass(className?: string): string {
  return clsx(
    "bg-lavender text-indigo-deep items-center gap-1 rounded-md border border-[#6b728033] py-1.5 pr-2 pl-1.5 text-xs leading-4 font-medium shadow-[0_0.0625rem_0.0625rem_rgba(74,86,99,0.1),0_0.375rem_0.4375rem_rgba(74,86,99,0.08)]",
    "sm:gap-[0.3125rem] sm:py-2 sm:pr-2.5 sm:pl-2 sm:text-sm sm:leading-5",
    "lg:py-2.5 lg:pr-3 lg:pl-2 lg:text-base",
    className,
  );
}

/**
 * The marker inside a chip. The frame draws a plain square in `accent` — not a
 * dot, and not in the page colour: `ink-deep` on lavender read as a hole punched
 * in the chip.
 */
export const chipMarkerClass = "bg-indigo-deep size-1.5 shrink-0 sm:size-2";
