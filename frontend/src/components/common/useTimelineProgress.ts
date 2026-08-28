import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/components/common/useMediaQuery";

/*
 * Where in the viewport a step counts as reached, as a share of its height.
 *
 * Half way down: the rail fills to meet a step as it arrives at the middle of
 * the screen, which is where a reader's eye already is. Tying it to the top
 * edge instead filled the whole rail before the last step had been read, and
 * tying it to the bottom left the rail empty through the first two.
 */
const FOCUS_LINE = 0.5;

/*
 * Movement tied to the scroll, so where reduced motion is asked for the
 * listener is never attached and the rail is simply drawn full. Same doctrine
 * as `useHandReach` and `ScrollFillText`.
 */
const TRACKS_SCROLL = "(prefers-reduced-motion: no-preference)";

/**
 * Writes `--timeline-progress` on an element: 0 with the element still below
 * the focus line, 1 once its foot has passed it.
 *
 * One custom property per frame and no state, so nothing re-renders while the
 * page is scrolled — the fill is a `scaleY` on a composited layer, which is the
 * difference between a rail that tracks the scroll and one that stutters
 * through it. The loop only runs on a frame the scroll actually asked for; at
 * rest there is no frame work at all.
 *
 * Deliberately unsmoothed, unlike the closing section's hands. This is a
 * progress indicator: it reports where the reader is, and a value that eased
 * its way there would be reporting where the reader was a moment ago.
 */
export function useTimelineProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const tracks = useMediaQuery(TRACKS_SCROLL);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!tracks) {
      element.style.setProperty("--timeline-progress", "1");
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const target = ref.current;
      if (!target) return;

      const viewport = document.documentElement.clientHeight;
      const box = target.getBoundingClientRect();
      // Guard the divide: a collapsed list would otherwise write Infinity.
      if (box.height === 0) return;

      const reached = (viewport * FOCUS_LINE - box.top) / box.height;
      const progress = Math.min(Math.max(reached, 0), 1);

      target.style.setProperty("--timeline-progress", progress.toFixed(4));
    };

    const schedule = () => {
      // Scroll fires far faster than paint, so readings coalesce onto a frame.
      frame ||= requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [tracks]);

  return ref;
}
