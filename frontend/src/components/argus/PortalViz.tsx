import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Check, Plus, RotateCcw, Timer } from "lucide-react";

/*
 * The charts and instruments the new ARGUS pages draw the portal with.
 *
 * Same doctrine as `PortalUI`: drawn rather than photographed, from the page's
 * own tokens, with sample data marked as sample data at the foot of each
 * composition. `PortalUI` holds the list-shaped fragments (queues, threads,
 * trails); this file holds the ones that are pictures — a calendar, a trend
 * line, a score. Split so neither file becomes the junk drawer.
 *
 * Everything here is illustration. Compositions sit inside `PortalPanel`, which
 * is aria-hidden; the copy beside them carries the meaning.
 */

/** The lifecycle a finding can be in after a monthly pass. */
export type DeltaKind = "new" | "open" | "resolved" | "reappearing";

const DELTA_TONE: Record<DeltaKind, { icon: LucideIcon; chip: string }> = {
  new: { icon: Plus, chip: "border-lavender/30 bg-lavender/10 text-lavender" },
  open: { icon: Timer, chip: "border-indigo-deep bg-ink/60 text-mist/70" },
  resolved: {
    icon: Check,
    chip: "border-success/30 bg-success/10 text-success",
  },
  reappearing: {
    icon: RotateCcw,
    chip: "border-warning/30 bg-warning/10 text-warning",
  },
};

/**
 * What a monthly pass changed, as four counted states.
 *
 * Icon and label on every tile, never colour alone: the tone is a reading aid,
 * the word is the information.
 */
