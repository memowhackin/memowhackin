/*
 * The constellation as data, and the physics that moves it.
 *
 * The composition is derived here, once, from a seed. The rule is the same one
 * the exposure graph follows: a figure that reshuffles on every load is a
 * figure nobody can refer to, so where the nodes live — their home positions —
 * is fixed, and two visitors see the same picture.
 *
 * The shape follows the frame's artwork rather than a uniform spray: a dense
 * body sitting left of centre, a wider halo around it, and a handful of
 * stragglers far out on the right, each hanging off one long line back to the
 * body. That off-centre weight is the composition — a field that is equally
 * dense everywhere reads as wallpaper.
 *
 * Every node carries its own velocity and is stepped every frame. Left entirely
 * free, that would undo the composition: a few hundred random walkers spread
 * out until the field is even, and within two minutes on the page the dense
 * body would have thinned into the corners. So each node is also held to its
 * home by a weak spring. It still travels under its own velocity, drifts a
 * little further each time the jitter nudges it, and turns around when the
 * spring wins — a slow wander around where it belongs, rather than a flight.
 *
 * The lines are recomputed every frame from wherever the nodes are: each joins
 * its nearest few neighbours in reach, so as nodes drift apart a line lets go
 * and another takes up. Positions are fractions of the box, so the model
 * survives a resize without being rebuilt, and the renderer scales them at
 * paint time.
 */

export interface ConstellationNode {
  /** Home position, as fractions of the box. Fixed for the life of the model. */
  x: number;
  y: number;
  /** Where the node is now, as fractions of the box. */
  cx: number;
  cy: number;
  /** Velocity, in fractions of the box per second. */
  vx: number;
  vy: number;
  /** The speed this node wanders at; the step keeps its velocity near it. */
  speed: number;
  /** Distance from the viewer, 0 far to 1 near: how far the node shifts under parallax. */
  depth: number;
  /** Resting opacity, and the slow variation on top of it. */
  alpha: number;
  twinkle: number;
  twinkleSpeed: number;
  twinklePhase: number;
  /** Size multiplier; a few nodes are drawn larger to give the field grain. */
  size: number;
  /**
   * Where the node is this frame, in pixels. Scratch space written by the
   * renderer so the lines can be drawn from the same coordinates as the nodes
   * without a second pass.
   */
  px: number;
  py: number;
}

export interface ConstellationLink {
  from: ConstellationNode;
  to: ConstellationNode;
  /**
   * 1 for two nodes touching, 0 at the reach of a link and for the long lines
   * out to the stragglers. The renderer strokes nearer links brighter.
   */
  closeness: number;
}

export interface ConstellationModel {
  nodes: ConstellationNode[];
}

export interface ConstellationOptions {
  count: number;
  seed?: number;
}

/** Nodes further than this from the box's centre are outside the mask anyway. */
const FIELD_RADIUS = 0.49;

/** How far a node looks for neighbours to join. Anything else only reaches a straggler. */
export const LINK_REACH = 0.07;

/** How many neighbours a node joins to, when enough are in reach. */
const NEIGHBOURS = 3;

/**
 * The wander is a damped spring under random kicks — a Langevin walk about
 * home. The spring sets the swing's period (about ten seconds), the damping
 * bleeds off what the kicks put in, and the kicks are sized per node so that
 * its speed averages out at its own `speed`: the stationary velocity variance
 * of such a walk is kick² / (24 · damping) per axis, and `KICK` is that solved
 * for a root-mean-square speed of 1.
 */
const SPRING = 0.35;
const DAMPING = 0.2;
const KICK = Math.sqrt(12 * DAMPING);

/** The box the nodes bounce inside, as fractions. */
const WALL = 0.01;

