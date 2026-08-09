import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/components/common/useMediaQuery";

/**
 * A place on the skyline an alert can land on. Coordinates are fractions of the
 * section's own box rather than lengths, because from `lg` up that box is locked
 * to the photograph's 1920×1406 — so a fraction picked off the picture stays on
 * the same rooftop at every width.
 */
export interface Perch {
  key: string;
  /**
   * Left edge of the chip, as a percentage of the section's width. The
   * connector hangs 8px in from it, as drawn, so the building being called out
   * is a shade to the right of this number.
   */
  left: number;
  /** Top of the chip, as a percentage of the section's height. */
  top: number;
  /** Length of the connector below the chip, in `vw`, as the drawn ones were. */
  drop: number;
}

/** One alert currently up on the skyline. */
export interface Sighting {
  /**
   * Unique per appearance, not per perch. It is the React key, and an alert
   * that reused an id would be re-used rather than remounted — its entrance
   * animation would not play the second time. So the counter behind it is never
   * reset, and the still arrangement numbers itself downwards from -1 so that
   * it can never collide with a cycling alert either.
   */
  id: number;
  perchIndex: number;
  alertIndex: number;
  /** Playing its exit; still mounted until that animation has run. */
  leaving: boolean;
}

interface SkylineOptions {
  perches: readonly Perch[];
  /** How many alert labels there are to draw from. */
  alertCount: number;
  /**
   * The perches used for the still arrangement — see `still` below. Given in
   * the order the labels should sit on them.
   */
  resting: readonly string[];
}

interface SkylineAlerts<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  sightings: Sighting[];
  /**
   * The alerts are standing still: drawn once, going nowhere. The layer must
   * not put entrance, exit or idle animations on them.
   */
  still: boolean;
}

/** At most this many alerts up at once. */
const MAX_VISIBLE = 3;

/**
 * How far apart, in percent of the section's width, two lit perches have to be.
 *
 * The perches are packed closer than this on purpose — they follow the roofline,
 * and the roofline has clusters. This is what stops two alerts landing in one
 * cluster and reading as a single overlapping mess, without having to thin out
 * the list of places they can appear.
 */
const MIN_SEPARATION = 12;

/** How long an alert holds before it starts to leave, in milliseconds. */
const DWELL_MIN = 4200;
const DWELL_MAX = 6800;

/** The wait between one alert arriving and the next being attempted. */
const SPAWN_MIN = 1100;
const SPAWN_MAX = 2600;

/**
 * How long an alert stays mounted after it is told to go. `--animate-alert-out`
 * is the last of the three parts to finish — 450ms behind a 180ms delay — and
 * this is that total with a frame in hand. Anything shorter unmounts an alert
 * mid-fade, which is the one way this effect can look broken rather than merely
 * abrupt.
 */
const EXIT_MS = 650;

