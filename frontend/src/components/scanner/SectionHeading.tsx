import type { ReactNode } from "react";

/*
 * One section's opening, shared by every section in the report.
 *
 * The page previously gave each section its own arrangement of heading and
 * paragraph, at its own spacing, which is why eight sections of real content
 * still read as an undifferentiated column. A report is a document: the same
 * rule above every heading, the same distance to the text below it, and a
 * count on the right where there is something to count.
 *
 * Nothing is separated by a rule. Eight sections each opening with a hairline
 * turned the page into a stack of ruled boxes, which is the look this report
 * was rebuilt to get away from. Distance and a change of type size do the same
 * job without drawing eight lines nobody asked to read.
 */
export function SectionHeading({
  id,
  title,
  count,
  children,
}: {
  /** Anchor target for the contents strip. */
  id: string;
  title: string;
  /** Shown right-aligned when the section has a countable subject. */
  count?: string;
  /** The standfirst. Optional — not every section needs explaining. */
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2
          id={id}
          className="font-display text-mist scroll-mt-28 text-xl leading-snug font-normal text-balance sm:text-2xl"
        >
          {title}
        </h2>
        {count !== undefined && (
          <p className="text-mist/50 font-mono text-base tabular-nums">
            {count}
          </p>
        )}
      </div>

      {children !== undefined && (
        <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
          {children}
        </p>
      )}
    </div>
  );
}

/** The shared outer shell. Space only: no rule, no surface, no border. */
export const SECTION_SHELL = "flex scroll-mt-24 flex-col gap-7";
