import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { SampleNote } from "@/components/argus/PortalUI";
import { useSequence } from "@/components/argus/useSequence";

/*
 * The animated walkthrough each ARGUS page opens its argument with.
 *
 * One engine, three stories. The steps are real text — titles and one-line
 * bodies that a crawler reads and a screen reader hears — and the stage beside
 * them is the illustration, swapping a drawn fragment of the portal per step.
 * The reader can let it run or take a step themselves; taking one stops the
 * autoplay, because a page that wrestles the controls back is a page arguing
 * with its reader.
 *
 * Stages are stacked in a single grid cell rather than mounted and unmounted,
 * so the tallest one sets the height once and nothing below the scene ever
 * moves — the transition is opacity and a small translate, both composited.
 */

interface FlowSceneProps {
  /** i18n prefix; steps live at `<base>.steps.<step>.{title,body}`. */
  base: string;
  steps: readonly string[];
  /** One stage per step, same order. */
  stages: readonly ReactNode[];
  /** Dwell per step in milliseconds. */
  stepMs?: number;
  /**
   * `side` runs the steps down a rail beside the stage; `top` runs them as a
   * row above it. The engine is shared; the rhythm belongs to the page.
   */
  layout?: "side" | "top";
  "data-testid": string;
}

function StepButton({
  base,
  step,
  index,
  active,
  layout,
  onSelect,
}: {
  base: string;
  step: string;
  index: number;
  active: boolean;
  layout: "side" | "top";
  onSelect: () => void;
}) {
  const { t } = useTranslation();

  return (
    <li className={clsx(layout === "top" && "min-w-0 flex-1")}>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "step" : undefined}
        data-testid={`flow-step-${step}`}
        className={clsx(
          "group w-full cursor-pointer text-left transition-colors",
          layout === "side"
            ? "grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-3 border-t py-3.5 sm:gap-4"
            : "flex h-full flex-col gap-1.5 border-t pt-3 pb-1",
          active ? "border-lavender/60" : "border-indigo-deep/60",
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            "font-display text-sm tabular-nums transition-colors",
            active ? "text-lavender" : "text-lavender/40",
          )}
        >
          {(index + 1).toString().padStart(2, "0")}
        </span>

        <span className="flex min-w-0 flex-col gap-1">
          <span
            className={clsx(
              "font-display text-base font-normal transition-colors",
              active ? "text-mist" : "text-mist/60 group-hover:text-mist/85",
            )}
          >
            {t(`${base}.steps.${step}.title`)}
          </span>

          {/*
            The one-line body rides only in the side rail. The top row is a
            strip of headings by design — six explanations across it would wrap
            into six ragged columns of prose.
          */}
          {layout === "side" && (
            <span
              className={clsx(
                "text-sm leading-relaxed text-pretty transition-colors",
                active ? "text-mist/75" : "text-mist/50",
              )}
            >
              {t(`${base}.steps.${step}.body`)}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

export function FlowScene({
  base,
  steps,
  stages,
  stepMs = 3200,
  layout = "side",
  "data-testid": testId,
}: FlowSceneProps) {
  const { ref, active, select } = useSequence<HTMLDivElement>(
    steps.length,
    stepMs,
  );

  return (
    <div
      ref={ref}
      data-testid={testId}
      className={clsx(
        "grid grid-cols-1 gap-8",
        layout === "side"
          ? "items-center lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14"
          : "gap-10",
      )}
    >
      <ol
        className={clsx(
          layout === "side"
            ? "border-indigo-deep/60 flex flex-col border-b"
            : "grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:items-stretch sm:gap-8",
        )}
      >
        {steps.map((step, index) => (
          <StepButton
            key={step}
            base={base}
            step={step}
            index={index}
            active={index === active}
            layout={layout}
            onSelect={() => {
              select(index);
            }}
          />
        ))}
      </ol>

      <div className="flex min-w-0 flex-col gap-3">
        {/* Illustration only: the steps beside it are the readable story.
            The single track is pinned to the available width — an auto track
            takes the widest stage's min-content, and one long mono string in
            one stage then drags every stage past a phone's edge. */}
        <div aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)]">
          {stages.map((stage, index) => (
            <div
              key={steps[index]}
              className={clsx(
                "transition-[opacity,translate] duration-500 [grid-area:1/1]",
                index === active
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-2 opacity-0",
              )}
            >
              {stage}
            </div>
          ))}
        </div>

        <SampleNote />
      </div>
    </div>
  );
}
