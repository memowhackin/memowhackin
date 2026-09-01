import type { ReactNode } from "react";
import clsx from "clsx";
import type { ProcessStepKey } from "@/config/services";

/*
 * The mark beside each step of the process rail — one per stage, each doing the
 * thing its stage does.
 *
 * Drawn rather than illustrated: strokes on a 40-unit canvas, in the step's own
 * tone from the rail's ramp, because that is the language the rest of these
 * pages are built in. An icon set or a stock illustration would be a second
 * visual vocabulary bolted onto a page that already has one.
 *
 * Only the step being read animates. The other five hold their finished pose,
 * dimmed but still plainly drawn, so the section has exactly one moving thing in
 * it and that movement answers "where am I" rather than playing to an empty
 * room. They used to sit at a quarter strength, which on this background was
 * close enough to invisible that five of the six marks were not worth drawing.
 *
 * Every animation is CSS on an SVG shape: no runtime, no library, nothing
 * measured per frame. `motion-safe` gates all of them, so a reader who asked for
 * stillness gets six finished drawings.
 */

/** Dash setup for a stroke that draws itself: see `--animate-glyph-trace`. */
const TRACE = {
  pathLength: 100,
  strokeDasharray: 100,
} as const;

function Canvas({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      /*
       * `non-scaling-stroke` on everything inside: the width is taken after the
       * canvas is scaled down, so every mark lands at exactly 1.5px whatever
       * size it is drawn at. Left to scale, a stroke measured in the canvas's
       * own units would arrive at well under a pixel and the drawing would read
       * as a grey smudge rather than a line.
       */
      className="size-7 [&_*]:[vector-effect:non-scaling-stroke]"
    >
      {children}
    </svg>
  );
}

/*
 * `transform-box: fill-box` is what makes `transform-origin: center` mean the
 * shape's own centre rather than the whole SVG's user space — without it every
 * rotation here swings around the canvas corner.
 */
const SPINS = "[transform-box:fill-box] [transform-origin:center]";

/** 01 — Scoping: the boundary being agreed, drawn corner to corner. */
function Scope({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <rect
        x={7}
        y={9}
        width={26}
        height={22}
        rx={2}
        {...TRACE}
        className={clsx(animate && "motion-safe:animate-glyph-trace")}
      />
      <path d="M14 20h12" opacity={0.5} />
    </Canvas>
  );
}

/** 02 — Reconnaissance: a sweep going round, finding what is out there. */
function Recon({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <circle cx={20} cy={20} r={12} opacity={0.35} />
      <circle cx={20} cy={20} r={6} opacity={0.2} />
      <g className={clsx(SPINS, animate && "motion-safe:animate-glyph-sweep")}>
        <path d="M20 20V8" />
      </g>
      <circle cx={26} cy={14} r={1.5} fill="currentColor" stroke="none" />
    </Canvas>
  );
}

/** 03 — AI-assisted testing: the surface under test, scanned end to end. */
function Testing({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <rect x={8} y={8} width={24} height={24} rx={3} opacity={0.35} />
      <g className={clsx(animate && "motion-safe:animate-glyph-scan")}>
        <path d="M11 20h18" />
      </g>
      <circle
        cx={14}
        cy={13}
        r={1}
        fill="currentColor"
        stroke="none"
        opacity={0.6}
      />
      <circle
        cx={26}
        cy={27}
        r={1}
        fill="currentColor"
        stroke="none"
        opacity={0.6}
      />
    </Canvas>
  );
}

/** 04 — Human validation: the tick a senior pentester puts against a finding. */
function Validation({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <circle cx={20} cy={20} r={12} opacity={0.35} />
      <path
        d="M14 20.5l4.2 4.2L27 16"
        {...TRACE}
        className={clsx(animate && "motion-safe:animate-glyph-trace")}
      />
    </Canvas>
  );
}

/** 05 — Reporting: the page filling in, line after line. */
function Reporting({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <path d="M11 7h13l5 5v21H11z" opacity={0.35} />
      <path d="M24 7v5h5" opacity={0.35} />
      {[19, 23, 27].map((y, index) => (
        <path
          key={y}
          d={`M15 ${y.toString()}h${index === 2 ? "6" : "10"}`}
          {...TRACE}
          className={clsx(
            animate && "motion-safe:animate-glyph-trace",
            /* Each line lands after the one above it, so the page is written
               rather than switched on. */
            index === 1 && "[animation-delay:0.35s]",
            index === 2 && "[animation-delay:0.7s]",
          )}
        />
      ))}
    </Canvas>
  );
}

