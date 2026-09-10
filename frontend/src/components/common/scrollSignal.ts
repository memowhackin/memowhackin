/*
 * The arithmetic behind `ScrollSignal`: every value the overlay paints, as a
 * pure function of where the scan's front is. Nothing here reads a clock. The
 * same scroll position always yields the same picture, which is what lets the
 * signal run backwards when the reader does and stand perfectly still when
 * they stop — there is no cycle for it to keep playing.
 *
 * Distances arrive in pixels and the timings are held as shares of the
 * viewport height, so an arrival at a crossing plays out over the same
 * fraction of a screen on a phone as on a desktop, rather than over a fixed
 * count of pixels that is a flick on one and a crawl on the other.
 */

/**
 * Where in the viewport the front sits, as a share of its height. Half way
 * down — the line the process rail fills to — because that is where the
 * reader's eye already is, so an arrival happens in front of them rather than
 * at an edge they are not looking at.
 */
export const FOCUS_LINE = 0.5;

/** The diamond wakes this far ahead of the front: it reacts first, as a sensor would. */
const LEAD = 0.035;
/** …and its swell settles back over this much scroll once the front has passed. */
const SWELL = 0.11;
/** The rule lights out to both of its ends over this much scroll. */
const SPREAD = 0.24;
/** The ring released on arrival has expanded and faded after this much. */
const PULSE = 0.17;
/** The light along the row's picture peaks here and is gone by the end. */
const EDGE_PEAK = 0.06;
const EDGE_END = 0.3;
/** The head emerges from the first crossing and sinks into the last over this. */
const FRONT_FADE = 0.04;
/** A branch is visible while the front is within this of it. */
const SPARK_REACH = 0.05;

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/** Smoothstep: eases both ends, so nothing arrives or leaves with a kink. */
function smooth(value: number): number {
  const u = clamp01(value);
  return u * u * (3 - 2 * u);
}

/** 0 at `from`, 1 at `to`, eased between. */
function ramp(value: number, from: number, to: number): number {
  return smooth((value - from) / (to - from));
}

/** Fast out of the gate and decelerating — the shape of something that travels. */
function travel(value: number): number {
  const u = clamp01(value);
  return 1 - (1 - u) * (1 - u);
}

/**
 * The state of one crossing, every value 0–1, all of them functions of how
 * far past the crossing the front is.
 */
export interface CrossingState {
  /** The diamond's brightness: 0 quiet, 1 once the scan has reached it. */
  lit: number;
  /** Its swell on arrival: up as the front lands, back to 0 as it settles. */
  swell: number;
  /** How far along the rule the energy has run outward from the centre. */
  spread: number;
  /** The visibility of the two fronts running the rule. */
  spreadHead: number;
  /** The ring released on arrival: 0 unreleased, 1 fully expanded. */
  pulse: number;
  /** The ring's strength — 0 both before release and once it has faded. */
  ring: number;
  /** The light along the row's picture: peaks just after arrival, then goes. */
  edge: number;
}

/**
 * @param distance how far the front is past the crossing, in pixels; negative
 *   while it is still above it.
 * @param viewport the viewport height, which sets the pace of everything.
 * @param reduced under `prefers-reduced-motion` a crossing has two states —
 *   not yet reached, reached — and nothing in between: no swell, no ring, no
 *   front running the rule. What is left is where the reader is, held still.
 */
export function crossingState(
  distance: number,
  viewport: number,
  reduced: boolean,
): CrossingState {
  if (reduced) {
    const passed = distance >= 0 ? 1 : 0;
    return {
      lit: passed,
      swell: 0,
      spread: passed,
      spreadHead: 0,
      pulse: 0,
      ring: 0,
      edge: 0,
    };
  }

  const d = distance / viewport;
  const wake = ramp(d, -LEAD, 0);
  const spread = travel(d / SPREAD);
  const pulse = travel(d / PULSE);

  return {
    lit: wake,
    swell: d < 0 ? wake : 1 - ramp(d, 0, SWELL),
    spread,
    // Shown while there is somewhere left to run: in over the first tenth of
    // the rule, out over the last third so it dissolves at the edge rather
    // than stopping dead on it.
    spreadHead:
      spread <= 0 || spread >= 1
        ? 0
        : Math.min(ramp(spread, 0, 0.1), 1 - ramp(spread, 0.7, 1)),
    pulse,
    ring: pulse <= 0 || pulse >= 1 ? 0 : 1 - pulse,
    edge:
      d < EDGE_PEAK ? ramp(d, 0, EDGE_PEAK) : 1 - ramp(d, EDGE_PEAK, EDGE_END),
  };
}

/**
 * How much of the centre rule is lit, 0–1 from the top.
 *
 * Under reduced motion the trail runs to the last crossing the reader has
 * passed and no further, so it steps from station to station instead of
 * sliding — a reading of where they are, not a thing that moves.
 */
export function trailProgress(
  front: number,
  height: number,
  crossings: readonly number[],
  reduced: boolean,
): number {
  if (height <= 0) return 0;
  if (!reduced) return clamp01(front / height);

  let reached = 0;
  for (const y of crossings) {
    if (y <= front) reached = y;
  }
  return clamp01(reached / height);
}

/**
 * The head's visibility: it emerges from the first crossing and sinks into
 * the last, and is nowhere at all while the section is off the scan.
 */
export function headAlpha(
  front: number,
  height: number,
  viewport: number,
): number {
  if (front <= 0 || front >= height) return 0;

  const fade = viewport * FRONT_FADE;
  return Math.min(ramp(front, 0, fade), 1 - ramp(front, height - fade, height));
}

/**
 * A branch's visibility against how far the front is past it. It shows a
 * little ahead of the front — a discharge reaching out before the head
 * arrives — and is gone shortly behind it.
 */
export function sparkAlpha(distance: number, viewport: number): number {
  const reach = viewport * SPARK_REACH;
  const u = (distance + reach * 0.25) / (reach * 1.25);
  if (u <= 0 || u >= 1) return 0;

  return 4 * u * (1 - u) * 0.9;
}

/** One of the tiny branches the head throws off as it travels the rule. */
export interface Spark {
  /** Where along the rule it roots, in pixels from the top. */
  y: number;
  /** Which side of the rule it reaches out to. */
  side: 1 | -1;
  /** How far it reaches, in pixels. */
  length: number;
}

/*
 * A deterministic 0–1 from an integer, the same hash the lattice band uses
 * for the same reason: the branches have to look scattered, but a fresh set
 * on every measurement would have them jump about whenever a row reflowed.
 */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Where the branches root along a rule of the given height.
 *
 * Sparse by design — five to nine rems apart — and never within a couple of
 * rems of a crossing, which has an arrival of its own to play. `unit` is a
 * rem in pixels, so the spacing scales with the reader's type size rather
 * than sitting at a fixed pixel pitch.
 */
export function placeSparks(
  height: number,
  crossings: readonly number[],
  unit: number,
): readonly Spark[] {
  if (unit <= 0 || height <= 0) return [];

  const sparks: Spark[] = [];
  const clearance = unit * 2.5;
  let y = unit * 3;
  let seed = 1;

  while (y < height - unit * 2) {
    const nearCrossing = crossings.some(
      (crossing) => Math.abs(crossing - y) < clearance,
    );
    if (!nearCrossing) {
      sparks.push({
        y,
        side: noise(seed + 31) < 0.5 ? -1 : 1,
        length: unit * (0.5 + noise(seed + 57) * 0.45),
      });
    }

    y += unit * (5 + noise(seed) * 4);
    seed += 1;
  }

  return sparks;
}
