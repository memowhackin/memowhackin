import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/components/common/useMediaQuery";

/*
 * Windows lighting up across the skyline as the reader scrolls the section in.
 *
 * The photograph already carries lit windows of its own; these add to them,
 * building by building, so the city appears to switch its lights on for the
 * reader. Which windows exist, where exactly they sit and how bright they burn
 * are all drawn from the same deterministic noise the lattice band uses — a
 * re-render can never reshuffle the city.
 *
 * The reveal runs on one custom property, `--city-light`, written by a
 * rAF-coalesced scroll handler on the layer itself — no state, no re-renders,
 * the same doctrine as ScrollFillText. Each window derives its own opacity
 * from that value and its place in the lighting order (see `city-window` in
 * `index.css`). The property's fallback is 1: without JavaScript, or under
 * reduced motion where the handler is never attached, the city is simply lit.
 */

/**
 * A building face windows can appear on, as fractions of the section box —
 * which from `lg` up is locked to the photograph's 1920×1406, so a zone read
 * off the picture stays on its tower at every width. Derived from the alert
 * perches: each face starts under where that building's connector ends.
 */
interface Face {
  left: number;
  width: number;
  top: number;
  bottom: number;
}

const faces: readonly Face[] = [
  { left: 2.5, width: 4.5, top: 57, bottom: 78 }, // westBlock
  { left: 7.5, width: 5.5, top: 48, bottom: 80 }, // westCrown, the tall one
  { left: 27.5, width: 4, top: 58, bottom: 78 }, // midWest
  { left: 35, width: 4.5, top: 60, bottom: 78 }, // twinSpire
  { left: 51, width: 5, top: 62, bottom: 80 }, // flatTop
  { left: 62, width: 4.5, top: 61, bottom: 80 }, // litCrown
  { left: 70, width: 4, top: 63, bottom: 80 }, // midEast
  { left: 80.5, width: 5.5, top: 53, bottom: 80 }, // eastFins, the tall one
  { left: 86, width: 4, top: 63, bottom: 78 }, // eastLow
];

/** Pitch of the window grid, in percent of the section box. */
const COLUMN_STEP = 1.15;
const ROW_STEP = 2.1;

/** Cap on the total, so the city glows rather than turns into a scoreboard. */
const MAX_WINDOWS = 72;

/** A stable 0-1 from an integer — the lattice band's noise, same reasoning. */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

interface Window {
  key: string;
  left: number;
  top: number;
  /** Place in the lighting order, 0..count-1. */
  index: number;
  /** How bright this window burns at full reveal, 0.45–1. */
  strength: number;
}

function buildWindows(): readonly Window[] {
  const candidates: Omit<Window, "index">[] = [];

  faces.forEach((face, faceIndex) => {
    const columns = Math.max(2, Math.round(face.width / COLUMN_STEP));
    const rows = Math.max(3, Math.round((face.bottom - face.top) / ROW_STEP));

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const seed = faceIndex * 1000 + row * 37 + column * 7 + 1;
        // Roughly half the grid exists; a full grid reads as an LED matrix.
        if (noise(seed) < 0.52) continue;

        candidates.push({
          key: `${faceIndex.toString()}-${row.toString()}-${column.toString()}`,
          left:
            face.left +
            (column + 0.2 + noise(seed * 3) * 0.5) * (face.width / columns),
          top:
            face.top +
            (row + 0.2 + noise(seed * 5) * 0.4) *
              ((face.bottom - face.top) / rows),
          strength: 0.45 + noise(seed * 11) * 0.55,
        });
      }
    }
  });

  return (
    candidates
      // The lighting order is shuffled across the whole city, so windows come on
      // scattered rather than building by building like a test pattern.
      .sort((a, b) => noise(a.top * 131 + a.left) - noise(b.top * 131 + b.left))
      .slice(0, MAX_WINDOWS)
      .map((window, index) => ({ ...window, index }))
  );
}

const windows = buildWindows();

/** Movement tied to the scroll; under reduced motion the city is simply lit. */
const LIGHTS_ON_SCROLL = "(prefers-reduced-motion: no-preference)";

export function CityLights() {
  const ref = useRef<HTMLDivElement>(null);
  const lights = useMediaQuery(LIGHTS_ON_SCROLL);

  useEffect(() => {
    if (!lights) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const element = ref.current;
      if (!element) return;

      const viewport = document.documentElement.clientHeight;
      const box = element.getBoundingClientRect();
      /*
       * 0 as the section's top touches the viewport's foot, 1 once nine
       * tenths of it has come in — which, the section being half again as
       * tall as the screen, lands while the buildings are front and centre.
       */
      const progress = (viewport - box.top) / (box.height * 0.9);
      element.style.setProperty(
        "--city-light",
        Math.min(Math.max(progress, 0), 1).toFixed(4),
      );
    };

    const schedule = () => {
      // Scroll fires far faster than paint, so readings coalesce onto a frame.
      frame ||= requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [lights]);

  return (
    <div
      ref={ref}
      data-testid="city-lights"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
      style={{ "--city-count": windows.length } as React.CSSProperties}
    >
      {windows.map((window) => (
        <span
          key={window.key}
          className="city-window"
          style={
            {
              left: `${window.left.toFixed(2)}%`,
              top: `${window.top.toFixed(2)}%`,
              "--city-index": window.index,
              "--city-strength": window.strength.toFixed(2),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
