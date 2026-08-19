import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { ScanKind, ScanStatus } from "@/config/scanner";

/*
 * The waiting state.
 *
 * The previous version was a bordered panel holding a spinner, a column of
 * tick marks and a stage list — the default shape of a dashboard task widget,
 * and the same construction as every other box on the page.
 *
 * This is the same information as a line of type. The current stage is the
 * largest thing on screen; the stages already done are set beneath it, quiet
 * and struck through their own weight rather than decorated with ticks; a
 * single hairline advances across the measure as the server reports progress.
 *
 * The animation is deliberately slow and eased. What it must not do is imply
 * work that is not happening: the line advances only when the status changes,
 * and it eases into its new position over a second rather than creeping
 * continuously, because a bar that moves on its own timer is telling the
 * reader something the server never said. Under reduced motion it simply
 * jumps, which is honest and still legible.
 */

const STAGES: readonly ScanStatus[] = [
  "discovering",
  "analyzing",
  "correlating",
  "generating_report",
];

interface ScanProgressProps {
  kind: ScanKind;
  status: ScanStatus;
}

export function ScanProgress({ kind, status }: ScanProgressProps) {
  const { t } = useTranslation();

  const current = STAGES.indexOf(status);
  const reached = status === "queued" ? -1 : current;
  const done = Math.max(reached, 0);
  // Queued sits just off zero, so the line is visible before the first stage
  // rather than appearing from nothing.
  const fraction = status === "queued" ? 0.04 : (reached + 1) / STAGES.length;

  const label =
    status === "queued"
      ? t("scanner.progress.queued")
      : t(`scanner.stages.${kind}.${status}`, {
          defaultValue: t("scanner.progress.working"),
        });

  return (
    <div data-testid="scan-progress" className="flex max-w-2xl flex-col gap-10">
      <div className="flex flex-col gap-5">
        {/*
          One polite live region carrying a whole sentence. A screen reader
          announcing four list items every time one changes state is noise;
          "step two of four, reviewing website controls" is the information.
        */}
        <p
          aria-live="polite"
          aria-atomic="true"
          data-testid="scan-progress-status"
          className="font-display text-mist text-2xl leading-snug font-normal text-balance sm:text-3xl"
        >
          {label}
        </p>

        <p className="text-mist/45 text-sm">
          {status === "queued"
            ? t("scanner.progress.queuedHint")
            : t("scanner.progress.step", {
                step: Math.max(reached + 1, 1),
                total: STAGES.length,
              })}
        </p>
      </div>

      {/*
        The measure. A single hairline the width of the column, filled to the
        fraction the server has actually reported.
      */}
      <div className="bg-indigo-deep/70 relative h-px w-full overflow-hidden rounded-full">
        <span
          className="bg-lavender absolute inset-y-0 left-0 block rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none"
          style={{ width: `${String(Math.round(fraction * 100))}%` }}
        />
      </div>

      {/*
        The stages, as a plain run of text rather than a checklist. The one in
        progress is lit, the finished ones are dimmed, and the rest are
        dimmer still, so the reader can see the shape of the whole job without
        four rows of iconography.
      */}
      <ol className="flex flex-col gap-2.5">
        {STAGES.map((stage, index) => {
          const isDone = index < done || (index === done && reached > index);
          const isActive = index === reached;

          return (
            <li
              key={stage}
              data-testid={`scan-stage-${stage}`}
              data-state={isActive ? "active" : isDone ? "done" : "pending"}
              className={clsx(
                "text-sm leading-relaxed transition-colors duration-500",
                isActive && "text-mist",
                isDone && !isActive && "text-mist/50",
                !isDone && !isActive && "text-mist/25",
              )}
            >
              {t(`scanner.stages.${kind}.${stage}`)}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
