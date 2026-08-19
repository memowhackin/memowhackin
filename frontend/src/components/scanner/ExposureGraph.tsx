import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type {
  ExposureGraphModel,
  GraphNode,
} from "@/components/scanner/graphModel";

/*
 * The exposure constellation.
 *
 * One subject at the centre, the areas the scan covered on an inner orbit, and
 * everything found on an outer field: findings, hostnames, lookalike domains.
 * Read whole it is the shape of a company's public surface, which is the thing
 * a director wants to see and the thing a table of four sections hides.
 *
 * The layout is deliberate rather than decorative, and that is the whole
 * difference between this and a scatter of bubbles:
 *
 *   - Angle carries meaning. Each branch owns an angular sector sized by how
 *     much hangs off it, and its children sit inside that sector. Related
 *     things are therefore adjacent, and the connectors fan instead of
 *     crossing the figure.
 *   - Radius carries meaning. Depth from the subject is distance from the
 *     centre, so the eye reads outward as "further from you".
 *   - Weight carries meaning. Node size follows depth and fill follows
 *     severity, so the few things that matter are the few things that are
 *     bright, against a field that is mostly quiet.
 *
 * Nothing here is random. The small variation in radius that keeps the field
 * from looking like a dartboard is derived from a hash of each node's id, so
 * the same report always draws the same figure — a diagram that reshuffles on
 * every render is a diagram nobody can refer to in a meeting.
 *
 * The subject and the branches carry their name in the figure, set outside the
 * mark on the side away from the centre so a label never crosses a connector.
 * Leaves do not: at forty to a cluster they would collide at any size worth
 * reading, so they carry their name in the panel when selected and in the
 * lists further down the page. Every mark is a real focusable control with its
 * own accessible name.
 */

const VIEW = 1000;
const CENTRE = VIEW / 2;
const ORBIT_BRANCH = 215;
/* Leaves orbit their own branch, not the centre. See `layout`. */
const CLUSTER_MIN = 54;
const CLUSTER_MAX = 172;

interface Placed {
  node: GraphNode;
  x: number;
  y: number;
  radius: number;
  depth: 0 | 1 | 2;
  parent?: string;
}

