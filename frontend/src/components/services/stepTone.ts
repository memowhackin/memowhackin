import type { CSSProperties } from "react";

/**
 * Where a step sits in the sequence, as a colour.
 *
 * The rail fills along the brand ramp — `indigo` at the top, `lavender` by the
 * foot — so the numbers take their tone from that same ramp at the same depth.
 * That is what says "first" and "last" without a word: 01 opens in the deep
 * indigo the section starts on, 06 arrives at the lavender everything else on
 * this site resolves to, and the four between them are the walk from one to the
 * other.
 *
 * Mixed in oklab, as the rest of the site mixes colour, so the middle of the
 * ramp stays on the brand's own arc instead of cutting through the grey sRGB
 * interpolation puts between these two.
 *
 * The ramp starts a third of the way along rather than at bare `indigo-bright`.
 * Run the full distance, the first step came out darker than every other and
 * nearly lost against the page — which reads as "01 matters least", the exact
 * opposite of what a step numbered one is. The floor keeps 01 legible while
 * leaving the walk to 06 plainly visible.
 */
const TONE_FLOOR = 30;

export function stepTone(index: number, total: number): CSSProperties {
  const along = total > 1 ? index / (total - 1) : 1;
  const reached = TONE_FLOOR + along * (100 - TONE_FLOOR);

  return {
    "--step-tone": `color-mix(in oklab, var(--color-lavender) ${reached.toFixed(0)}%, var(--color-indigo-bright))`,
  } as CSSProperties;
}
