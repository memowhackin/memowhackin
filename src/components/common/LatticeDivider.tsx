import type { CSSProperties } from "react";
import { LatticeBand } from "@/components/landing/LatticeBand";

/*
 * The brand's lattice as a section divider: the diamond weave of the mark,
 * drawn live with the light wandering between marks, on a ground that carries
 * one page colour into the next — so the band owns the colour change instead
 * of sitting between two seams. Shared by the about and contact pages.
 */

/**
 * The weave fades in from nothing on every side, so it has no edge to find
 * anywhere and reads as light passing through the page rather than a strip
 * pinned across it.
 *
 * The two ramps live on two nested wrappers rather than as one two-layer
 * mask: multi-layer `mask-composite` intersection did not hold up across
 * engines — the horizontal ramp silently dropped out — and nesting composes
 * the same intersection without asking the mask shorthand to do it.
 */
const FADE_X: CSSProperties = {
  maskImage:
    "linear-gradient(to right, transparent 0%, #000 22%, #000 78%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to right, transparent 0%, #000 22%, #000 78%, transparent 100%)",
};

const FADE_Y: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0%, #000 32%, #000 68%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(to bottom, transparent 0%, #000 32%, #000 68%, transparent 100%)",
};

/** `ink-deep` at the head running to `ink` at the foot, matching the sections around it. */
const GROUND: CSSProperties = {
  background:
    "linear-gradient(to bottom, var(--color-ink-deep) 0%, var(--color-ink) 100%)",
};

interface LatticeDividerProps {
  "data-testid"?: string;
}

export function LatticeDivider({ "data-testid": testId }: LatticeDividerProps) {
  return (
    <div
      data-testid={testId}
      aria-hidden="true"
      className="overflow-hidden py-10 sm:py-14"
      style={GROUND}
    >
      <div style={FADE_Y}>
        <div style={FADE_X}>
          {/*
            Two crops of the one lattice. On a phone the full 1920 canvas
            renders each mark at a dozen pixels — dust rather than a weave —
            so below `sm` the band looks at the middle stretch of the same
            canvas instead and every mark comes out roughly twice the size.
            The hidden copy is `display: none`, so its animations do not run.
          */}
          <LatticeBand variant="close" className="h-28 w-full sm:hidden" />
          <LatticeBand className="hidden h-32 w-full sm:block lg:h-40" />
        </div>
      </div>
    </div>
  );
}
