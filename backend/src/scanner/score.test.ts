import { describe, expect, it } from "vitest";
import { surfaceScore } from "./score.js";

/*
 * The headline number. It is the first thing a reader sees and the thing they
 * will quote, so the properties that matter are ordering and stability rather
 * than any particular value.
 */

const finding = (severity: string, confidence = "confirmed") => ({
  id: `${severity}-${confidence}`,
  category: "headers",
  severity,
  confidence,
});

describe("surfaceScore", () => {
  it("gives a clean surface full marks", () => {
    expect(surfaceScore([]).value).toBe(100);
    expect(surfaceScore([]).band).toBe("strong");
  });

  it("costs more for a worse finding", () => {
    const high = surfaceScore([finding("high")]).value;
    const medium = surfaceScore([finding("medium")]).value;
    const low = surfaceScore([finding("low")]).value;

    expect(high).toBeLessThan(medium);
    expect(medium).toBeLessThan(low);
    expect(low).toBeLessThan(100);
  });

  it("discounts what it is not sure about", () => {
    // A pile of maybes must not sink a score, or the number becomes a measure
    // of how chatty the scanner was.
    const confirmed = surfaceScore([finding("high", "confirmed")]).value;
    const possible = surfaceScore([finding("high", "possible")]).value;
    expect(possible).toBeGreaterThan(confirmed);

    const manyMaybes = surfaceScore(
      Array.from({ length: 8 }, (_unused, i) => ({
        ...finding("medium", "possible"),
        id: `m${String(i)}`,
      })),
    );
    expect(manyMaybes.value).toBeGreaterThan(70);
  });

  it("tapers, so a large site is not automatically zero", () => {
    const twenty = surfaceScore(
      Array.from({ length: 20 }, (_unused, i) => ({
        ...finding("medium"),
        id: `m${String(i)}`,
      })),
    );
    expect(twenty.value).toBeGreaterThan(0);
    // But it is still clearly worse than a handful.
    expect(twenty.value).toBeLessThan(surfaceScore([finding("medium")]).value);
  });

  it("keeps one serious finding worse than many trivial ones", () => {
    const oneHigh = surfaceScore([finding("high")]).value;
    const tenLow = surfaceScore(
      Array.from({ length: 10 }, (_unused, i) => ({
        ...finding("low"),
        id: `l${String(i)}`,
      })),
    ).value;
    expect(oneHigh).toBeLessThan(tenLow);
  });

  it("is deterministic", () => {
    const set = [finding("high"), finding("medium"), finding("low")];
    expect(surfaceScore(set).value).toBe(
      surfaceScore([...set].reverse()).value,
    );
  });

  it("never leaves the 0..100 range", () => {
    const brutal = surfaceScore(
      Array.from({ length: 60 }, (_unused, i) => ({
        ...finding("high"),
        id: `h${String(i)}`,
      })),
    );
    expect(brutal.value).toBeGreaterThanOrEqual(0);
    expect(brutal.value).toBeLessThanOrEqual(100);
  });
});
