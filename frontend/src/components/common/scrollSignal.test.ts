import { describe, expect, it } from "vitest";
import {
  crossingState,
  headAlpha,
  placeSparks,
  sparkAlpha,
  trailProgress,
} from "@/components/common/scrollSignal";

const VIEWPORT = 1000;

const quiet = {
  lit: 0,
  swell: 0,
  spread: 0,
  spreadHead: 0,
  pulse: 0,
  ring: 0,
  edge: 0,
};

describe("crossingState", () => {
  it("is quiet while the front is still well above the crossing", () => {
    expect(crossingState(-400, VIEWPORT, false)).toEqual(quiet);
  });

  it("wakes the diamond before the front arrives and nothing else", () => {
    const state = crossingState(-10, VIEWPORT, false);

    expect(state.lit).toBeGreaterThan(0);
    expect(state.lit).toBeLessThan(1);
    expect(state.swell).toBe(state.lit);
    expect(state.spread).toBe(0);
    expect(state.pulse).toBe(0);
    expect(state.ring).toBe(0);
  });

  it("lights the diamond fully as the front lands", () => {
    expect(crossingState(0, VIEWPORT, false).lit).toBe(1);
  });

  it("runs the rule, releases the ring and settles once the front is well past", () => {
    const state = crossingState(400, VIEWPORT, false);

    // The ring has fully expanded (`pulse` 1) and is therefore gone (`ring` 0).
    expect(state).toEqual({ ...quiet, lit: 1, spread: 1, pulse: 1 });
  });

  it("runs the rule outward monotonically with the scroll", () => {
    let previous = 0;

    for (let distance = 0; distance <= 300; distance += 10) {
      const { spread } = crossingState(distance, VIEWPORT, false);

      expect(spread).toBeGreaterThanOrEqual(previous);
      previous = spread;
    }
  });

  it("shows the fronts only while there is rule left to run", () => {
    expect(crossingState(0, VIEWPORT, false).spreadHead).toBe(0);
    expect(crossingState(60, VIEWPORT, false).spreadHead).toBeGreaterThan(0);
    expect(crossingState(1000, VIEWPORT, false).spreadHead).toBe(0);
  });

  it("swells on arrival and then returns to rest", () => {
    const arriving = crossingState(5, VIEWPORT, false).swell;
    const settled = crossingState(200, VIEWPORT, false).swell;

    expect(arriving).toBeGreaterThan(0.9);
    expect(settled).toBe(0);
  });

  it("releases one ring that expands as it fades", () => {
    const early = crossingState(20, VIEWPORT, false);
    const late = crossingState(120, VIEWPORT, false);

    expect(late.pulse).toBeGreaterThan(early.pulse);
    expect(late.ring).toBeLessThan(early.ring);
    expect(crossingState(1000, VIEWPORT, false).ring).toBe(0);
  });

  it("paces the arrival by the viewport rather than by pixels", () => {
    const phone = crossingState(60, 600, false);
    const desktop = crossingState(60, 1200, false);

    expect(phone.spread).toBeGreaterThan(desktop.spread);
  });

  it("is the same picture for the same position, in either direction", () => {
    expect(crossingState(80, VIEWPORT, false)).toEqual(
      crossingState(80, VIEWPORT, false),
    );
  });

  it("has only two states under reduced motion and never pulses", () => {
    expect(crossingState(-1, VIEWPORT, true)).toEqual(quiet);
    expect(crossingState(0, VIEWPORT, true)).toEqual({
      ...quiet,
      lit: 1,
      spread: 1,
    });
    expect(crossingState(40, VIEWPORT, true)).toEqual(
      crossingState(4000, VIEWPORT, true),
    );
  });
});

describe("trailProgress", () => {
  const crossings = [0, 300, 700, 1000];

  it("slides with the front", () => {
    expect(trailProgress(-50, 1000, crossings, false)).toBe(0);
    expect(trailProgress(250, 1000, crossings, false)).toBe(0.25);
    expect(trailProgress(1200, 1000, crossings, false)).toBe(1);
  });

  it("steps between crossings under reduced motion", () => {
    expect(trailProgress(250, 1000, crossings, true)).toBe(0);
    expect(trailProgress(300, 1000, crossings, true)).toBe(0.3);
    expect(trailProgress(699, 1000, crossings, true)).toBe(0.3);
    expect(trailProgress(1200, 1000, crossings, true)).toBe(1);
  });

  it("guards a collapsed grid", () => {
    expect(trailProgress(100, 0, [], false)).toBe(0);
  });
});

describe("headAlpha", () => {
  it("is hidden off either end of the rule and full in the middle", () => {
    expect(headAlpha(-1, 1000, VIEWPORT)).toBe(0);
    expect(headAlpha(0, 1000, VIEWPORT)).toBe(0);
    expect(headAlpha(500, 1000, VIEWPORT)).toBe(1);
    expect(headAlpha(1000, 1000, VIEWPORT)).toBe(0);
  });

  it("fades in from the first crossing", () => {
    const early = headAlpha(10, 1000, VIEWPORT);

    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(1);
  });
});

describe("sparkAlpha", () => {
  it("shows a branch only while the head is passing it", () => {
    expect(sparkAlpha(-100, VIEWPORT)).toBe(0);
    expect(sparkAlpha(10, VIEWPORT)).toBeGreaterThan(0);
    expect(sparkAlpha(100, VIEWPORT)).toBe(0);
  });

  it("never reaches full strength", () => {
    let peak = 0;
    for (let distance = -20; distance <= 60; distance += 1) {
      peak = Math.max(peak, sparkAlpha(distance, VIEWPORT));
    }

    expect(peak).toBeLessThan(1);
  });
});

describe("placeSparks", () => {
  const crossings = [0.5, 480, 1020, 1652.5];

  it("keeps clear of every crossing", () => {
    for (const spark of placeSparks(1653, crossings, 16)) {
      for (const crossing of crossings) {
        expect(Math.abs(spark.y - crossing)).toBeGreaterThanOrEqual(40);
      }
    }
  });

  it("is sparse and deterministic", () => {
    const sparks = placeSparks(1653, crossings, 16);

    expect(sparks.length).toBeGreaterThan(5);
    expect(sparks.length).toBeLessThan(25);
    expect(sparks).toEqual(placeSparks(1653, crossings, 16));

    for (let index = 1; index < sparks.length; index += 1) {
      expect(sparks[index].y - sparks[index - 1].y).toBeGreaterThanOrEqual(80);
    }
  });

  it("returns nothing for a grid with no height", () => {
    expect(placeSparks(0, [], 16)).toEqual([]);
  });
});