/** A float in [min, max). */
function between(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pickIndex(candidates: number[]): number | undefined {
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * The arrangement shown when the alerts are not cycling: one label per named
 * perch, spread across the skyline rather than clustered, so the section still
 * reads as a monitored city rather than as an empty photograph.
 */
function restingSightings({
  perches,
  alertCount,
  resting,
}: SkylineOptions): Sighting[] {
  return resting
    .map((key) => perches.findIndex((perch) => perch.key === key))
    .filter((perchIndex) => perchIndex >= 0)
    .slice(0, alertCount)
    .map((perchIndex, index) => ({
      id: -1 - index,
      perchIndex,
      alertIndex: index,
      leaving: false,
    }));
}

/**
 * Cycles the agent alerts across the skyline: a random label on a random
 * building, at random intervals, two or three up at a time.
 *
 * The alternative — the same four alerts pinned to the same four spots — is what
 * this replaces. Made to move, a fixed arrangement reads as a carousel, because
 * the eye learns the four positions within one cycle and then just watches them
 * blink. Drawing both the place and the label out of a hat each time is what
 * makes it read as agents finding things.
 *
 * Two rules keep the randomness from looking like noise: no two alerts up at
 * once are within `MIN_SEPARATION` of each other, and no label is up twice.
 *
 * Nothing runs until the section is on screen. A reader who has asked for
 * reduced motion, and a viewport too narrow for this layer to be drawn at all,
 * both get the still arrangement and no timers — for the first, an ornament
 * that never stops is exactly what the preference is asking us not to play.
 */
export function useSkylineAlerts<T extends HTMLElement>(
  options: SkylineOptions,
): SkylineAlerts<T> {
  const { perches, alertCount } = options;
  const ref = useRef<T>(null);

  // Below `lg` the layer is not drawn at all, so there is nothing to animate.
  const wide = useMediaQuery("(min-width: 64rem)");
  const calm = useMediaQuery("(prefers-reduced-motion: reduce)");
  const animates = wide && !calm;

  const [onScreen, setOnScreen] = useState(false);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  /*
   * The scheduler reads the alerts that are up to decide what may appear next,
   * and it does that from a timeout rather than from a render. Reading them off
   * state would close over whatever was up when the effect last ran; picking
   * inside a state updater would put a `Math.random()` in it, which is not a
   * pure update and is run twice under StrictMode. So the ref is the copy the
   * scheduler works from, and state is the copy React renders.
   */
  const sightingsRef = useRef<Sighting[]>([]);
  /*
   * Outside the scheduler effect on purpose. Scrolling away and back tears the
   * effect down and sets it up again, and a counter that restarted at 0 would
   * hand the first alert of the new visit a key the last visit had already
   * used — React would keep that element rather than mount a new one, and the
   * alert would arrive with no entrance at all.
   */
  const nextIdRef = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        setOnScreen(entries.some((entry) => entry.isIntersecting));
      },
      /*
       * The section is nearly a screen and a half tall and the alerts sit in
       * its middle third, so this fires long before any of them is in view.
       * That is the point: the switch from the still arrangement to the moving
       * one happens while the whole layer is still below the fold.
       */
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!animates || !onScreen) return;

    const timers = new Set<number>();

    const after = (ms: number, run: () => void) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        run();
      }, ms);
      timers.add(timer);
    };

    const commit = (next: Sighting[]) => {
      sightingsRef.current = next;
      setSightings(next);
    };

    const retire = (id: number) => {
      commit(
        sightingsRef.current.map((sighting) =>
          sighting.id === id ? { ...sighting, leaving: true } : sighting,
        ),
      );

      after(EXIT_MS, () => {
        commit(sightingsRef.current.filter((sighting) => sighting.id !== id));
      });
    };

    const freePerches = (lit: Sighting[]): number[] => {
      const taken = lit.map((sighting) => perches[sighting.perchIndex].left);

      return perches
        .map((_, index) => index)
        .filter((index) =>
          taken.every(
            (left) => Math.abs(left - perches[index].left) >= MIN_SEPARATION,
          ),
        );
    };

    const freeAlerts = (lit: Sighting[]): number[] =>
      Array.from({ length: alertCount }, (_, index) => index).filter(
        (index) => !lit.some((sighting) => sighting.alertIndex === index),
      );

    const spawn = () => {
      const lit = sightingsRef.current;

      if (lit.length < MAX_VISIBLE) {
        const perchIndex = pickIndex(freePerches(lit));
        const alertIndex = pickIndex(freeAlerts(lit));

        if (perchIndex !== undefined && alertIndex !== undefined) {
          const id = nextIdRef.current++;
          commit([...lit, { id, perchIndex, alertIndex, leaving: false }]);
          after(between(DWELL_MIN, DWELL_MAX), () => {
            retire(id);
          });
        }
      }

      after(between(SPAWN_MIN, SPAWN_MAX), spawn);
    };

    /*
     * The first alert lands immediately rather than after a first interval, so
     * the skyline has something on it by the time the reader has scrolled the
     * middle of the section into view. It still goes through a timer: the
     * scheduler's whole job is setting state, and the effect body is not a
     * place to do that.
     */
    after(0, spawn);

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      timers.clear();
      // Only the scheduler's own copy. Clearing the rendered one would be a
      // state update from a cleanup, and there is nothing to clear anyway —
      // leaving the section swaps the layer back to the still arrangement.
      sightingsRef.current = [];
    };
  }, [animates, onScreen, perches, alertCount]);

  if (!animates || !onScreen) {
    return { ref, sightings: restingSightings(options), still: true };
  }

  return { ref, sightings, still: false };
}
