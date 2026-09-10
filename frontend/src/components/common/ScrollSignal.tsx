import { useId, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import {
  useScrollSignal,
  type SignalGeometry,
} from "@/components/common/useScrollSignal";

/*
 * The scan that runs a ruled grid as the reader scrolls it.
 *
 * The grid itself — the centre hairline, the rule at every row boundary, the
 * diamond where they cross — is drawn by the rows, exactly as before, and
 * stays visible throughout. This layer sits over it and lights it: a trace
 * runs down the centre rule as the reader comes down the page; where it
 * reaches a crossing the diamond wakes first, swells and lets go one ring;
 * the rule there lights outward to both ends; and the row below comes up to
 * full strength. What the trace has passed keeps a faint glow; what it has not
 * reached stays quiet. Scrolling back up runs all of it in reverse, because
 * every value is a function of the scroll position and nothing else (see
 * `scrollSignal.ts`).
 *
 * It is an SVG rather than a stack of divs so that the lines stay hairlines
 * at every width and the diamonds are drawn where the geometry says the
 * crossings are — measured off the rows, so the overlay is on the grid at any
 * viewport and in either language, and re-measured whenever a row changes
 * size. It is sized in pixels and never given a viewBox: one user unit is one
 * CSS pixel, which is what keeps a 1-unit stroke a crisp hairline instead of
 * a scaled smear.
 *
 * Everything that moves does so by `transform` or `opacity`, driven by custom
 * properties the hook writes — there is no filter on the page, and the halos
 * are stacked strokes and gradient fills that cost the same on every frame.
 * The layer takes no pointer events and no space in the flow.
 */

interface ScrollSignalProps {
  /** The rows, each marked `data-signal-row`, in whatever list they live in. */
  children: ReactNode;
  className?: string;
}

/** Ruled grid with the scan drawn over it. */
export function ScrollSignal({ children, className }: ScrollSignalProps) {
  const { ref, geometry } = useScrollSignal<HTMLDivElement>();
  /*
   * The gradients are addressed by id, and a page could carry two grids.
   * React's ids are unique but carry punctuation that a URL fragment treats
   * as its own, so they are trimmed to what survives inside `url(#…)`.
   */
  const id = `signal-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div ref={ref} className={clsx("relative", className)}>
      {children}
      {geometry !== null && <SignalOverlay geometry={geometry} id={id} />}
    </div>
  );
}

const lavender: CSSProperties = { stopColor: "var(--color-lavender)" };
const lavenderSoft: CSSProperties = { stopColor: "var(--color-lavender-soft)" };

function SignalOverlay({
  geometry,
  id,
}: {
  geometry: SignalGeometry;
  id: string;
}) {
  const { width, height, centre, unit, crossings, sparks } = geometry;

  /*
   * Sizes are rems of the grid, not pixels, so they scale with the diamond
   * they sit on: the grid draws that at `size-2`, half a rem, and so does this.
   */
  const diamond = unit * 0.5;
  const headLength = unit * 3.5;
  const frontLength = unit * 1.75;
  const headGradient = `${id}-head`;
  const haloGradient = `${id}-halo`;
  const rightward = `${id}-right`;
  const leftward = `${id}-left`;
  const centreString = centre.toString();

  return (
    <svg
      data-signal-overlay
      aria-hidden="true"
      focusable="false"
      /*
       * Above the rows' own rules (z-10) and diamonds (z-20), so the lit
       * versions paint over the quiet ones. `overflow-visible` lets the head's
       * halo cross the top and bottom edges rather than being sliced there.
       */
      className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
    >
      <defs>
        {/*
          The head's tail, in user space so it travels with the group the head
          is translated in: gone at the tail, the brand lavender along most of
          it, and the soft tint at the very tip where the core is brightest.
        */}
        <linearGradient
          id={headGradient}
          gradientUnits="userSpaceOnUse"
          x1={centre}
          y1={-headLength}
          x2={centre}
          y2={0}
        >
          <stop offset="0" style={lavender} stopOpacity={0} />
          <stop offset="0.7" style={lavender} stopOpacity={0.8} />
          <stop offset="1" style={lavenderSoft} />
        </linearGradient>

        {/* The two fronts that run a rule: each fades in from its tail. */}
        <linearGradient
          id={rightward}
          gradientUnits="userSpaceOnUse"
          x1={centre - frontLength}
          y1={0}
          x2={centre}
          y2={0}
        >
          <stop offset="0" style={lavender} stopOpacity={0} />
          <stop offset="1" style={lavenderSoft} />
        </linearGradient>
        <linearGradient
          id={leftward}
          gradientUnits="userSpaceOnUse"
          x1={centre + frontLength}
          y1={0}
          x2={centre}
          y2={0}
        >
          <stop offset="0" style={lavender} stopOpacity={0} />
          <stop offset="1" style={lavenderSoft} />
        </linearGradient>

        {/* A soft disc of lavender, for the halos under the head and the diamonds. */}
        <radialGradient id={haloGradient}>
          <stop offset="0" style={lavender} stopOpacity={0.55} />
          <stop offset="0.55" style={lavender} stopOpacity={0.14} />
          <stop offset="1" style={lavender} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/*
        Everything on the centre rule. Hidden below `lg` along with the rule
        itself — the grid has no centre line and no diamonds on a phone, so
        there is nothing there for a trace to run.
      */}
      <g className="hidden lg:block">
        {/*
          The trail: the run of the rule the scan has covered, kept at a faint
          glow. Three strokes make the halo — a hairline core with two wider,
          fainter lines under it — which reads as one soft line and costs no
          filter. Scaled down from the top by the progress rather than grown,
          so the frame's only work is a transform.
        */}
        <g
          style={{
            transformOrigin: `${centreString}px 0px`,
            transform: "scaleY(var(--signal-progress, 0))",
          }}
        >
          <line
            x1={centre}
            y1={0}
            x2={centre}
            y2={height}
            className="stroke-lavender"
            strokeWidth={7}
            opacity={0.05}
          />
          <line
            x1={centre}
            y1={0}
            x2={centre}
            y2={height}
            className="stroke-lavender"
            strokeWidth={3}
            opacity={0.16}
          />
          <line
            x1={centre}
            y1={0}
            x2={centre}
            y2={height}
            className="stroke-lavender"
            strokeWidth={1}
            opacity={0.8}
          />
        </g>

        {/*
          The branches: short two-segment lines rooted on the rule, each shown
          only while the head is passing it (see `sparkAlpha`). Sparse and
          brief by design — a discharge, not a storm.
        */}
        <g className="motion-reduce:hidden">
          {sparks.map((spark) => {
            const reach = spark.length * spark.side;
            const points = [
              `${centreString},${spark.y.toString()}`,
              `${(centre + reach * 0.45).toString()},${(spark.y - spark.length * 0.3).toString()}`,
              `${(centre + reach).toString()},${(spark.y - spark.length * 0.75).toString()}`,
            ].join(" ");

            return (
              <polyline
                key={spark.y.toString()}
                data-signal-spark
                points={points}
                fill="none"
                className="stroke-lavender-soft"
                strokeWidth={1}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: "var(--spark, 0)" }}
              />
            );
          })}
        </g>

        {/*
          The head: a narrow luminous core with a soft halo, and a tail that
          fades out behind it. Translated to the front's position; its
          visibility (`--signal-head`) brings it up out of the first crossing
          and down into the last.
        */}
        <g
          className="motion-reduce:hidden"
          style={{
            transform: "translateY(calc(var(--signal-front, 0) * 1px))",
            opacity: "var(--signal-head, 0)",
          }}
        >
          <line
            x1={centre}
            y1={-headLength}
            x2={centre}
            y2={0}
            stroke={`url(#${headGradient})`}
            strokeWidth={3}
            opacity={0.35}
          />
          <line
            x1={centre}
            y1={-headLength}
            x2={centre}
            y2={0}
            stroke={`url(#${headGradient})`}
            strokeWidth={1.25}
          />
          <circle
            cx={centre}
            cy={0}
            r={unit * 0.55}
            fill={`url(#${haloGradient})`}
            opacity={0.8}
          />
          <circle
            cx={centre}
            cy={0}
            r={unit * 0.12}
            className="fill-lavender-soft"
          />
        </g>
      </g>

      {crossings.map((y, index) => {
        const origin = `${centreString}px ${y.toString()}px`;
        const row = index.toString();

        return (
          <g
            key={y.toString()}
            data-signal-crossing
            data-signal-row-index={row}
          >
            {/*
              The rule, lit from the centre out to both ends — the same
              hairline-and-halo pair as the trail, scaled in x from the
              crossing. This part runs at every width: the rules are on the
              grid at every width.
            */}
            <g
              style={{
                transformOrigin: origin,
                transform: "scaleX(var(--spread, 0))",
              }}
            >
              <line
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                className="stroke-lavender"
                strokeWidth={3}
                opacity={0.1}
              />
              <line
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                className="stroke-lavender"
                strokeWidth={1}
                opacity={0.55}
              />
            </g>

            {/*
              The two fronts running the rule, one each way, translated out to
              the ends by the same spread that scales the glow behind them.
            */}
            <g
              className="motion-reduce:hidden"
              style={{ opacity: "var(--spread-head, 0)" }}
            >
              <g
                style={{
                  transform: `translateX(calc(var(--spread, 0) * ${(width - centre).toString()}px))`,
                }}
              >
                <line
                  x1={centre - frontLength}
                  y1={y}
                  x2={centre}
                  y2={y}
                  stroke={`url(#${rightward})`}
                  strokeWidth={1.25}
                />
                <circle
                  cx={centre}
                  cy={y}
                  r={unit * 0.09}
                  className="fill-lavender-soft"
                />
              </g>
              <g
                style={{
                  transform: `translateX(calc(var(--spread, 0) * ${(-centre).toString()}px))`,
                }}
              >
                <line
                  x1={centre}
                  y1={y}
                  x2={centre + frontLength}
                  y2={y}
                  stroke={`url(#${leftward})`}
                  strokeWidth={1.25}
                />
                <circle
                  cx={centre}
                  cy={y}
                  r={unit * 0.09}
                  className="fill-lavender-soft"
                />
              </g>
            </g>

            {/*
              The crossing's diamond, over the grid's own: the halo that comes
              up under it, the mark itself brightening to the soft tint and
              swelling a little, and the one ring it releases. `lg` only, like
              the diamond it lights.
            */}
            <g className="hidden lg:block">
              <circle
                cx={centre}
                cy={y}
                r={unit * 1.1}
                fill={`url(#${haloGradient})`}
                style={{
                  opacity: "calc(var(--swell, 0) * 0.7)",
                  transformOrigin: origin,
                  transform: "scale(calc(0.5 + var(--swell, 0) * 0.5))",
                }}
              />
              <rect
                x={centre - diamond / 2}
                y={y - diamond / 2}
                width={diamond}
                height={diamond}
                rx={unit * 0.125}
                className="fill-lavender-soft"
                style={{
                  opacity: "var(--lit, 0)",
                  transformOrigin: origin,
                  transform:
                    "rotate(45deg) scale(calc(1 + var(--swell, 0) * 0.5))",
                }}
              />
              <rect
                x={centre - diamond / 2}
                y={y - diamond / 2}
                width={diamond}
                height={diamond}
                rx={unit * 0.125}
                fill="none"
                className="stroke-lavender motion-reduce:hidden"
                strokeWidth={1}
                style={{
                  opacity: "calc(var(--ring, 0) * 0.6)",
                  transformOrigin: origin,
                  transform:
                    "rotate(45deg) scale(calc(1 + var(--pulse, 0) * 2.6))",
                }}
              />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
