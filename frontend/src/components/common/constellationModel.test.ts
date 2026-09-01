import { describe, expect, it } from "vitest";
import {
  buildConstellation,
  LINK_REACH,
  linkConstellation,
  stepConstellation,
  type ConstellationLink,
} from "@/components/common/constellationModel";

/** A fixed sequence standing in for `Math.random`, so a step is repeatable. */
function fixedRandom(): () => number {
  let state = 0.137;
  return () => {
    state = (state * 9301 + 0.49297) % 1;
    return state;
  };
}

describe("buildConstellation", () => {
  it("draws the same figure from the same seed", () => {
    const first = buildConstellation({ count: 200, seed: 7 });
    const second = buildConstellation({ count: 200, seed: 7 });

    expect(
      first.nodes.map((node) => [node.x, node.y, node.vx, node.vy]),
    ).toEqual(second.nodes.map((node) => [node.x, node.y, node.vx, node.vy]));
  });

  it("keeps every node inside the mask and off the edges", () => {
    const { nodes } = buildConstellation({ count: 400 });

    for (const node of nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0.02);
      expect(node.x).toBeLessThanOrEqual(0.98);
      expect(node.y).toBeGreaterThanOrEqual(0.02);
      expect(node.y).toBeLessThanOrEqual(0.98);
      expect(Math.hypot(node.x - 0.5, node.y - 0.5)).toBeLessThanOrEqual(0.49);
      expect(node.cx).toBe(node.x);
      expect(node.cy).toBe(node.y);
    }
  });

  it("weights the field to the left of centre", () => {
    const { nodes } = buildConstellation({ count: 400 });
    const meanX = nodes.reduce((sum, node) => sum + node.x, 0) / nodes.length;

    expect(meanX).toBeLessThan(0.47);
  });

  it("gives every node a velocity at its own speed", () => {
    const { nodes } = buildConstellation({ count: 100 });

    for (const node of nodes) {
      expect(Math.hypot(node.vx, node.vy)).toBeCloseTo(node.speed, 10);
      expect(node.speed).toBeGreaterThan(0);
    }
  });
});

describe("stepConstellation", () => {
  it("moves every node while holding it near home", () => {
    const { nodes } = buildConstellation({ count: 300 });
    const random = fixedRandom();

    // A minute at sixty frames a second.
    for (let tick = 0; tick < 3600; tick += 1) {
      stepConstellation(nodes, 1 / 60, random);
    }

    let moved = 0;
    let speedSum = 0;
    for (const node of nodes) {
      const away = Math.hypot(node.cx - node.x, node.cy - node.y);
      if (away > 0.001) moved += 1;
      speedSum += Math.hypot(node.vx, node.vy);
      // The spring's whole purpose: a minute in, nobody has left the body.
      expect(away).toBeLessThan(0.15);
    }
    // A node passing back through home at the instant measured is allowed;
    // a field that has settled is not.
    expect(moved).toBeGreaterThan(nodes.length * 0.9);
    expect(speedSum / nodes.length).toBeGreaterThan(0.004);
  });

  it("bounces off the walls", () => {
    const { nodes } = buildConstellation({ count: 1 });
    const node = nodes[0];
    if (node === undefined) throw new Error("no node");

    node.cx = 0.995;
    node.vx = 0.05;
    stepConstellation(nodes, 0.1, fixedRandom());

    expect(node.cx).toBeLessThanOrEqual(0.99);
    expect(node.vx).toBeLessThan(0);
  });
});

describe("linkConstellation", () => {
  it("leaves no node unconnected and draws no line twice", () => {
    const { nodes } = buildConstellation({ count: 300 });
    const links: ConstellationLink[] = [];
    linkConstellation(nodes, links);

    const joined = new Set(links.flatMap((link) => [link.from, link.to]));
    expect(joined.size).toBe(nodes.length);

    const keys = links.map((link) => {
      expect(link.from).not.toBe(link.to);
      const a = nodes.indexOf(link.from);
      const b = nodes.indexOf(link.to);
      return `${String(Math.min(a, b))}:${String(Math.max(a, b))}`;
    });
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("grades each line by how close its ends are", () => {
    const { nodes } = buildConstellation({ count: 300 });
    const links: ConstellationLink[] = [];
    linkConstellation(nodes, links);

    for (const link of links) {
      const distance = Math.hypot(
        link.from.cx - link.to.cx,
        link.from.cy - link.to.cy,
      );
      expect(link.closeness).toBeGreaterThanOrEqual(0);
      expect(link.closeness).toBeLessThanOrEqual(1);
      if (distance <= LINK_REACH) {
        expect(link.closeness).toBeCloseTo(1 - distance / LINK_REACH, 10);
      } else {
        // A straggler's long line back to the body.
        expect(link.closeness).toBe(0);
      }
    }
  });

  it("recomputes from the current positions, reusing the array", () => {
    const { nodes } = buildConstellation({ count: 120 });
    const links: ConstellationLink[] = [];
    linkConstellation(nodes, links);
    const before = links.length;

    stepConstellation(nodes, 5, fixedRandom());
    linkConstellation(nodes, links);

    expect(links.length).toBeGreaterThan(0);
    expect(Math.abs(links.length - before)).toBeLessThan(before);
  });
});
