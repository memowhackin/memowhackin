import clsx from "clsx";

/*
 * A field of commit-graph dots for the light bands' top corners: the grid of
 * small rounded squares every developer knows from a contribution graph, in
 * the band's own dark tone at a whisper, dissolving as it comes down into the
 * content. Ornament with a familiar shape rather than abstract noise — and
 * quiet enough that the band still reads as calm.
 */

const COLS = 22;
const ROWS = 30;
const PITCH = 12;
const SIZE = 6;

/*
 * Deterministic per-cell strength. Not random on purpose: a render must equal
 * its prerender, and a pattern that reshuffles on every visit reads as a
 * glitch. The mix of primes lands close enough to a real contribution graph —
 * clusters, gaps, the odd hot cell.
 */
const ALPHAS = [0, 0.55, 0.18, 0, 0.38, 0.1, 0.65, 0, 0.26, 0.45] as const;

function alpha(col: number, row: number): number {
  return ALPHAS[(col * 7 + row * 11 + ((col * row) % 5)) % ALPHAS.length] ?? 0;
}

const FADE = "radial-gradient(115% 105% at 0% 0%, black 35%, transparent 80%)";

export function CommitDots({ side }: { side: "left" | "right" }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "pointer-events-none absolute top-0 hidden sm:block",
        // One pattern, mirrored: the flip carries the corner-anchored fade
        // with it, so both sides dissolve toward the middle.
        side === "left" ? "left-0" : "right-0 -scale-x-100",
      )}
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
    >
      <svg
        width={COLS * PITCH}
        height={ROWS * PITCH}
        viewBox={`0 0 ${(COLS * PITCH).toString()} ${(ROWS * PITCH).toString()}`}
        className="text-ink-deep opacity-40"
      >
        {Array.from({ length: COLS }, (_, col) =>
          Array.from({ length: ROWS }, (_, row) => (
            <rect
              key={`${col.toString()}-${row.toString()}`}
              x={col * PITCH}
              y={row * PITCH}
              width={SIZE}
              height={SIZE}
              rx={1.5}
              fill="currentColor"
              fillOpacity={alpha(col, row)}
            />
          )),
        )}
      </svg>
    </div>
  );
}