export function DeltaBoard({
  items,
}: {
  items: readonly { kind: DeltaKind; count: string; label: string }[];
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
      {items.map((item) => {
        const tone = DELTA_TONE[item.kind];
        return (
          <li
            key={item.kind}
            className="border-indigo-deep/70 bg-ink/40 flex flex-col gap-2 rounded-lg border p-3"
          >
            <span
              className={clsx(
                "flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
                tone.chip,
              )}
            >
              <tone.icon className="size-3" />
              {item.label}
            </span>
            <span className="font-display text-mist text-2xl leading-none tabular-nums">
              {item.count}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * One month, with the scan day lit.
 *
 * A real grid of numbered days rather than an icon of a calendar, because the
 * argument it carries is specific: the first Monday, every month, and you can
 * see exactly where that lands.
 */
export function MonthCalendar({
  month,
  weekdays,
  offset,
  days,
  scanDay,
  scanLabel,
}: {
  month: string;
  /** Seven initials, Monday first. */
  weekdays: readonly string[];
  /** Blank cells before day 1 (0 when the month opens on Monday). */
  offset: number;
  days: number;
  scanDay: number;
  scanLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-mist/80 text-sm">{month}</span>
        <span className="text-lavender text-xs">{scanLabel}</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day, index) => (
          <span
            key={`${day}-${index.toString()}`}
            className="text-mist/35 pb-1 text-[0.6rem] tracking-wide uppercase"
          >
            {day}
          </span>
        ))}

        {Array.from({ length: offset }, (_, index) => (
          <span key={`pad-${index.toString()}`} />
        ))}

        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          return (
            <span
              key={day}
              className={clsx(
                "rounded-md py-1 font-mono text-[0.65rem] tabular-nums",
                day === scanDay
                  ? "bg-lavender text-ink-deep font-medium"
                  : "text-mist/45",
              )}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/*
 * The chart draws itself the first time it is seen, not on mount: mounted below
 * the fold it would have finished performing before anyone arrived. One
 * observer, one state, and the draw is a dashoffset transition — where reduced
 * motion is asked for, the global rule collapses it and the line is simply
 * there.
 */
function useDrawn<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [drawn, setDrawn] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || drawn) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setDrawn(true);
        observer.disconnect();
      },
      // The huge top margin means "anything scrolled past counts as seen" —
      // same trap `useReveal` documents: a jump over the chart must not leave
      // it undrawn for good.
      { rootMargin: "999999px 0px -15% 0px" },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [drawn]);

  return { ref, drawn };
}

/** Chart canvas, in user units. Rendered at the panel's width. */
const CHART_W = 320;
const CHART_H = 110;
const CHART_PAD = 14;

/**
 * Open findings over the last months, as one line.
 *
 * Deliberately spare: no axes, no legend, two hairline gridlines. The picture
 * exists to show a direction, and the direction is the line. The last point is
 * ringed because it is the month the section is talking about.
 */
export function TrendChart({
  months,
  values,
}: {
  months: readonly string[];
  values: readonly number[];
}) {
  const { ref, drawn } = useDrawn<HTMLDivElement>();

  const top = Math.max(...values, 1);
  const step = (CHART_W - CHART_PAD * 2) / Math.max(values.length - 1, 1);
  const x = (index: number) => CHART_PAD + index * step;
  const y = (value: number) =>
    CHART_H - CHART_PAD - (value / top) * (CHART_H - CHART_PAD * 2);

  const line = values
    .map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");
  const last = values.length - 1;

  return (
    <div ref={ref} className="flex flex-col gap-2 p-4">
      <svg
        viewBox={`0 0 ${CHART_W.toString()} ${CHART_H.toString()}`}
        className="w-full"
      >
        {[0.33, 0.66].map((share) => (
          <line
            key={share}
            x1={CHART_PAD}
            x2={CHART_W - CHART_PAD}
            y1={CHART_H * share}
            y2={CHART_H * share}
            className="stroke-indigo-deep/60"
            strokeWidth="1"
          />
        ))}

        <polyline
          points={line}
          pathLength={100}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-lavender"
          strokeDasharray="100"
          strokeDashoffset={drawn ? 0 : 100}
          style={{
            transition: "stroke-dashoffset 1.4s cubic-bezier(0, 0, 0.2, 1)",
          }}
        />

        {values.map((value, index) => (
          <circle
            key={months[index]}
            cx={x(index)}
            cy={y(value)}
            r={index === last ? 4 : 2.5}
            className={clsx(
              index === last
                ? "fill-lavender stroke-ink-deep"
                : "fill-lavender/70",
              "transition-opacity duration-500",
              drawn ? "opacity-100" : "opacity-0",
            )}
            strokeWidth={index === last ? 2 : 0}
            style={{ transitionDelay: `${(index * 90).toString()}ms` }}
          />
        ))}
      </svg>

      <div className="flex justify-between px-1">
        {months.map((month) => (
          <span
            key={month}
            className="text-mist/35 font-mono text-[0.6rem] tracking-wide uppercase"
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The application overview: every scoped application, its own count, one list.
 *
 * The selected row is the one the surrounding section is talking about; the
 * others are there because the section's point is that they are all on the
 * same page.
 */
export function AppList({
  rows,
  selected = 0,
}: {
  rows: readonly { name: string; open: string; delta: string }[];
  selected?: number;
}) {
  return (
    <ul className="flex flex-col gap-1.5 p-3">
      {rows.map((row, index) => (
        <li
          key={row.name}
          className={clsx(
            "flex items-center gap-3 rounded-lg border px-3.5 py-2.5",
            index === selected
              ? "border-lavender/40 bg-lavender/5"
              : "border-indigo-deep/60",
          )}
        >
          <span
            className={clsx(
              "size-1.5 shrink-0 rotate-45 rounded-xs",
              index === selected ? "bg-lavender" : "bg-indigo-deep",
            )}
          />
          <span className="text-mist/85 min-w-0 flex-1 truncate text-sm">
            {row.name}
          </span>
          <span className="text-mist/60 shrink-0 font-mono text-xs tabular-nums">
            {row.open}
          </span>
          <span className="text-mist/35 hidden shrink-0 font-mono text-xs tabular-nums sm:block">
            {row.delta}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A CVSS v4.0 score as the portal presents it: the number, the severity in
 * words beside it, the vector underneath, and the handful of metrics that
 * explain why it landed where it did.
 */
export function CvssPanel({
  score,
  severityLabel,
  severityTone,
  vector,
  metrics,
}: {
  score: string;
  severityLabel: string;
  /** Chip classes; the caller picks the severity tone `PortalUI` uses. */
  severityTone: string;
  vector: string;
  metrics: readonly { label: string; value: string }[];
}) {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-display text-mist text-3xl leading-none tabular-nums">
          {score}
        </span>
        <span
          className={clsx(
            "rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
            severityTone,
          )}
        >
          {severityLabel}
        </span>
      </div>

      <span className="text-mist/40 truncate font-mono text-xs">{vector}</span>

      <dl className="m-0 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="border-indigo-deep/60 bg-ink/40 flex flex-col gap-0.5 rounded-md border px-2.5 py-2"
          >
            <dt className="text-mist/40 text-[0.6rem] tracking-wide uppercase">
              {metric.label}
            </dt>
            <dd className="text-mist/80 m-0 text-xs font-medium">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Where an agent task stands. Not a severity; never coloured like one. */
export type TaskState = "queued" | "running" | "validating" | "done";

const TASK_TONE: Record<TaskState, string> = {
  queued: "border-indigo-deep bg-ink/60 text-mist/50",
  running: "border-lavender/30 bg-lavender/10 text-lavender",
  validating: "border-indigo/60 bg-indigo/20 text-mist/80",
  done: "border-success/30 bg-success/10 text-success",
};

/**
 * One agent task, as the activity view shows it: what is being worked, where,
 * how far along. The bar is the only moving part and it moves by state, not on
 * a loop — progress that throbs in place is a spinner wearing a costume.
 */
export function AgentTaskCard({
  title,
  target,
  state,
  stateLabel,
  progress,
}: {
  title: string;
  target: string;
  state: TaskState;
  stateLabel: string;
  /** 0 to 1. */
  progress: number;
}) {
  return (
    <div className="border-indigo-deep bg-ink-deep flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <span
          className={clsx(
            "rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
            TASK_TONE[state],
          )}
        >
          {stateLabel}
        </span>
        <span className="text-mist/35 font-mono text-[0.65rem] tabular-nums">
          {Math.round(progress * 100).toString()}%
        </span>
      </div>

      <span className="text-mist/90 text-sm leading-snug font-medium text-pretty">
        {title}
      </span>
      <span className="text-mist/45 truncate font-mono text-xs">{target}</span>

      <span className="bg-indigo-deep/60 h-1 overflow-hidden rounded-full">
        <span
          className={clsx(
            "block h-full origin-left rounded-full transition-transform duration-700",
            state === "done" ? "bg-success/80" : "bg-lavender",
          )}
          style={{ transform: `scaleX(${progress.toString()})` }}
        />
      </span>
    </div>
  );
}
