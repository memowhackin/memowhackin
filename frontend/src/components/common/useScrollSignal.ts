import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import {
  crossingState,
  FOCUS_LINE,
  headAlpha,
  placeSparks,
  sparkAlpha,
  trailProgress,
  type Spark,
} from "@/components/common/scrollSignal";

/*
 * Movement tied to the scroll, so where reduced motion is asked for the
 * overlay is driven in its two-state form (see `crossingState`) and the rows
 * are left alone entirely. Same doctrine as `useTimelineProgress`, except that
 * this one still reports where the reader is: it is a progress state, held
 * still, rather than a rail simply drawn full.
 */
const TRACKS_SCROLL = "(prefers-reduced-motion: no-preference)";

/** The grid as measured, in pixels relative to the container's top-left. */
export interface SignalGeometry {
  width: number;
  height: number;
  /**
   * The x of the centre rule. Half a pixel past the middle, which is where the
   * grid's own `left-1/2 w-px` hairline actually sits, so the overlay's core
   * lands on it rather than a half-pixel beside it.
   */
  centre: number;
  /** A rem in pixels, so the overlay's marks are sized in the grid's own unit. */
  unit: number;
  /**
   * The y of every crossing, top to bottom: the top rule of each row, and the
   * foot of the last one.
   */
  crossings: readonly number[];
  sparks: readonly Spark[];
}

/**
 * An element's offset from the container, summed up the `offsetParent` chain.
 * Offsets rather than rects, because the rows arrive through a reveal that
 * translates them for most of a second and a rect taken mid-animation would
 * put every crossing a rem too low.
 */
function offsetWithin(element: HTMLElement, container: HTMLElement): number {
  let y = 0;
  let node: Element | null = element;

  while (node instanceof HTMLElement && node !== container) {
    y += node.offsetTop;
    node = node.offsetParent;
  }

  return y;
}

function measure(container: HTMLElement): SignalGeometry | null {
  const rows = Array.from(
    container.querySelectorAll<HTMLElement>("[data-signal-row]"),
  );
  const width = container.clientWidth;
  const height = container.clientHeight;
  const last = rows[rows.length - 1];
  if (last === undefined || width === 0 || height === 0) return null;

  const fontSize = parseFloat(getComputedStyle(container).fontSize);
  const unit = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 16;

  /*
   * Each crossing sits on the grid's own rule. The grid draws every row's top
   * rule as a 1px line starting on the row's top edge and its bottom rule as
   * one ending on its bottom edge, so the first and last rules are centred
   * half a pixel inside the boundary; the rules between rows are one row's
   * bottom line and the next row's top line side by side, centred exactly on
   * it. Meeting those centres is what keeps the lit core crisp on the line.
   */
  const boundaries = [
    ...rows.map((row) => offsetWithin(row, container)),
    offsetWithin(last, container) + last.offsetHeight,
  ];
  const crossings = boundaries.map((y, index) => {
    if (index === 0) return y + 0.5;
    if (index === boundaries.length - 1) return y - 0.5;
    return y;
  });

  return {
    width,
    height,
    centre: width / 2 + 0.5,
    unit,
    crossings,
    sparks: placeSparks(height, crossings, unit),
  };
}

function sameGeometry(
  a: SignalGeometry | null,
  b: SignalGeometry | null,
): boolean {
  if (a === null || b === null) return a === b;

  return (
    a.width === b.width &&
    a.height === b.height &&
    a.unit === b.unit &&
    a.crossings.length === b.crossings.length &&
    a.crossings.every((y, index) => y === b.crossings[index])
  );
}

/** Writes a custom property only when it has changed, so a resting crossing costs nothing per frame. */
function write(
  element: ElementCSSInlineStyle,
  property: string,
  value: number,
): void {
  const next = value.toFixed(4);
  if (element.style.getPropertyValue(property) === next) return;

  element.style.setProperty(property, next);
}

