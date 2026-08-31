import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

/*
 * The pieces the ARGUS pages draw the portal with.
 *
 * Drawn rather than photographed. There is no screenshot of this product on
 * this site yet, and a page of empty frames waiting for one illustrates
 * nothing. These are small, honest fragments of the interface, built from the
 * same tokens as the rest of the page, and each page composes the two or three
 * that show what its own section is talking about.
 *
 * Everything in them is sample data and marked as such, once, at the foot of
 * the composition. They are illustrations of a shape, not screenshots of a
 * tenant, and the moment a real screenshot exists it should replace them.
 */

/** Severity, in the three colours the rest of the site already spends. */
type Severity = "critical" | "high" | "medium";

const SEVERITY_TONE: Record<Severity, string> = {
  critical: "bg-ember/15 text-ember border-ember/30",
  high: "bg-warning/10 text-warning border-warning/25",
  medium: "bg-lavender/10 text-lavender border-lavender/25",
};

/**
 * The window everything else sits in.
 *
 * A hairline border, the page's own deep ink, and a bar across the top with a
 * label in it. No traffic-light dots: this is a web application, and drawing
 * a desktop window around it would be describing something that does not exist.
 */
export function PortalPanel({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "border-indigo-deep bg-ink-deep overflow-hidden rounded-xl border shadow-[0_1.5rem_3rem_-1.5rem_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      {/*
        `min-w-0` and `truncate` on the label, because a flex item's floor is the
        width of its own text: without them the longest panel title became the
        panel's minimum width, and on a phone that pushed the whole composition
        past the edge of the screen.
      */}
      <div className="border-indigo-deep/70 bg-ink/60 flex items-center gap-2 border-b px-4 py-2.5">
        <span className="bg-lavender/60 size-1.5 shrink-0 rotate-45 rounded-xs" />
        <span className="font-display text-mist/60 min-w-0 truncate text-xs tracking-wide">
          {label}
        </span>
      </div>

      {children}
    </div>
  );
}

/** One row of the findings queue. */
export interface FindingRow {
  severity: Severity;
  name: string;
  meta: string;
}

