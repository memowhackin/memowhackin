import type { ReactNode } from "react";
import { SectionShell } from "@/components/common/SectionShell";

/*
 * The one light passage each ARGUS page gets.
 *
 * The site is dark by definition, so light is spent the way an accent colour
 * is: once per page, on the section that carries the page's most human
 * argument, where the tonal change makes the reader sit up. More than one of
 * these on a page and neither reads as an event.
 *
 * A rounded panel inside the content column rather than a full-bleed white
 * band — the same shape language the footer's raised panel introduced, so the
 * light section reads as an object on the page instead of a hole cut in it.
 * Dark portal fragments sit on it unchanged; `mist` is exactly the ground
 * they were built to pop against.
 */
export function LightBand({
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
      innerClassName="py-14 lg:py-20"
    >
      <div className="bg-mist text-ink-deep rounded-[2rem] px-6 py-12 sm:px-10 sm:py-14 lg:rounded-[2.5rem] lg:px-16 lg:py-16">
        {children}
      </div>
    </SectionShell>
  );
}
