import clsx from "clsx";

/**
 * The diamond that marks a hairline intersection.
 *
 * It is the brand's own mark reduced to its smallest form — the same rotated
 * square the lattice, the section stripes and the logo are built from — and it
 * is what tells a ruled grid apart from a table: the rules meet at a mark
 * rather than simply crossing.
 *
 * Positioned by the caller, because where a crossing falls is the grid's
 * business, not the mark's.
 */
export function RuleNode({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "bg-lavender absolute size-2 rotate-45 rounded-xs",
        className,
      )}
    />
  );
}