/** The findings queue, as far down as the frame has room for. */
export function FindingsRows({ rows }: { rows: readonly FindingRow[] }) {
  const { t } = useTranslation();

  return (
    <ul className="divide-indigo-deep/60 divide-y">
      {rows.map((row) => (
        <li
          key={row.name}
          className="flex items-center gap-3 px-4 py-3 sm:gap-4"
        >
          <span
            className={clsx(
              "shrink-0 rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
              SEVERITY_TONE[row.severity],
            )}
          >
            {t(`argusUi.severity.${row.severity}`)}
          </span>

          <span className="text-mist/85 min-w-0 flex-1 truncate text-sm">
            {row.name}
          </span>

          <span className="text-mist/40 hidden shrink-0 font-mono text-xs sm:block">
            {row.meta}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** What happened to an asset this pass. Not a severity, and not coloured like one. */
type AssetState = "new" | "known" | "closed";

const STATE_TONE: Record<AssetState, string> = {
  new: "bg-lavender/10 text-lavender border-lavender/25",
  known: "bg-indigo-deep/40 text-mist/50 border-indigo-deep",
  closed: "bg-indigo-deep/40 text-mist/40 border-indigo-deep",
};

export interface AssetRow {
  state: AssetState;
  name: string;
}

/**
 * Changes to the surface, as a list of assets rather than of findings.
 *
 * Its own component because the first version reused the findings rows, which
 * put a severity chip on every line. "checkout.example.com unchanged" is not a
 * medium-severity anything, and colouring it as one says something false in the
 * one place on the page that is supposed to be showing the product honestly.
 */
export function AssetRows({ rows }: { rows: readonly AssetRow[] }) {
  const { t } = useTranslation();

  return (
    <ul className="divide-indigo-deep/60 divide-y">
      {rows.map((row) => (
        <li
          key={row.name}
          className="flex items-center gap-3 px-4 py-3 sm:gap-4"
        >
          <span
            className={clsx(
              "shrink-0 rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
              STATE_TONE[row.state],
            )}
          >
            {t(`argusUi.state.${row.state}`)}
          </span>

          <span className="text-mist/85 min-w-0 flex-1 truncate font-mono text-sm">
            {row.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** The rail of asset counts down the side of the portal. */
export function AssetRail({
  items,
}: {
  items: readonly { label: string; count: string }[];
}) {
  return (
    <ul className="border-indigo-deep/60 hidden w-40 shrink-0 flex-col gap-3 border-r p-4 sm:flex">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-2"
        >
          <span className="text-mist/55 truncate text-xs">{item.label}</span>
          <span className="text-mist/80 font-mono text-xs tabular-nums">
            {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The small card that floats over a corner of the panel.
 *
 * One number and the thing it counts. It is the only element in these
 * compositions that is allowed to be loud, so there is never more than one of
 * them on a picture.
 */
export function Callout({
  figure,
  label,
  className,
}: {
  figure: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "border-indigo-deep bg-ink absolute flex items-center gap-3 rounded-lg border px-4 py-3 shadow-[0_1rem_2rem_-0.75rem_rgba(0,0,0,0.7)]",
        className,
      )}
    >
      <span className="font-display text-lavender text-2xl leading-none tabular-nums">
        {figure}
      </span>
      <span className="text-mist/60 max-w-[9rem] text-xs leading-snug text-pretty">
        {label}
      </span>
    </div>
  );
}

/**
 * A year of passes as a strip of months.
 *
 * The point of the picture is the run of them, so the months that have been
 * covered are marked and the rest are not. The one being pointed at is brighter
 * than its neighbours.
 */
export function ScanStrip({
  months,
  covered,
  current,
}: {
  months: readonly string[];
  /** How many months in from the left have been run. */
  covered: number;
  /** Which month the section is talking about. */
  current: number;
}) {
  return (
    <ol aria-hidden="true" className="flex items-end gap-1.5">
      {months.map((month, index) => {
        const done = index < covered;
        return (
          <li
            key={month}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <span
              className={clsx(
                "w-full rounded-xs transition-colors",
                index === current && "bg-lavender h-8",
                index !== current && done && "bg-indigo h-5",
                !done && index !== current && "bg-indigo-deep/70 h-3",
              )}
            />
            <span
              className={clsx(
                "w-full truncate text-center font-mono text-[0.6rem] tracking-wide uppercase",
                index === current ? "text-lavender" : "text-mist/35",
              )}
            >
              {month}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * A numbered marker, for a picture whose parts are explained beside it.
 *
 * The number is information here rather than decoration: it is the only thing
 * tying a line in the legend to the row of the panel it describes, so it earns
 * the sequence it implies.
 */
export function Marker({ index }: { index: number }) {
  return (
    <span className="border-lavender/40 text-lavender flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[0.6rem] tabular-nums">
      {index}
    </span>
  );
}

/** One labelled row inside the finding detail. */
export interface DetailRow {
  label: string;
  value: string;
  /** Renders in the mono face, for a request, a path or a snippet. */
  mono?: boolean;
}

/**
 * A finding as it is opened in the portal.
 *
 * Deliberately not a list of features. It is the object the page is arguing
 * about, so it is drawn as the object: a severity, a title, then the rows a
 * developer actually reads before they can start.
 */
export function FindingDetail({
  severity,
  title,
  rows,
  state,
}: {
  severity: Severity;
  title: string;
  rows: readonly DetailRow[];
  state: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="border-indigo-deep/60 flex flex-wrap items-center gap-3 border-b px-5 py-4">
        <span
          className={clsx(
            "shrink-0 rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
            SEVERITY_TONE[severity],
          )}
        >
          {t(`argusUi.severity.${severity}`)}
        </span>
        <span className="text-mist min-w-0 flex-1 text-sm font-medium text-pretty">
          {title}
        </span>
      </div>

      <dl className="divide-indigo-deep/60 m-0 divide-y">
        {rows.map((row, index) => (
          <div key={row.label} className="flex flex-col gap-1.5 px-5 py-3.5">
            <dt className="flex items-center gap-2.5">
              <Marker index={index + 1} />
              <span className="text-mist/45 text-xs tracking-wide uppercase">
                {row.label}
              </span>
            </dt>
            <dd
              className={clsx(
                "text-mist/80 m-0 pl-7.5 text-sm leading-relaxed text-pretty",
                row.mono === true && "font-mono text-xs",
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {/*
        The state is the last annotated part of a finding, not a footer, so it
        takes the next marker in the sequence. The list beside this panel counts
        on that: its numbers and these have to point at the same things.
      */}
      <div className="border-indigo-deep/60 flex items-center gap-2.5 border-t px-5 py-3.5">
        <Marker index={rows.length + 1} />
        <span className="text-mist/60 text-xs">{state}</span>
      </div>
    </div>
  );
}

/** One stage on a latency lane. */
export interface LatencyStop {
  label: string;
  day: string;
}

/**
 * The same finding on two clocks.
 *
 * The picture the insights page is built on. Two lanes, the same four stages,
 * and the only difference is where along the track they fall. The reader does
 * not have to be told what the gap means; the gap is the argument.
 */
export function LatencyTrack({
  lanes,
}: {
  lanes: readonly {
    name: string;
    tone: "them" | "ours";
    stops: readonly LatencyStop[];
    /** Where each stop sits along the track, 0 to 100. */
    positions: readonly number[];
  }[];
}) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-10">
      {lanes.map((lane) => (
        <div key={lane.name} className="flex flex-col gap-4">
          <span
            className={clsx(
              "text-xs tracking-wide uppercase",
              lane.tone === "ours" ? "text-lavender" : "text-mist/40",
            )}
          >
            {lane.name}
          </span>

          {/*
            Padded at both ends: a label is centred on its stop and 5rem wide,
            so a stop at 0% would hang half a label off the left of the screen.
          */}
          <div className="relative mx-10 h-px">
            <span
              className={clsx(
                "absolute inset-0",
                lane.tone === "ours" ? "bg-lavender/40" : "bg-indigo-deep",
              )}
            />

            {lane.stops.map((stop, index) => (
              <span
                key={stop.label}
                style={{ left: `${(lane.positions[index] ?? 0).toString()}%` }}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-2"
              >
                <span
                  className={clsx(
                    "size-2 -translate-y-1/2 rotate-45 rounded-xs",
                    lane.tone === "ours" ? "bg-lavender" : "bg-indigo",
                  )}
                />
                <span
                  className={clsx(
                    "font-mono text-[0.6rem] tabular-nums",
                    lane.tone === "ours" ? "text-lavender/80" : "text-mist/35",
                  )}
                >
                  {stop.day}
                </span>
                <span
                  className={clsx(
                    "w-20 text-center text-[0.68rem] leading-tight text-pretty",
                    lane.tone === "ours" ? "text-mist/75" : "text-mist/40",
                  )}
                >
                  {stop.label}
                </span>
              </span>
            ))}
          </div>

          {/* The stops are absolutely placed, so the lane needs its own floor. */}
          <span className="block h-14" />
        </div>
      ))}
    </div>
  );
}

/** One message in a thread on a finding. */
export interface ThreadMessage {
  /** Who wrote it. `them` is the reader's own side. */
  side: "pentester" | "them";
  author: string;
  time: string;
  body: string;
  /** The finding the thread hangs on, shown once where it is first attached. */
  attachment?: string;
  /** A state change, shown as a chip rather than as prose. */
  state?: string;
}

/**
 * A thread on a finding.
 *
 * The chat page argues that you talk to the person who found it, so the picture
 * has to show a person answering rather than a widget. Every message carries a
 * name and a time, the pentester's side is the lit one, and the last message is
 * a state change: the conversation ends by closing the finding, which is the
 * part a support widget cannot do.
 */
export function ChatThread({
  messages,
}: {
  messages: readonly ThreadMessage[];
}) {
  return (
    <ol className="flex flex-col gap-4 p-4 sm:p-5">
      {messages.map((message) => {
        const mine = message.side === "pentester";
        return (
          <li
            key={message.time + message.author}
            className={clsx(
              "flex max-w-[85%] flex-col gap-1.5",
              mine ? "self-start" : "self-end",
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={clsx(
                  "text-xs font-medium",
                  mine ? "text-lavender" : "text-mist/55",
                )}
              >
                {message.author}
              </span>
              <span className="text-mist/30 font-mono text-[0.65rem] tabular-nums">
                {message.time}
              </span>
            </span>

            <span
              className={clsx(
                "rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed text-pretty",
                mine
                  ? "border-indigo-deep bg-indigo-deep/35 text-mist/90"
                  : "border-indigo-deep/60 bg-ink/60 text-mist/70",
              )}
            >
              {message.body}
            </span>

            {message.attachment !== undefined && (
              <span className="border-indigo-deep/70 text-mist/50 self-start rounded-md border px-2 py-1 font-mono text-[0.65rem]">
                {message.attachment}
              </span>
            )}

            {message.state !== undefined && (
              <span className="border-success/30 bg-success/10 text-success self-start rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase">
                {message.state}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** How much a control is backed by this month's testing. */
type ControlState = "evidence" | "partial" | "none";

const CONTROL_TONE: Record<ControlState, string> = {
  evidence: "border-lavender/50 bg-lavender/15 text-lavender",
  partial: "border-indigo/60 bg-indigo/20 text-mist/70",
  none: "border-indigo-deep/70 bg-ink text-mist/25",
};

export interface ControlChip {
  /** The Annex A identifier, e.g. "A.8.8". */
  id: string;
  state: ControlState;
}

/**
 * The Annex A controls, as a coverage map.
 *
 * The page's signature picture, and deliberately dense: an auditor's world is a
 * long list of numbered controls, and the honest thing to show is how much of
 * that list a testing programme actually speaks to. Most of it is dim, because
 * most of Annex A is about policy and people rather than anything a pentest can
 * evidence. That is the argument the limits section then makes in words.
 */
export function ControlGrid({
  controls,
}: {
  controls: readonly ControlChip[];
}) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-[repeat(auto-fill,minmax(3.75rem,1fr))] gap-1.5"
    >
      {controls.map((control) => (
        <li
          key={control.id}
          className={clsx(
            "rounded-md border px-2 py-2 text-center font-mono text-[0.7rem] tabular-nums",
            CONTROL_TONE[control.state],
          )}
        >
          {control.id}
        </li>
      ))}
    </ul>
  );
}

/** One control, named, with what backs it. */
export interface ControlRow {
  id: string;
  title: string;
  evidence: string;
}

/** The controls one finding speaks to, with the evidence under each. */
export function ControlList({ rows }: { rows: readonly ControlRow[] }) {
  return (
    <ul className="divide-indigo-deep/60 divide-y">
      {rows.map((row) => (
        <li key={row.id} className="flex flex-col gap-1.5 px-4 py-3.5">
          <span className="flex items-center gap-2.5">
            <span className="border-lavender/40 text-lavender shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[0.65rem]">
              {row.id}
            </span>
            <span className="text-mist min-w-0 text-sm font-medium">
              {row.title}
            </span>
          </span>
          <span className="text-mist/55 pl-1 text-xs leading-relaxed text-pretty">
            {row.evidence}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** One entry in a finding's history. */
export interface TrailEntry {
  time: string;
  actor: string;
  event: string;
  /** The state the finding moved into, where this entry changed it. */
  state?: string;
  /** The closing entry, which is the only one drawn in the success colour. */
  closed?: boolean;
}

/**
 * A finding's own history, as the portal keeps it.
 *
 * Not the chat thread from the expert page: these are system events with
 * timestamps rather than people talking, and the point of the picture is that
 * every state change is recorded by whoever caused it. That trail is what makes
 * a closed finding provable later.
 */
export function StateTrail({ entries }: { entries: readonly TrailEntry[] }) {
  return (
    <ol className="relative flex flex-col">
      {entries.map((entry, index) => (
        <li key={entry.time} className="relative flex gap-4 px-5 py-4">
          {/* The spine, drawn per entry so it stops at the last one instead of
              running past the end of the history. */}
          {index < entries.length - 1 && (
            <span
              aria-hidden="true"
              className="bg-indigo-deep absolute top-8 bottom-0 left-[1.68rem] w-px"
            />
          )}

          <span
            aria-hidden="true"
            className={clsx(
              "relative z-10 mt-1 size-2.5 shrink-0 rotate-45 rounded-xs",
              entry.closed === true ? "bg-success" : "bg-lavender/70",
            )}
          />

          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-mist/35 font-mono text-[0.65rem] tabular-nums">
                {entry.time}
              </span>
              <span className="text-mist/50 text-xs">{entry.actor}</span>
            </span>

            <span className="text-mist/85 text-sm leading-relaxed text-pretty">
              {entry.event}
            </span>

            {entry.state !== undefined && (
              <span
                className={clsx(
                  "mt-0.5 self-start rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide uppercase",
                  entry.closed === true
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-lavender/30 bg-lavender/10 text-lavender",
                )}
              >
                {entry.state}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * The same request, before and after.
 *
 * The proof the retest page is built on. One request, run twice, with the two
 * answers set side by side: the reader does not have to trust a status chip
 * because they can read the response that earned it.
 */
export function RequestPair({
  request,
  before,
  after,
}: {
  request: string;
  before: { label: string; response: string };
  after: { label: string; response: string };
}) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="border-indigo-deep bg-ink-deep rounded-lg border px-4 py-3">
        <span className="text-mist/70 font-mono text-xs break-all">
          {request}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
        {(
          [
            ["before", before, "border-ember/30 bg-ember/[0.06] text-ember"],
            [
              "after",
              after,
              "border-success/30 bg-success/[0.06] text-success",
            ],
          ] as const
        ).map(([key, side, tone]) => (
          <div
            key={key}
            className={clsx("flex flex-col gap-2 rounded-lg border p-4", tone)}
          >
            <span className="text-[0.65rem] font-medium tracking-wide uppercase">
              {side.label}
            </span>
            <span className="text-mist/85 font-mono text-xs break-all">
              {side.response}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** One line of command output. */
export interface TerminalLine {
  text: string;
  tone?: "muted" | "warn" | "fail" | "ok";
}

const TERMINAL_TONE = {
  muted: "text-mist/40",
  warn: "text-warning/90",
  fail: "text-ember",
  ok: "text-success",
} as const;

/**
 * A pipeline check, as the pipeline prints it.
 *
 * The one place on these pages where the product is shown as text rather than
 * as an interface, because that is genuinely where it appears: a gate in a
 * build runs a command and reads what comes back. Dressing that up as a panel
 * with rows would be drawing a screen that does not exist.
 */
export function TerminalBlock({
  command,
  lines,
}: {
  command: string;
  lines: readonly TerminalLine[];
}) {
  return (
    <div
      aria-hidden="true"
      className="border-indigo-deep bg-ink-deep flex flex-col gap-1 overflow-x-auto rounded-xl border p-5 font-mono text-xs leading-relaxed"
    >
      <span className="text-mist/70 whitespace-nowrap">
        <span className="text-lavender">$ </span>
        {command}
      </span>

      {lines.map((line) => (
        <span
          key={line.text}
          className={clsx(
            "whitespace-nowrap",
            TERMINAL_TONE[line.tone ?? "muted"],
          )}
        >
          {line.text}
        </span>
      ))}
    </div>
  );
}

/** A finding as it arrives in a developer's backlog. */
export function TicketCard({
  id,
  title,
  labels,
  footer,
}: {
  id: string;
  title: string;
  labels: readonly string[];
  footer: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="border-indigo-deep bg-ink-deep flex flex-col gap-3 rounded-xl border p-4"
    >
      <span className="text-mist/40 font-mono text-[0.65rem]">{id}</span>

      <span className="text-mist text-sm leading-snug font-medium text-pretty">
        {title}
      </span>

      <span className="flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <span
            key={label}
            className="border-indigo-deep/70 bg-ink text-mist/55 rounded-md border px-2 py-0.5 text-[0.65rem]"
          >
            {label}
          </span>
        ))}
      </span>

      <span className="border-indigo-deep/60 text-mist/45 border-t pt-2.5 text-xs">
        {footer}
      </span>
    </div>
  );
}

/** One routing rule: what matches on the left, where it goes on the right. */
export interface RoutingRule {
  match: string;
  destination: string;
}

/**
 * Where findings go, as rules rather than as prose.
 *
 * A condition and a destination on one line, which is the shape the reader
 * already knows from every alerting tool they run. Written out as sentences it
 * would read as marketing; written as rules it reads as configuration.
 */
export function RoutingRules({ rules }: { rules: readonly RoutingRule[] }) {
  return (
    <ul className="divide-indigo-deep/60 divide-y">
      {rules.map((rule) => (
        <li
          key={rule.match}
          className="grid grid-cols-[minmax(0,1fr)] gap-1 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
        >
          <span className="text-mist/80 min-w-0 text-sm leading-relaxed text-pretty">
            {rule.match}
          </span>
          <span className="text-lavender font-mono text-xs sm:text-right">
            {rule.destination}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Says once, quietly, that the numbers above are made up. */
export function SampleNote({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <p className={clsx("text-mist/35 text-xs", className)}>
      {t("argusUi.sample")}
    </p>
  );
}
