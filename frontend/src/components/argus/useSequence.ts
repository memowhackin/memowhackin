import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/components/common/useMediaQuery";

/*
 * Autoplay only where motion is welcome. Same doctrine as the timeline rail and
 * the closing hands: where reduced motion is asked for, the ticker is never
 * started and the scene simply rests.
 */
const PLAYS = "(prefers-reduced-motion: no-preference)";

/*
 * How much of the scene must be on screen before it plays. Well past "one pixel
 * visible": a sequence that advances below the fold is spending its story on an
 * empty room, and the reader arrives mid-cycle wondering what they missed.
 */
const VISIBLE_SHARE = 0.35;

interface Sequence<T extends HTMLElement> {
  /** Attach to the scene's outermost element; visibility is measured on it. */
  ref: React.RefObject<T | null>;
  /** The step currently being told, 0-based. */
  active: number;
  /** Jump to a step. The reader has taken over; autoplay stops for good. */
  select: (step: number) => void;
}

/**
 * Walks a scene through its steps, one dwell at a time.
 *
 * Three things stop the clock, each on purpose:
 *
 * - the scene leaving the viewport, because product storytelling playing off
 *   screen is battery spent explaining nothing;
 * - `prefers-reduced-motion`, in which case the scene rests on its *last* step
 *   — the story's outcome — rather than opening on a first frame it would
 *   never leave. The rest state is derived, not set, so no effect has to
 *   write it;
 * - the reader choosing a step, which hands them the controls. Autoplay that
 *   wrestles the selection back after a pause reads as the page disagreeing
 *   with them.
 */
export function useSequence<T extends HTMLElement>(
  steps: number,
  stepMs: number,
): Sequence<T> {
  const ref = useRef<T>(null);
  const plays = useMediaQuery(PLAYS);
  /** Where autoplay has walked to. */
  const [tick, setTick] = useState(0);
  /** The reader's own choice, once they have made one. */
  const [selected, setSelected] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const taken = selected !== null;

  useEffect(() => {
    const element = ref.current;
    if (!element || !plays || taken) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisible(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: VISIBLE_SHARE },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [plays, taken]);

  useEffect(() => {
    if (!plays || taken || !visible) return;

    const timer = window.setInterval(() => {
      setTick((step) => (step + 1) % steps);
    }, stepMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [plays, taken, visible, steps, stepMs]);

  // Priority order: the reader's choice, then the autoplay position, then —
  // where motion is unwelcome — the story's outcome as the resting frame.
  let active = steps - 1;
  if (selected !== null) {
    active = selected;
  } else if (plays) {
    active = tick;
  }

  return { ref, active, select: setSelected };
}
