import clsx from "clsx";
import type { ReactNode } from "react";

interface SectionShellProps {
  id?: string;
  children: ReactNode;
  /** Applied to the <section>; use for background treatments. */
  className?: string;
  /** Applied to the centred content wrapper; use for vertical rhythm. */
  innerClassName?: string;
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
  "data-testid": testId,
}: SectionShellProps) {
  return (
    <section
      id={id}
      data-testid={testId}
      className={clsx("relative w-full", className)}
    >
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
