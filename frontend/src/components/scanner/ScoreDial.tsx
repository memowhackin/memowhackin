import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import type { ScanState } from "@/config/scanner";

/*
 * The headline dial.
 *
 * An open arc rather than a full ring, for the reason a speedometer is an arc:
 * the gap at the bottom gives the reading a start and an end, so a value is
 * read as a position along a scale instead of as a proportion of a circle.
 *
 * The track is drawn in four segments, one per band, with a small gap between
 * them. That is what makes the number legible without a legend — the needle
 * sits inside a named region, so "72" and "fair" are the same fact stated
 * twice rather than a number and an adjective that have to be reconciled.
 *
 * It replaces four unlabelled bars that said "Elevated" underneath. Those bars
 * were a scale with no units at either end: nothing said what four segments
 * meant, which direction was better, or what the word measured.
 *
 * The sweep is an animation on `stroke-dashoffset` from empty to the value,
 * eased over a second. It runs once, on arrival, and is skipped entirely under
 * reduced motion, where the arc is simply drawn at its final length.
 */

/** Degrees. A 260-degree arc leaves a 100-degree gap at the foot. */
const SWEEP = 260;
const START = 90 + (360 - SWEEP) / 2;
const RADIUS = 92;
const CENTRE = 120;
const TRACK_WIDTH = 10;

/*
 * Where each band ends, as a fraction of the scale. Boundaries match
 * `score.ts`, so the colour a needle sits in is the band the server assigned.
 *
 * The ramp runs warm to cool rather than red to green: this palette has no
 * green, and inventing one for a single dial would put a colour on the page
 * that appears nowhere else on the site. Ember is the only alarm colour the
 * brand has, so it marks the bottom of the scale and fades out of the way as
 * the reading improves.
 */
const BANDS = [
  { key: "poor", to: 0.4, className: "stroke-ember" },
  { key: "weak", to: 0.65, className: "stroke-ember/55" },
  { key: "fair", to: 0.85, className: "stroke-indigo-bright" },
  { key: "strong", to: 1, className: "stroke-lavender" },
] as const;

function polar(fraction: number, radius = RADIUS): { x: number; y: number } {
  const angle = ((START + fraction * SWEEP) * Math.PI) / 180;
  return {
    x: CENTRE + Math.cos(angle) * radius,
    y: CENTRE + Math.sin(angle) * radius,
  };
}

/** An arc path between two fractions of the scale. */
function arc(from: number, to: number, radius = RADIUS): string {
  const start = polar(from, radius);
  const end = polar(to, radius);
  const large = (to - from) * SWEEP > 180 ? 1 : 0;
  return `M ${String(start.x)} ${String(start.y)} A ${String(radius)} ${String(radius)} 0 ${String(large)} 1 ${String(end.x)} ${String(end.y)}`;
}

export function ScoreDial({ scan }: { scan: ScanState }) {
  const { t } = useTranslation();
  const result = scan.websiteResult;
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const target = result?.score ?? 0;
  const band = result?.scoreBand ?? "fair";

  /*
   * The count and the sweep share one value, so the number and the arc can
   * never disagree mid-animation. It settles on the real score even if the
   * frame loop is interrupted, because the final assignment is unconditional.
   */
  const [animated, setAnimated] = useState(0);
  const frame = useRef(0);

  /*
   * Derived rather than stored for the reduced-motion case. Whether the dial
   * animates is knowable during render, so writing the final value into state
   * from an effect would be a cascading render to say something the component
   * already knew.
   */
  const shown = reduced ? target : animated;

  useEffect(() => {
    // Nothing to animate, and nothing to set: `shown` is already `target`.
    if (reduced) return;

    const duration = 1100;
    const started = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - started) / duration, 1);
      // Ease out cubic: quick to establish the reading, slow to settle on it.
      const eased = 1 - Math.pow(1 - progress, 3);
      // Inside a frame callback, so never synchronous with the effect body.
      setAnimated(target * eased);

      if (progress < 1) frame.current = requestAnimationFrame(step);
      else setAnimated(target);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [target, reduced]);

  if (result === undefined) return null;

  const fraction = shown / 100;
  const tip = polar(fraction, RADIUS - 20);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 240 214"
        className="h-auto w-56 sm:w-64"
        role="img"
        aria-label={t("scanner.report.scoreLabel", {
          score: Math.round(target),
          band: t(`scanner.scoreBands.${band}.name`),
        })}
      >
        {/*
          The scale itself: four named zones, drawn at full strength. An
          earlier version drew them faintly and then painted a value arc over
          the top, which hid the very thing that gives the number meaning —
          the reader could see how far round the arc went but not which region
          it had stopped in. The needle is what carries the reading now, which
          is how a dial has always worked.
        */}
        {BANDS.map((entry, index) => {
          const from = index === 0 ? 0 : (BANDS[index - 1]?.to ?? 0);
          const gap = 0.008;
          const holds = target / 100 > from && target / 100 <= entry.to;

          return (
            <path
              key={entry.key}
              d={arc(from + gap, entry.to - gap)}
              /*
               * Only the zone the needle rests in takes a colour; the rest
               * are neutral track. Colouring every zone put a large ember arc
               * next to a good score, which reads as an alarm about the very
               * thing the dial is saying is fine. The scale is still legible
               * as four regions, and the one that matters is the lit one.
               */
              className={clsx(
                "transition-[stroke,opacity] duration-700",
                holds
                  ? `${entry.className} opacity-100`
                  : "stroke-indigo-deep opacity-70",
              )}
              strokeWidth={TRACK_WIDTH}
              strokeLinecap="butt"
              fill="none"
            />
          );
        })}

        {/*
          The needle, from the hub at the centre out to the reading. A single
          tapering line and a small disc: the thinnest mark that still reads
          at a glance, so the number stays the loudest thing here.
        */}
        <line
          x1={CENTRE}
          y1={CENTRE}
          x2={tip.x}
          y2={tip.y}
          className="stroke-mist"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <circle cx={CENTRE} cy={CENTRE} r={4.5} className="fill-mist" />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={8}
          className="stroke-mist/30 fill-none"
          strokeWidth={1}
        />

        {/* The reading, set in the arc's opening. */}
        <text
          x={CENTRE}
          y={CENTRE + 54}
          textAnchor="middle"
          className="fill-mist font-display text-[2.5rem]"
        >
          {Math.round(shown)}
        </text>
        <text
          x={CENTRE}
          y={CENTRE + 74}
          textAnchor="middle"
          className="fill-mist/40 text-[0.75rem]"
        >
          {t("scanner.report.scoreOutOf")}
        </text>
      </svg>

      <p className="text-mist/75 text-sm font-medium">
        {t(`scanner.scoreBands.${band}.name`)}
      </p>
    </div>
  );
}
