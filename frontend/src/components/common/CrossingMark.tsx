import clsx from "clsx";
import { LogoMark } from "@/components/common/Logo";

/**
 * The brand's square mark, standing in a small clearing of the page colour.
 *
 * Used where a rule arrives somewhere that means something — the crossings of
 * the coverage grid, the foot of the process rail. At those points the eye
 * already stops, which makes them the one place on a page of plain hairlines
 * where the logo can appear without being decoration hung on the layout.
 *
 * The clearing is what makes it legible: the mark is three shapes with counters
 * between them, and a hairline running through those counters turns it into a
 * smudge. `ink` to the pixel — the service pages paint that colour and their
 * sections are transparent over it.
 *
 * Carries no `display` and no `position` of its own. Tailwind emits `.hidden`
 * ahead of the other display utilities, so a `display` set here would beat the
 * `hidden lg:block` a caller needs to drop the mark along with the rule it
 * belongs to.
 */
export function CrossingMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx("bg-ink rounded-sm p-1.5", className)}
    >
      {/*
        Sized by legibility, not by the diamond it replaced. At the rule node's
        0.5rem the counters close up and it reads as a speck; at 1rem it is
        unmistakably the mark, and still a step below the 1.25rem icons in the
        cells — an ornament on a rule should not outweigh what it is ruling.
      */}
      <LogoMark className="text-lavender block h-4 w-auto" />
    </span>
  );
}
