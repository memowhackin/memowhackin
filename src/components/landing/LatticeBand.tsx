import type { CSSProperties } from "react";
import { LogoMarkPaths } from "@/components/common/Logo";
import { LOGO_MARK_VIEWBOX } from "@/components/common/logoMark";

/*
 * The diamond band behind the hero panel: the logo mark stamped in a woven
 * lattice, with the light wandering from one mark to the next.
 *
 * It is drawn rather than laid in as artwork. The exported band was a flat webp
 * with its own near-black ground baked in, which sat over the hero as an opaque
 * rectangle — and, being one image, could only ever be lit as one image. Marks
 * that light *individually* have to be individual elements, and once they are,
 * the ground goes with them: what is between the marks here is the page.
 *
 * Every mark is a `<use>` of a single definition, so 160 of them cost one copy
 * of the path data and one rasterised glyph rather than 160.
 */

/** Design canvas. The band is drawn at this size and scaled to cover its box. */
const TILE_WIDTH = 1920;

/** Pitch of the lattice, in canvas units. */
const CELL = 64;

const ROWS = 5;
/*
 * Two more columns than the canvas needs. Odd rows are offset by half a cell,
 * so a run that started at the canvas edge would leave a notch at one end of
 * every other row; the extra column at each side puts that notch outside.
 */
const COLUMNS = TILE_WIDTH / CELL + 2;

const TILE_HEIGHT = CELL * ROWS;

/** The mark, inset in its cell so the lattice reads as a weave, not a grid. */
const MARK_SCALE = 0.72;

const MARK_ID = "hero-lattice-mark";

interface LatticeMark {
  key: string;
  transform: string;
  style: CSSProperties;
}

/*
 * A deterministic 0–1 from an integer. The timings have to look scattered but
 * must not actually be random: `Math.random` would hand every re-render of the
 * hero a fresh set, and the whole band would jump mid-cycle.
 */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

function buildMarks(): readonly LatticeMark[] {
  const marks: LatticeMark[] = [];
  const half = CELL / 2;

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const seed = row * COLUMNS + column + 1;

      // Odd rows step half a cell across, which is what turns a square grid
      // into the diagonal chains the brand pattern runs in.
      const offset = row % 2 === 0 ? 0 : half;
      const x = column * CELL - half + offset;
      const y = row * CELL + half;

      // Quarter turns cycling along both axes: the same mark, four ways up,
      // which is what gives the weave its direction.
      const angle = ((row + column) % 4) * 90;

      /*
       * Between four and eleven seconds, and each mark opens part-way through
       * its own cycle. No two neighbours share a length, so the lit marks never
       * settle into a pattern — the light hands over from one to the next for
       * as long as the page is open.
       */
      const duration = 4 + noise(seed) * 7;
      const delay = -noise(seed + 977) * duration;

      marks.push({
        key: `${row.toString()}-${column.toString()}`,
        transform: [
          `translate(${x.toString()} ${y.toString()})`,
          `rotate(${angle.toString()})`,
          `scale(${MARK_SCALE.toString()})`,
          `translate(${(-LOGO_MARK_VIEWBOX.width / 2).toString()} ${(-LOGO_MARK_VIEWBOX.height / 2).toString()})`,
        ].join(" "),
        style: {
          animationDuration: `${duration.toFixed(2)}s`,
          animationDelay: `${delay.toFixed(2)}s`,
        },
      });
    }
  }

  return marks;
}

const MARKS = buildMarks();

interface LatticeBandProps {
  className?: string;
}

export function LatticeBand({ className }: LatticeBandProps) {
  return (
    <svg
      viewBox={`0 0 ${TILE_WIDTH.toString()} ${TILE_HEIGHT.toString()}`}
      /*
       * `slice` scales the canvas to cover the band and crops the overflow,
       * which is how the old tiled background behaved: the full height of the
       * lattice always shows, and a wider viewport sees more of its width
       * rather than a stretched pattern.
       */
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <g id={MARK_ID}>
          <LogoMarkPaths />
        </g>
      </defs>

      {MARKS.map((mark) => (
        <use
          key={mark.key}
          href={`#${MARK_ID}`}
          transform={mark.transform}
          style={mark.style}
          className="fill-lavender animate-lattice-spark"
        />
      ))}
    </svg>
  );
}
