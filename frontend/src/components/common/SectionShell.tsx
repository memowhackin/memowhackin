import clsx from "clsx";
import type { ReactNode } from "react";

interface SectionShellProps {
  id?: string;
  children: ReactNode;
  /** Applied to the <section>; use for background treatments. */
  className?: string;
  /** Applied to the centred content wrapper; use for vertical rhythm. */
  innerClassName?: string;
  /**
   * Full-bleed decorative layer painted behind the content column, for washes
   * and glows that have to run past the column's gutters. The section is an
   * isolated stacking context, so give the layer a negative `z-index` to put it
   * behind the content but still in front of the section's own background.
   */
  backdrop?: ReactNode;
  "data-testid": string;
}

/**
 * Page section with the design's 1440px content column. Above 1440px the column
 * stops growing and the canvas gutters take over (the 240px margins in the
 * Figma frame); below it the column keeps a smaller padded gutter instead.
 */
export function SectionShell({
  id,
  children,
  className,
  innerClassName,
  backdrop,
  "data-testid": testId,
}: SectionShellProps) {
  return (
    <section
      id={id}
      data-testid={testId}
      className={clsx("relative isolate w-full", className)}
    >
      {backdrop}

      <div
        className={clsx(
          "mx-auto w-full max-w-[90rem] px-6 sm:px-10 lg:px-16 2xl:px-0",
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
