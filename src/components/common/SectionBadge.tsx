import type { ReactNode } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";

interface SectionBadgeProps {
  children: ReactNode;
  className?: string;
  "data-testid": string;
}

/**
 * The pill the frame heads a section with (node 49:24666, "Offering services"):
 * the brand mark, the label, and a small arrow, in a nearly transparent capsule
 * over a 12.5px backdrop blur.
 *
 * Measured off that node: 18px of side padding on 10px of top and bottom, a
 * 90px radius, 8px between the three parts, a 16px medium label at 0.02em, a
 * 20×17 mark and a 12px arrow. The fill the frame gives it is the brand ramp at
 * 1% alpha — that is not a colour, it is the blur showing through, so the blur
 * is what is reproduced here.
 *
 * The one departure is the outline. The frame strokes it in `ink-deep`, which
 * is the page colour: invisible on every surface this sits on. It takes
 * `indigo-deep` instead, which is the same edge the frame gives the cards.
 *
 * It renders an `<h2>` because that is what it is in both places it appears —
 * the section's heading, not an ornament above one.
 */
export function SectionBadge({
  children,
  className,
  "data-testid": testId,
}: SectionBadgeProps) {
  return (
    <h2
      data-testid={testId}
      className={clsx(
        "border-indigo-deep rounded-selector inline-flex w-fit items-center gap-2 border px-[1.125rem] py-2.5 backdrop-blur-[0.78125rem]",
        className,
      )}
    >
      <LogoMark className="text-lavender h-[1.07rem] w-auto shrink-0" />

      <span className="text-base font-medium tracking-[0.02em] text-white">
        {children}
      </span>

      <ArrowRight className="size-3 shrink-0 text-white" aria-hidden="true" />
    </h2>
  );
}