/** 06 — Retest: round again, to confirm the fix holds. */
function Retest({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <g className={clsx(SPINS, animate && "motion-safe:animate-glyph-spin")}>
        <path d="M31 20a11 11 0 1 1-4.4-8.8" />
        <path d="M27.5 6.5v5.5H22" />
      </g>
      <circle cx={20} cy={20} r={2} fill="currentColor" stroke="none" />
    </Canvas>
  );
}

/*
 * The awareness programme's four phases. It is a loop rather than a line, so
 * these are the marks for measuring, teaching, testing what stuck, and changing
 * what did not before it comes round again.
 */

/** 01 — Baseline: where the organisation actually stands, measured first. */
function Baseline({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <path d="M9 30h22" opacity={0.35} />
      {[
        { x: 14, y: 22 },
        { x: 20, y: 16 },
        { x: 26, y: 11 },
      ].map((bar, index) => (
        <path
          key={bar.x}
          d={`M${bar.x.toString()} 30V${bar.y.toString()}`}
          {...TRACE}
          className={clsx(
            animate && "motion-safe:animate-glyph-trace",
            index === 1 && "[animation-delay:0.3s]",
            index === 2 && "[animation-delay:0.6s]",
          )}
        />
      ))}
    </Canvas>
  );
}

/** 02 — Training: the session itself, and the people in it. */
function Training({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <rect x={7} y={9} width={26} height={18} rx={2} opacity={0.3} />
      <circle
        cx={20}
        cy={16}
        r={3}
        {...TRACE}
        className={clsx(animate && "motion-safe:animate-glyph-trace")}
      />
      <path
        d="M14.5 23.5c1.6-3.2 9.4-3.2 11 0"
        {...TRACE}
        className={clsx(
          animate && "motion-safe:animate-glyph-trace [animation-delay:0.4s]",
        )}
      />
      <path d="M16 31h8" opacity={0.3} />
    </Canvas>
  );
}

/** 03 — Simulation: a message that looks exactly like the real thing. */
function Simulation({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <rect x={7} y={12} width={26} height={17} rx={2} opacity={0.35} />
      <path
        d="M7.8 13.2L20 21.5l12.2-8.3"
        {...TRACE}
        className={clsx(animate && "motion-safe:animate-glyph-trace")}
      />
      <circle cx={30} cy={12} r={2.5} fill="currentColor" stroke="none" />
    </Canvas>
  );
}

/** 04 — Adjust: what the round taught, turned into what changes next. */
function Adjust({ animate }: { animate: boolean }) {
  return (
    <Canvas>
      <path d="M9 16h22" opacity={0.35} />
      <path d="M9 24h22" opacity={0.35} />
      <rect
        x={14}
        y={13}
        width={4}
        height={6}
        rx={1}
        fill="currentColor"
        stroke="none"
        className={clsx(animate && "motion-safe:animate-glyph-slide")}
      />
      <rect
        x={22}
        y={21}
        width={4}
        height={6}
        rx={1}
        fill="currentColor"
        stroke="none"
        className={clsx(
          animate && "motion-safe:animate-glyph-slide [animation-delay:0.8s]",
        )}
      />
    </Canvas>
  );
}

/**
 * The mark for one step, by the key the service definition gives it.
 *
 * A switch rather than a lookup object so an unknown key is a compile error
 * here instead of an empty square on the page: adding a stage to a service
 * means drawing its mark, and TypeScript should be the one to say so.
 */
export function StepGlyph({
  step,
  active,
}: {
  step: ProcessStepKey;
  active: boolean;
}) {
  const glyph = (): ReactNode => {
    switch (step) {
      case "scope":
        return <Scope animate={active} />;
      case "recon":
        return <Recon animate={active} />;
      case "testing":
        return <Testing animate={active} />;
      case "validation":
        return <Validation animate={active} />;
      case "reporting":
        return <Reporting animate={active} />;
      case "retest":
        return <Retest animate={active} />;
      case "baseline":
        return <Baseline animate={active} />;
      case "training":
        return <Training animate={active} />;
      case "simulation":
        return <Simulation animate={active} />;
      case "adjust":
        return <Adjust animate={active} />;
      default:
        return step satisfies never;
    }
  };

  return (
    <span
      className={clsx(
        "text-[var(--step-tone)]",
        "motion-safe:transition-opacity motion-safe:duration-500",
        active ? "opacity-100" : "opacity-55 group-hover:opacity-80",
      )}
    >
      {glyph()}
    </span>
  );
}
