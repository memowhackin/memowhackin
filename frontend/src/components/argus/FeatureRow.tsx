import type { ReactNode } from "react";
import clsx from "clsx";
import { RuleNode } from "@/components/common/RuleNode";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";

/*
 * The home page's service rows, lent to the ARGUS pages: full-width rows on
 * the hairline grid, copy on one side and the product on the other, the
 * screenshot's side alternating row by row. Same rules, same nodes, same
 * frame — a reader crossing from the home page should recognise the rhythm
 * without being able to say why.
 */

interface FeatureRowProps {
  title: string;
  body: string;
  /** An extra element under the body — a disclaimer, a second paragraph. */
  aside?: ReactNode;
  /**
   * The product side. A real screenshot arrives already framed by the row; a
   * drawn panel brings its own identical frame, so it is rendered bare.
   */
  visual: ReactNode;
  /** Wrap `visual` in the screenshot frame. Off for drawn panels. */
  framed?: boolean;
  imageFirst?: boolean;
  "data-testid": string;
}

export function FeatureRow({
  title,
  body,
  aside,
  visual,
  framed = false,
  imageFirst = false,
  "data-testid": testId,
}: FeatureRowProps) {
  const { ref, className } = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      data-testid={testId}
      className={clsx(
        /* `grid-cols-1` is load-bearing: an auto track takes the widest
           cell's min-content, and one long mono string in a drawn panel then
           drags the whole row past a phone's edge. */
        "relative grid grid-cols-1 items-center gap-8 py-10 sm:gap-10 lg:grid-cols-2 lg:gap-0 lg:py-14",
        className,
      )}
    >
      {/*
        The frame rules the grid with unbroken hairlines that pass behind the
        screenshots, drawn as their own layer above the cells rather than as
        cell borders (which the images interrupt). Consecutive rows share a
        line: each paints its top and bottom, and two hairlines a pixel apart
        read as one.
      */}
      <span
        className="bg-indigo-deep/60 pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
        aria-hidden="true"
      />
      <span
        className="bg-indigo-deep/60 pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px"
        aria-hidden="true"
      />
      <span
        className="bg-indigo-deep/60 pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-px lg:block"
        aria-hidden="true"
      />
      <RuleNode className="top-0 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
      <RuleNode className="bottom-0 left-1/2 z-20 hidden -translate-x-1/2 translate-y-1/2 lg:block" />

      <div
        className={clsx(
          "flex flex-col gap-5 sm:gap-6",
          imageFirst ? "lg:order-2 lg:pl-10 xl:pl-14" : "lg:pr-10 xl:pr-14",
        )}
      >
        <h2 className="font-display text-service text-mist font-normal text-balance">
          {title}
        </h2>

        <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
          {body}
        </p>

        {aside}
      </div>

      <div
        className={clsx(
          imageFirst ? "lg:order-1 lg:mr-10 xl:mr-14" : "lg:ml-10 xl:ml-14",
        )}
      >
        {framed ? (
          <div className="border-indigo-deep/70 bg-ink-deep relative overflow-hidden rounded-xl border">
            {visual}
          </div>
        ) : (
          visual
        )}
      </div>
    </li>
  );
}

/**
 * The rows' shared ground. One list per run of rows, so consecutive rows sit
 * on the same hairlines the way the home page's do.
 */
export function FeatureRows({
  children,
  "data-testid": testId,
}: {
  children: ReactNode;
  "data-testid": string;
}) {
  return (
    <SectionShell
      className="bg-transparent"
      data-testid={testId}
      innerClassName="flex flex-col gap-3 py-10 lg:py-14"
    >
      <ul className="relative flex w-full flex-col">{children}</ul>
    </SectionShell>
  );
}