/**
 * Measures a ruled grid and drives the scan over it.
 *
 * The container holds rows marked `data-signal-row`, and the overlay
 * (`data-signal-overlay`, drawn by `ScrollSignal` from the geometry this
 * returns) holds a group per crossing and an element per spark. Each scroll
 * frame this reads where the reader is and writes what every part of the
 * picture should be as custom properties — on the overlay, on each crossing's
 * group, on each spark and on each row — and nothing else: no state, so no
 * render, so the signal tracks the scrollbar instead of stuttering after it.
 *
 * Geometry is the one thing that does go through state, because the overlay
 * has to be drawn from it, and it changes rarely: on resize, and when a row
 * changes height as its picture loads or its copy reflows in another language.
 *
 * Deliberately unsmoothed, like the process rail and unlike the closing
 * hands: this reports where the reader is, and a value easing towards that
 * would be reporting where they were.
 */
export function useScrollSignal<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  geometry: SignalGeometry | null;
} {
  const ref = useRef<T>(null);
  const [geometry, setGeometry] = useState<SignalGeometry | null>(null);
  const tracks = useMediaQuery(TRACKS_SCROLL);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    const remeasure = () => {
      const next = measure(container);
      setGeometry((current) => (sameGeometry(current, next) ? current : next));
    };

    if (typeof ResizeObserver === "undefined") {
      // No observer to deliver the first reading, so take it on the next frame
      // and follow the window from then on.
      const frame = requestAnimationFrame(remeasure);
      window.addEventListener("resize", remeasure);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", remeasure);
      };
    }

    // An observer reports once on attach, which is where the first reading
    // comes from; after that it reports whenever the container or a row
    // changes size.
    const observer = new ResizeObserver(remeasure);
    observer.observe(container);
    for (const row of container.querySelectorAll("[data-signal-row]")) {
      observer.observe(row);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container || !geometry) return;

    const overlay = container.querySelector<SVGSVGElement>(
      "[data-signal-overlay]",
    );
    if (!overlay) return;

    const crossings = Array.from(
      overlay.querySelectorAll<SVGGElement>("[data-signal-crossing]"),
    );
    const sparks = Array.from(
      overlay.querySelectorAll<SVGElement>("[data-signal-spark]"),
    );
    const rows = Array.from(
      container.querySelectorAll<HTMLElement>("[data-signal-row]"),
    );
    const reduced = !tracks;
    let frame = 0;

    /*
     * The rows and the branches are only ever written while the scroll is
     * being tracked. If the preference changes to reduced motion mid-page,
     * whatever they were last written with would otherwise stay: a row held
     * dim, a branch held lit. Clearing them hands the rows back to their
     * utilities' full-strength fallback and the branches to their hidden one.
     */
    if (reduced) {
      for (const row of rows) {
        row.style.removeProperty("--signal-t");
        row.style.removeProperty("--signal-edge");
      }
      for (const spark of sparks) spark.style.removeProperty("--spark");
    }

    const update = () => {
      frame = 0;

      const viewport = document.documentElement.clientHeight;
      if (viewport === 0) return;

      // How far into the grid the focus line has come, in pixels; negative
      // while the whole grid is still below it.
      const front =
        viewport * FOCUS_LINE - container.getBoundingClientRect().top;

      write(
        overlay,
        "--signal-progress",
        trailProgress(front, geometry.height, geometry.crossings, reduced),
      );
      write(
        overlay,
        "--signal-front",
        Math.min(Math.max(front, 0), geometry.height),
      );
      write(
        overlay,
        "--signal-head",
        reduced ? 0 : headAlpha(front, geometry.height, viewport),
      );

      geometry.crossings.forEach((y, index) => {
        const state = crossingState(front - y, viewport, reduced);

        const group = crossings[index];
        if (group !== undefined) {
          write(group, "--lit", state.lit);
          write(group, "--swell", state.swell);
          write(group, "--spread", state.spread);
          write(group, "--spread-head", state.spreadHead);
          write(group, "--pulse", state.pulse);
          write(group, "--ring", state.ring);
        }

        // The row below this crossing wakes as its rule is run. Under reduced
        // motion the rows are never written, and their utilities' fallback
        // delivers them at full strength.
        const row = rows[index];
        if (row !== undefined && !reduced) {
          write(row, "--signal-t", state.spread);
          write(row, "--signal-edge", state.edge);
        }
      });

      if (reduced) return;

      geometry.sparks.forEach((spark, index) => {
        const element = sparks[index];
        if (element === undefined) return;

        write(element, "--spark", sparkAlpha(front - spark.y, viewport));
      });
    };

    const schedule = () => {
      // Scroll fires far faster than paint, so readings coalesce onto a frame.
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [geometry, tracks]);

  return { ref, geometry };
}