/**
 * A small, fast, seedable generator (mulberry32). `Math.random` cannot be
 * seeded, and the whole point is that the same seed draws the same figure.
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A standard normal draw, by Box–Muller. */
function gaussian(random: () => number): number {
  let u = 0;
  while (u === 0) u = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

/**
 * One home position. Three populations, mixed: the dense body, its halo, and
 * the stragglers. Sampled by rejection so that no node lands where the mask
 * has already faded the field to nothing — a node there costs a draw call and
 * shows nobody anything.
 */
function samplePosition(random: () => number): { x: number; y: number } {
  for (;;) {
    const roll = random();
    let x: number;
    let y: number;

    if (roll < 0.6) {
      x = 0.36 + gaussian(random) * 0.1;
      y = 0.5 + gaussian(random) * 0.15;
    } else if (roll < 0.92) {
      x = 0.4 + gaussian(random) * 0.22;
      y = 0.5 + gaussian(random) * 0.25;
    } else {
      x = 0.55 + random() * 0.43;
      y = 0.1 + random() * 0.8;
    }

    if (x < 0.02 || x > 0.98 || y < 0.02 || y > 0.98) continue;
    if (Math.hypot(x - 0.5, y - 0.5) > FIELD_RADIUS) continue;
    return { x, y };
  }
}

export function buildConstellation(
  options: ConstellationOptions,
): ConstellationModel {
  const random = mulberry32(options.seed ?? 1337);
  const nodes: ConstellationNode[] = [];

  for (let index = 0; index < options.count; index += 1) {
    const { x, y } = samplePosition(random);
    const depth = random();
    // Slow. At a box 900px wide the liveliest node averages eighteen pixels
    // a second; the field should be seen to be alive, not seen to be busy.
    const speed = 0.008 + random() * 0.012;
    const heading = random() * Math.PI * 2;
    nodes.push({
      x,
      y,
      cx: x,
      cy: y,
      vx: Math.cos(heading) * speed,
      vy: Math.sin(heading) * speed,
      speed,
      depth,
      // The near nodes read slightly brighter, which is the only depth cue a
      // flat field has apart from how far each one slides under the pointer.
      alpha: Math.min(0.5 + random() * 0.45 + depth * 0.08, 1),
      twinkle: 0.06 + random() * 0.1,
      twinkleSpeed: 0.25 + random() * 0.55,
      twinklePhase: random() * Math.PI * 2,
      size: random() < 0.08 ? 1.5 : 0.85 + random() * 0.35,
      px: 0,
      py: 0,
    });
  }

  return { nodes };
}

/**
 * Advances every node by `dt` seconds.
 *
 * Velocity first, then position. The spring pulls towards home, the damping
 * pulls towards rest, and the kick is a random nudge scaled by the square root
 * of the step — which is what makes the walk the same walk at thirty frames a
 * second as at a hundred and twenty. The walls are a safety net: with the
 * spring holding, a node all but never reaches one.
 */
export function stepConstellation(
  nodes: ConstellationNode[],
  dt: number,
  random: () => number = Math.random,
): void {
  const root = Math.sqrt(dt);

  for (const node of nodes) {
    const kick = node.speed * KICK * root;
    node.vx +=
      ((node.x - node.cx) * SPRING - node.vx * DAMPING) * dt +
      (random() - 0.5) * kick;
    node.vy +=
      ((node.y - node.cy) * SPRING - node.vy * DAMPING) * dt +
      (random() - 0.5) * kick;

    node.cx += node.vx * dt;
    node.cy += node.vy * dt;

    if (node.cx < WALL) {
      node.cx = WALL;
      node.vx = Math.abs(node.vx);
    } else if (node.cx > 1 - WALL) {
      node.cx = 1 - WALL;
      node.vx = -Math.abs(node.vx);
    }
    if (node.cy < WALL) {
      node.cy = WALL;
      node.vy = Math.abs(node.vy);
    } else if (node.cy > 1 - WALL) {
      node.cy = 1 - WALL;
      node.vy = -Math.abs(node.vy);
    }
  }
}

interface Candidate {
  index: number;
  distance: number;
}

/**
 * Recomputes the lines from the nodes' current positions, into `links`.
 *
 * Each node joins its nearest few neighbours within reach; a node with none in
 * reach — a straggler — joins the single nearest one however far that is, so
 * nothing floats free. A mutual pair is kept once.
 *
 * Neighbours are found through a grid of cells one reach wide, so a node only
 * measures against the nodes in the nine cells around it rather than the whole
 * field. At six hundred nodes the difference is thirty thousand distances a
 * frame against three hundred and sixty thousand.
 */
export function linkConstellation(
  nodes: ConstellationNode[],
  links: ConstellationLink[],
): void {
  links.length = 0;

  const columns = Math.ceil(1 / LINK_REACH) + 1;
  const cells = new Map<number, number[]>();
  const cellOf = (node: ConstellationNode) =>
    Math.floor(node.cx / LINK_REACH) * columns +
    Math.floor(node.cy / LINK_REACH);

  nodes.forEach((node, index) => {
    const key = cellOf(node);
    const cell = cells.get(key);
    if (cell === undefined) cells.set(key, [index]);
    else cell.push(index);
  });

  const seen = new Set<number>();
  const candidates: Candidate[] = [];

  nodes.forEach((node, index) => {
    candidates.length = 0;
    const column = Math.floor(node.cx / LINK_REACH);
    const row = Math.floor(node.cy / LINK_REACH);

    for (let dc = -1; dc <= 1; dc += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        const cell = cells.get((column + dc) * columns + (row + dr));
        if (cell === undefined) continue;
        for (const otherIndex of cell) {
          if (otherIndex === index) continue;
          const other = nodes[otherIndex];
          if (other === undefined) continue;
          const distance = Math.hypot(other.cx - node.cx, other.cy - node.cy);
          if (distance <= LINK_REACH) {
            candidates.push({ index: otherIndex, distance });
          }
        }
      }
    }

    if (candidates.length === 0) {
      // A straggler: the whole field, for the one nearest node.
      let nearest = -1;
      let nearestDistance = Infinity;
      nodes.forEach((other, otherIndex) => {
        if (otherIndex === index) return;
        const distance = Math.hypot(other.cx - node.cx, other.cy - node.cy);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = otherIndex;
        }
      });
      if (nearest !== -1) {
        candidates.push({ index: nearest, distance: nearestDistance });
      }
    } else if (candidates.length > NEIGHBOURS) {
      candidates.sort((a, b) => a.distance - b.distance);
      candidates.length = NEIGHBOURS;
    }

    for (const candidate of candidates) {
      const key =
        Math.min(index, candidate.index) * nodes.length +
        Math.max(index, candidate.index);
      if (seen.has(key)) continue;
      seen.add(key);
      const target = nodes[candidate.index];
      if (target === undefined) continue;
      links.push({
        from: node,
        to: target,
        closeness: Math.max(0, 1 - candidate.distance / LINK_REACH),
      });
    }
  });
}
