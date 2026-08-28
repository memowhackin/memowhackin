import { useEffect, useRef } from "react";

interface HorizontalPin {
  /** How many stations the travel is divided into. */
  steps: number;
  /**
   * Called with the station now at the centre, only when it changes.
   *
   * Must be stable across renders — a `useState` setter, or something wrapped
   * in `useCallback`. It is a dependency of the effect that installs the
   * listeners, so a fresh arrow each render would tear them all down and put
   * them back for nothing.
   */
  onStep: (index: number) => void;
  /** Off below the breakpoint, and for a reader who asked for less motion. */
  enabled: boolean;
}

/**
 * Pins a section to the screen and spends the scroll through it sideways.
 *
 * The section is made taller than the viewport by exactly the distance its
 * track has to travel; inside it, a `sticky` pane holds still while that extra
 * height is scrolled through, and the track is translated by the same amount.
 * The reader scrolls down, the content goes left, and when the section's extra
 * height is used up the page carries on down as normal — from either direction,
 * because nothing about it is directional.
 *
 * **The scroll is never intercepted.** No `preventDefault`, no wheel handler, no
 * animation stepping the page along. Those are what make a hijacked section
 * fight a trackpad, ignore Page Down, swallow a search-in-page jump and land
 * somewhere else than where a phone's momentum was heading. Everything here is
 * the browser's own scrolling, read once per frame and turned into one number.
 *
 * Two custom properties, written outside React:
 *
 * - `--pin-shift`  the distance the track must travel, which is also the extra
 *                  height the section carries
 * - `--pin-progress` 0 at the top of that travel, 1 at the end of it
 *
 * `onStep` is the one thing that reaches React, and only when the answer
 * changes — five times across the whole section rather than once a frame.
 */
export function useHorizontalPin<
  TOuter extends HTMLElement = HTMLElement,
  TFrame extends HTMLElement = HTMLDivElement,
  TTrack extends HTMLElement = HTMLDivElement,
>({ steps, onStep, enabled }: HorizontalPin) {
  const outerRef = useRef<TOuter>(null);
  const windowRef = useRef<TFrame>(null);
  const trackRef = useRef<TTrack>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const frameEl = windowRef.current;
    const track = trackRef.current;
    if (!outer || !frameEl || !track) return;

    if (!enabled) {
      // Leave nothing behind: with the properties gone the section is its own
      // height again and the track sits where it was written.
      for (const name of ["--pin-shift", "--pin-progress"]) {
        outer.style.removeProperty(name);
      }
      return;
    }

    let frame = 0;
    let shift = 0;
    let step = -1;

    const measure = () => {
      shift = Math.max(track.scrollWidth - frameEl.clientWidth, 0);
      outer.style.setProperty("--pin-shift", `${shift.toString()}px`);
    };

    const read = () => {
      frame = 0;
      if (shift === 0) return;

      /*
       * The section's own top against the travel it has to spend. Negative once
       * the top has left the screen, so the ratio runs 0 → 1 across exactly the
       * extra height, and is clamped outside it: above the section the track
       * waits at its first panel, below it at its last.
       */
      const progress = Math.min(
        Math.max(-outer.getBoundingClientRect().top / shift, 0),
        1,
      );
      outer.style.setProperty("--pin-progress", progress.toFixed(4));

      // The panels are spaced evenly along that travel, so which one is at the
      // middle is the progress rounded to the nearest of them.
      const next = Math.round(progress * (steps - 1));
      if (next !== step) {
        step = next;
        onStep(next);
      }
    };

    const schedule = () => {
      // Scroll fires far faster than paint, so readings coalesce onto a frame.
      frame ||= requestAnimationFrame(read);
    };

    measure();
    read();

    /*
     * The track's width moves with the fonts finishing, an image landing or the
     * window changing, and the section's height is derived from it — so it is
     * watched rather than measured once. `ResizeObserver` fires on the frame
     * the box actually changed, which `resize` alone would miss.
     */
    const resize = new ResizeObserver(() => {
      measure();
      read();
    });
    resize.observe(track);
    resize.observe(frameEl);

    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      resize.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, steps, onStep]);

  return { outerRef, windowRef, trackRef };
}