/** Deterministic 0..1 from an id, for the jitter that keeps rings organic. */
function jitter(id: string): number {
  let hash = 2166136261;
  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

/** Node radius by depth. The subject is the anchor and reads largest. */
const SIZE: Record<0 | 1 | 2, number> = { 0: 22, 1: 15, 2: 6 };

/*
 * A glyph per node kind, drawn inside the mark at 24x24 and scaled to fit.
 *
 * These are the difference between a diagram and a scatter plot: a reader who
 * sees a globe at the centre and an envelope on one branch knows what the
 * figure is about before reading a single label. Each is chosen for what the
 * node *is* — a globe for the site, an envelope for mail, a certificate seal
 * for transport, a key for DNS — rather than for decoration, and none of them
 * is a shield, a padlock or a bug.
 *
 * Drawn as simple strokes rather than filled logos so they stay legible at
 * fifteen pixels and inherit their colour from the mark they sit in.
 */
const GLYPH: Record<string, string> = {
  // Globe: the site itself.
  subject:
    "M12 3a9 9 0 100 18 9 9 0 000-18M3 12h18M12 3c2.5 2.4 3.8 5.5 3.8 9S14.5 21 12 21c-2.5-2.4-3.8-5.5-3.8-9S9.5 3 12 3",
  // Envelope: anything to do with mail.
  email_authentication: "M3 6h18v12H3zM3 7l9 6 9-6",
  // Certificate seal and ribbon: transport and certificates.
  transport: "M12 3a5 5 0 100 10 5 5 0 000-10M9 13l-1 8 4-2 4 2-1-8",
  // Document with a fold: response headers.
  headers: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
  // Key: naming and who may answer for it.
  dns: "M15 9a4 4 0 10-4 4l-1 1H8v2H6v2H3v-3l7-7",
  // Open door: things reachable from outside.
  exposed_surface: "M4 3h9v18H4zM13 3l7 3v12l-7 3M10 12h.01",
  // Chip: what the site is built on.
  software_disclosure:
    "M8 8h8v8H8zM5 10V8h3M5 14v2h3M19 10V8h-3M19 14v2h-3M10 5H8v3M14 5h2v3M10 19H8v-3M14 19h2v-3",
  // Server rack: a host.
  network_indicator: "M3 5h18v6H3zM3 13h18v6H3zM7 8h.01M7 16h.01",
  // Two overlapping frames: a name pretending to be another.
  password_indicator: "M4 4h11v11H4zM9 9h11v11H9",
  data_category: "M4 4h11v11H4zM9 9h11v11H9",
  stealer_log: "M4 4h11v11H4zM9 9h11v11H9",
  source: "M3 5h18v6H3zM3 13h18v6H3zM7 8h.01M7 16h.01",
};

/** Which glyph a node draws, preferring the branch it represents. */
function glyphFor(node: GraphNode, depth: 0 | 1 | 2): string | undefined {
  if (depth === 0) return GLYPH.subject;
  if (depth === 2) return undefined; // Leaves are too small to carry one.
  const byId = node.id.replace(/^(category|branch)-/, "");
  return GLYPH[byId] ?? GLYPH[node.kind];
}

/**
 * Fill by sensitivity, with depth deciding how loud the quiet ones are.
 *
 * Only `high` gets the warm colour, and only ever as a fill on a small mark.
 * A field where a third of the nodes are red is a field where none of them
 * mean anything.
 */
function fillFor(node: GraphNode, depth: 0 | 1 | 2): string {
  if (depth === 0) return "fill-lavender";
  // A branch is a heading, not a verdict. Colouring it after its worst child
  // doubled every warm mark and left a third of the field alight.
  if (depth === 1) return "fill-indigo-bright";
  if (node.sensitivity === "high") return "fill-ember";
  return node.sensitivity === "medium" ? "fill-lavender/70" : "fill-indigo";
}

function layout(model: ExposureGraphModel): Placed[] {
  const root = model.nodes[0];
  if (root === undefined) return [];

  const childrenOf = (id: string) =>
    model.edges
      .filter((edge) => edge.from === id)
      .map((edge) => model.nodes.find((node) => node.id === edge.to))
      .filter((node): node is GraphNode => node !== undefined);

  const branches = childrenOf(root.id);
  const placed: Placed[] = [
    { node: root, x: CENTRE, y: CENTRE, radius: SIZE[0], depth: 0 },
  ];

  /*
   * Sectors are sized by the square root of what hangs off them.
   *
   * Straight proportion looked right on paper and wrong on screen: a branch
   * holding forty lookalikes against one holding two findings took nine
   * tenths of the circle, and the figure became a single peacock fan with a
   * few stragglers opposite. The root compresses that range — the large
   * branch still gets the most room, but the small ones keep enough of the
   * circle to read as part of the same object.
   */
  const weights = branches.map((entry) =>
    Math.sqrt(Math.max(childrenOf(entry.id).length, 1)),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  let cursor = -Math.PI / 2; // Start at twelve o'clock.

  branches.forEach((entry, index) => {
    const weight = weights[index] ?? 1;
    const span = (weight / total) * Math.PI * 2;
    const middle = cursor + span / 2;

    const branchX = CENTRE + Math.cos(middle) * ORBIT_BRANCH;
    const branchY = CENTRE + Math.sin(middle) * ORBIT_BRANCH;

    placed.push({
      node: entry,
      x: branchX,
      y: branchY,
      radius: SIZE[1],
      depth: 1,
      parent: root.id,
    });

    const leaves = childrenOf(entry.id);

    /*
     * Leaves orbit their own branch rather than a ring drawn round the whole
     * figure.
     *
     * On a global ring every child of a branch was a separate spoke from one
     * point out to the rim, so a branch with forty children drew forty long
     * near-parallel lines across half the diagram. Orbiting the parent instead
     * makes each branch a compact cluster with short connectors: the figure
     * gains the grain of a star field, related things sit visibly together,
     * and the number of long lines is the number of branches rather than the
     * number of findings.
     *
     * The cluster opens away from the centre, through an arc that widens with
     * the number of children, so it never folds back over the subject.
     */
    const outward = middle;
    /*
     * The arc widens with the count but stops well short of a half circle,
     * and the surplus goes into extra rings instead. Left to widen freely a
     * forty-node branch opened to 157 degrees and became a fan again; capped,
     * the same forty stack into six short rings and read as one patch of sky.
     */
    const arc = Math.min(0.5 + leaves.length * 0.03, 1.5);
    const perBand = Math.max(3, Math.ceil(Math.sqrt(leaves.length)));
    const bandCount = Math.max(Math.ceil(leaves.length / perBand), 1);
    const bandGap = (CLUSTER_MAX - CLUSTER_MIN) / Math.max(bandCount, 1);

    leaves.forEach((leafNode, position) => {
      const band = Math.floor(position / perBand);
      const slot = position % perBand;
      const inBand = Math.min(perBand, leaves.length - band * perBand);

      // Odd bands are offset half a slot, so rows interleave instead of
      // lining up into spokes of their own.
      const stagger = band % 2 === 0 ? 0 : 0.5;
      const spread =
        inBand === 1 ? 0 : ((slot + stagger) / (inBand - 1) - 0.5) * arc;

      const distance =
        CLUSTER_MIN +
        band * bandGap +
        jitter(leafNode.id) * Math.min(bandGap * 0.6, 22);
      const bearing = outward + spread;

      placed.push({
        node: leafNode,
        x: branchX + Math.cos(bearing) * distance,
        y: branchY + Math.sin(bearing) * distance,
        radius: SIZE[2],
        depth: 2,
        parent: entry.id,
      });
    });

    cursor += span;
  });

  return placed;
}

export function ExposureGraph({ model }: { model: ExposureGraphModel }) {
  const { t } = useTranslation();
  const placed = useMemo(() => layout(model), [model]);

  /*
   * The frame is fitted to the figure rather than fixed.
   *
   * How much a scan finds varies by an order of magnitude between domains: a
   * small site draws seventeen marks and a large estate draws two hundred. On
   * a fixed square the first floated in a void and the second crowded the
   * edges. Fitting the box means the composition is the same at both, and it
   * has a second effect worth having — a sparse figure is zoomed in, so its
   * marks are visually larger without any of the sizes below changing.
   */
  const frame = useMemo(() => {
    if (placed.length === 0) return { x: 0, y: 0, size: VIEW };

    /*
     * Bounds include the labels, not just the marks.
     *
     * Fitting to the circles alone cropped "Domains registered to resemble
     * yours" against the left edge, because a label extends outward from its
     * node and can be four times the node's own width. The extent is
     * estimated from the character count rather than measured — measuring
     * needs a laid-out DOM, and being a few pixels generous costs nothing
     * while being short costs a clipped word.
     */
    const CHAR = 7.1;
    const xs: number[] = [];
    const ys: number[] = [];

    for (const entry of placed) {
      xs.push(entry.x - entry.radius, entry.x + entry.radius);
      ys.push(entry.y - entry.radius, entry.y + entry.radius);

      if (entry.depth === 2) continue;
      const width = entry.node.label.length * CHAR;
      const bearing =
        entry.depth === 0
          ? Math.PI / 2
          : Math.atan2(entry.y - CENTRE, entry.x - CENTRE);
      const anchorX = entry.x + Math.cos(bearing) * (entry.radius + 10);
      const anchorY = entry.y + Math.sin(bearing) * (entry.radius + 10);

      // Which way the text runs from its anchor, matching the render's rule.
      const cos = Math.cos(bearing);
      const from =
        cos < -0.25
          ? anchorX - width
          : cos > 0.25
            ? anchorX
            : anchorX - width / 2;
      xs.push(from, from + width);
      ys.push(anchorY - 12, anchorY + 8);
    }

    const pad = 24;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const width = Math.max(...xs) + pad - minX;
    const height = Math.max(...ys) + pad - minY;
    const size = Math.max(width, height, 240);

    // Centred in a square box, so the figure is never stretched on one axis.
    return {
      x: minX - (size - width) / 2,
      y: minY - (size - height) / 2,
      size,
    };
  }, [placed]);
  const [selectedId, setSelectedId] = useState(() => model.nodes[0]?.id ?? "");
  const fieldRef = useRef<SVGSVGElement>(null);

  const byId = useMemo(
    () => new Map(placed.map((entry) => [entry.node.id, entry])),
    [placed],
  );
  const selected = byId.get(selectedId) ?? placed[0];

  /*
   * The branch the selection belongs to, so hovering a finding lights its
   * whole lineage rather than one dot. Reading a constellation is mostly
   * asking "what is this attached to".
   */
  const lineage = useMemo(() => {
    const active = byId.get(selectedId);
    if (active === undefined) return new Set<string>();
    const chain = new Set<string>([active.node.id]);
    let cursor = active.parent;
    while (cursor !== undefined) {
      chain.add(cursor);
      cursor = byId.get(cursor)?.parent;
    }
    return chain;
  }, [byId, selectedId]);

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    const index = placed.findIndex((entry) => entry.node.id === selectedId);
    if (index === -1) return;

    // Wrapping at both ends, so the whole figure is reachable without
    // knowing where in it the selection currently sits.
    let next: number;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (index + 1) % placed.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (index - 1 + placed.length) % placed.length;
    } else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = placed.length - 1;
    else return;

    event.preventDefault();
    const target = placed[next];
    if (target === undefined) return;
    setSelectedId(target.node.id);
    fieldRef.current
      ?.querySelector<SVGGElement>(
        `[data-node="${CSS.escape(target.node.id)}"]`,
      )
      ?.focus();
  }

  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <svg
        ref={fieldRef}
        viewBox={`${String(Math.round(frame.x))} ${String(Math.round(frame.y))} ${String(Math.round(frame.size))} ${String(Math.round(frame.size))}`}
        className="h-auto w-full"
        role="tree"
        aria-label={t("scanner.graph.title")}
        onKeyDown={onKeyDown}
      >
        {/*
          Connectors first, so every mark sits over its own lines. They are
          hairlines at low opacity: at this density anything heavier reads as
          a web rather than as a background the nodes sit on.
        */}
        {/*
          The two orbits, drawn faintly. They are the structure the marks are
          arranged on, and showing them is what turns a scatter into a
          diagram: the eye reads a ring and stops looking for a pattern that
          is not there. Kept far below the connectors in contrast so they read
          as ruling, not as content.
        */}
        <g aria-hidden="true" className="stroke-indigo-deep/40 fill-none">
          <circle cx={CENTRE} cy={CENTRE} r={ORBIT_BRANCH} strokeWidth={0.75} />
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={ORBIT_BRANCH + (CLUSTER_MIN + CLUSTER_MAX) / 2}
            strokeWidth={0.75}
            strokeDasharray="2 6"
          />
        </g>

        <g aria-hidden="true">
          {placed.map((entry) => {
            if (entry.parent === undefined) return null;
            const from = byId.get(entry.parent);
            if (from === undefined) return null;

            const lit = lineage.has(entry.node.id) && lineage.has(entry.parent);

            return (
              <line
                key={`edge-${entry.node.id}`}
                x1={from.x}
                y1={from.y}
                x2={entry.x}
                y2={entry.y}
                className={clsx(
                  "transition-[stroke,opacity] duration-300",
                  lit ? "stroke-lavender/70" : "stroke-indigo-deep",
                )}
                strokeWidth={lit ? 1.4 : 0.9}
              />
            );
          })}
        </g>

        {placed.map((entry) => {
          const active = entry.node.id === selectedId;
          const lit = lineage.has(entry.node.id);
          const glyph = glyphFor(entry.node, entry.depth);
          // Only the subject and the branches are labelled; see the note above.
          const label = entry.depth === 2 ? undefined : entry.node.label;
          // Outward from the centre, which is where the label goes.
          const bearing =
            entry.depth === 0
              ? Math.PI / 2
              : Math.atan2(entry.y - CENTRE, entry.x - CENTRE);

          return (
            <g
              key={entry.node.id}
              data-node={entry.node.id}
              role="treeitem"
              aria-level={entry.depth + 1}
              aria-selected={active}
              // One tab stop for the whole figure; arrows move within it.
              tabIndex={active ? 0 : -1}
              onClick={() => {
                setSelectedId(entry.node.id);
              }}
              onFocus={() => {
                setSelectedId(entry.node.id);
              }}
              aria-label={`${entry.node.label}. ${entry.node.kindLabel ?? t(`scanner.graph.kinds.${entry.node.kind}`)}`}
              className="focus-visible:outline-lavender cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {/*
                A halo on the lit lineage only. It is a ring rather than a
                blur: a glow around every node is the look the brief rules
                out, and a single ring is what a selected mark needs.
              */}
              {lit && (
                <circle
                  cx={entry.x}
                  cy={entry.y}
                  r={entry.radius + (active ? 9 : 5)}
                  className="stroke-lavender/45 fill-none"
                  strokeWidth={1}
                />
              )}

              <circle
                cx={entry.x}
                cy={entry.y}
                r={entry.radius}
                className={clsx(
                  fillFor(entry.node, entry.depth),
                  "transition-opacity duration-300",
                  lit || lineage.size <= 1 ? "opacity-100" : "opacity-45",
                )}
              />

              {/*
                A thin darker ring inside the fill, which is what stops a
                dense field reading as a spray of flat dots: each mark keeps
                an edge against its neighbours at small sizes.
              */}
              <circle
                cx={entry.x}
                cy={entry.y}
                r={entry.radius}
                className="stroke-ink fill-none"
                strokeWidth={entry.depth === 2 ? 1 : 1.5}
              />

              {/*
                The glyph, scaled from its 24-unit grid to sit inside the mark
                with room to breathe. Stroked in the ground colour so it reads
                as cut out of the disc rather than printed on it.
              */}
              {glyph !== undefined && (
                <g
                  transform={`translate(${String(entry.x)} ${String(entry.y)}) scale(${String((entry.radius * 1.16) / 12)}) translate(-12 -12)`}
                  className="stroke-ink-deep fill-none"
                  strokeWidth={2.1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={glyph} />
                </g>
              )}

              {/*
                The name, set on the far side of the mark from the centre so it
                runs outward into empty space rather than back across the
                figure. Anchored by which half it sits in, so a label on the
                left runs right to left and never crosses the middle.
              */}
              {label !== undefined && (
                <text
                  x={entry.x + Math.cos(bearing) * (entry.radius + 10)}
                  y={entry.y + Math.sin(bearing) * (entry.radius + 10) + 4}
                  textAnchor={
                    Math.cos(bearing) < -0.25
                      ? "end"
                      : Math.cos(bearing) > 0.25
                        ? "start"
                        : "middle"
                  }
                  className={clsx(
                    "pointer-events-none transition-colors",
                    entry.depth === 0
                      ? "fill-mist text-[15px]"
                      : lit
                        ? "fill-mist text-[13px]"
                        : "fill-mist/65 text-[13px]",
                  )}
                >
                  {label}
                </text>
              )}

              {/* An enlarged, invisible target: small marks are hard to hit. */}
              <circle
                cx={entry.x}
                cy={entry.y}
                r={Math.max(entry.radius + 8, 14)}
                className="fill-transparent"
              />
            </g>
          );
        })}
      </svg>

      {/*
        The words. No border and no background: it holds the second column by
        alignment, which is one fewer surface on a page that had too many.
      */}
      {selected !== undefined && (
        <div
          data-testid="graph-details"
          aria-live="polite"
          className="flex flex-col gap-4 lg:pt-4"
        >
          <p className="text-mist/40 text-xs tracking-[0.08em] uppercase">
            {selected.node.kindLabel ??
              t(`scanner.graph.kinds.${selected.node.kind}`)}
          </p>

          <h4 className="font-display text-mist text-lg leading-snug font-normal text-balance break-words">
            {selected.node.label}
          </h4>

          <p className="text-mist/70 text-sm leading-relaxed text-pretty">
            {selected.node.explanation}
          </p>

          {selected.node.action !== undefined && (
            <p className="text-mist/85 text-sm leading-relaxed text-pretty">
              {selected.node.action}
            </p>
          )}

          <dl className="text-mist/45 mt-1 flex flex-col gap-1.5 text-xs">
            <div className="flex gap-3">
              <dt className="w-20 shrink-0">{t("scanner.graph.provenance")}</dt>
              <dd className="text-mist/70">{selected.node.provenance}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 shrink-0">{t("scanner.graph.confidence")}</dt>
              <dd className="text-mist/70">
                {t(`scanner.confidence.${selected.node.confidence}.short`)}
              </dd>
            </div>
          </dl>

          <p className="text-mist/35 mt-2 text-xs leading-relaxed">
            {t("scanner.graph.hint")}
          </p>
        </div>
      )}
    </div>
  );
}

export default ExposureGraph;
