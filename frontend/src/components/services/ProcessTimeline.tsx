import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { CrossingMark } from "@/components/common/CrossingMark";
import { useReveal } from "@/components/common/useReveal";
import { useTimelineProgress } from "@/components/common/useTimelineProgress";
import { StepGlyph } from "@/components/services/StepGlyph";
import { stepTone } from "@/components/services/stepTone";
import { SectionShell } from "@/components/common/SectionShell";
import type { ServiceDefinition } from "@/config/services";

/*
 * The band a step has to enter before it counts as the one being read, written
 * as the margin that shrinks the observer's root down to it.
 *
 * All but a sliver of the viewport is cropped away, so what is left is
 * essentially the line across the middle of the screen. The steps tile — their
 * spacing is padding inside each row, not a gap between rows — so that line is
 * inside exactly one of them at any moment, and "which step is being read" has
 * one answer rather than a shortlist.
 *
 * It was the middle tenth to begin with, which on a wide screen is taller than
 * a step: two rows sat in it at once, the tie went to the upper one, and the
 * highlight trailed a step behind the reader all the way down the rail. Not
 * quite zero height, though — a root cropped to nothing is where browsers stop
 * agreeing about what intersects it.
 *
 * An IntersectionObserver rather than a measurement per scroll frame, because
 * this answer changes six times in the length of the section and a reading per
 * frame would be several hundred. The rail's fill is the part that has to move
 * continuously, and that never touches React at all.
 */
const FOCUS_BAND = "-49% 0px -49% 0px";

/**
 * The mark on the rail.
 *
 * The same diamond `RuleNode` draws at the hairline crossings, but in flow
 * rather than positioned, and carrying states a crossing never has — so it is
 * its own element instead of a set of props grafted onto that one.
 */
function StepNode({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        /*
         * Centred in its own column, which is what puts it on the rail: the
         * column is 1rem and the mark is half that, so left-aligned it sat a
         * quarter of a rem to the side of the line it is supposed to be a
         * station on.
         *
         * Nudged down onto the number's first line rather than the top of its
         * box, because the rail runs the full height of the list behind it and
         * the mark has to meet the line the eye actually reads.
         */
        "mt-2 size-2 justify-self-center rotate-45 rounded-xs lg:mt-3",
        "motion-safe:transition-[background-color,box-shadow] motion-safe:duration-500",
        /*
         * The active station is the brand lavender with one thin ring of the
         * page around it, and that is the whole of it. A halo and a scale-up
         * were tried and both went: a 2px diamond that swells and glows is the
         * kind of emphasis that reads as a widget rather than as a rule with a
         * station on it, and the number and copy beside it already say which
         * step this is.
         */
        active
          ? "bg-lavender shadow-[0_0_0_0.3rem_rgba(173,157,238,0.14)]"
          : "bg-[var(--step-tone)] opacity-70 group-hover:opacity-100",
      )}
    />
  );
}

/**
 * One end of the rail: what the sequence starts from, and what it ends in.
 *
 * Without these the rail ran off the top and bottom of the list, which left six
 * numbered steps and no statement about where the process opens or what it
 * closes on. The two ends are deliberately not symmetric — the start is a plain
 * tick across the line, the finish is the brand mark — so the sequence reads as
 * running towards something rather than between two identical pins.
 */
function RailEnd({ label, tone }: { label: string; tone: "start" | "finish" }) {
  const finish = tone === "finish";

  return (
    <div
      className={clsx(
        "grid grid-cols-[1rem_minmax(0,1fr)] items-center gap-x-5 sm:gap-x-8",
        finish ? "pt-8 lg:pt-10" : "pb-8 lg:pb-10",
      )}
    >
      {finish ? (
        <CrossingMark className="justify-self-center" />
      ) : (
        <span
          aria-hidden="true"
          className="bg-indigo-deep h-px w-4 justify-self-center"
        />
      )}

      <span
        className={clsx("eyebrow", finish ? "text-lavender" : "text-mist/70")}
      >
        {label}
      </span>
    </div>
  );
}

function ProcessStep({
  service,
  step,
  index,
  total,
  active,
}: {
  service: ServiceDefinition;
  step: string;
  index: number;
  total: number;
  active: boolean;
}) {
  const { t } = useTranslation();
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: Math.min(index, 4) * 60,
  });

  return (
    <li
      ref={ref}
      // The reveal's own delay, and the tone this step takes from the ramp.
      style={{ ...style, ...stepTone(index, total) }}
      data-step-index={index}
      data-testid={`service-step-${step}`}
      /*
       * `aria-current` is the whole of what the highlight means, said in the
       * one word assistive technology already understands. Everything else
       * here — the lit node, the brightened number — is decoration on top of
       * it, and none of it is the only way to tell where you are: the list is
       * numbered and every step's copy is on the page, in full, at all times.
       * Nothing is behind a hover, so there is nothing a keyboard cannot reach.
       */
      aria-current={active ? "step" : undefined}
      className={clsx(
        "group grid grid-cols-[1rem_minmax(0,1fr)] gap-x-5 pb-9 last:pb-0 sm:gap-x-8 lg:pb-12",
        className,
      )}
    >
      <StepNode active={active} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-8">
        {/*
          The anchor column: the number, and beside it the mark for what this
          step does. Side by side on a phone, where stacking them would push the
          copy down a line and buy nothing.

          Both are set on the same left edge and the column is a fixed width, so
          six rows of a two-digit number and a mark line up exactly rather than
          each finding its own left edge.
        */}
        <div className="flex items-center gap-4 sm:w-20 sm:flex-col sm:items-start sm:gap-3 lg:w-24">
          <span
            aria-hidden="true"
            className={clsx(
              "font-display shrink-0 text-3xl leading-none tabular-nums text-[var(--step-tone)] sm:text-4xl lg:text-5xl",
              "motion-safe:transition-opacity motion-safe:duration-500",
              /*
               * The number and the mark are the only things that dim, and even
               * the dim end is legible rather than a ghost. The step being read
               * is said by the lit station on the rail beside it; fading the
               * other five towards the page — which is what this section used
               * to do to its copy as well — bought that emphasis by making five
               * sixths of the section hard to read.
               */
              active ? "opacity-100" : "opacity-65 group-hover:opacity-90",
            )}
          >
            <span className="opacity-45">0</span>
            {index + 1}
          </span>

          <StepGlyph step={step} active={active} />
        </div>

        <div className="flex flex-col gap-2">
          <h3
            className={clsx(
              "font-display text-xl font-normal text-balance sm:text-2xl",
              "motion-safe:transition-colors motion-safe:duration-500",
              active ? "text-lavender-soft" : "text-mist",
            )}
          >
            {t(`servicePages.${service.key}.process.steps.${step}.title`)}
            {/*
              The site sets its display headings with a full stop ("An assistsec
              report."), so the mark is already the house voice. Taking the
              accent lets it do a second job as the row's smallest piece of
              brand — and it stays out of the translation files, where a
              decorative glyph would be one more thing for a translator to drop.
            */}
            <span aria-hidden="true" className="text-lavender">
              .
            </span>
          </h3>

          <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
            {t(`servicePages.${service.key}.process.steps.${step}.body`)}
          </p>
        </div>
      </div>
    </li>
  );
}

/**
 * The stages of an engagement, as a rail the reader fills by scrolling.
 *
 * The rail is one line drawn twice: the track, and the brand ramp over it
 * scaled to how far into the section the reader has come. Which step is lit is
 * a separate question with a separate answer — an observer watching a band
 * across the middle of the screen — because the two change at completely
 * different rates, and driving the highlight off the scroll position would put
 * a render on every frame to answer a question that changes six times.
 *
 * The rail belongs to this wrapper rather than to the list, so it can run
 * through both ends: it begins at the tick above the first step and finishes on
 * the brand mark below the last, which is what makes six numbered rows read as
 * a route with a start and a destination.
 */
function ProcessRail({
  service,
  activeIndex,
  onActiveChange,
}: {
  service: ServiceDefinition;
  activeIndex: number;
  onActiveChange: (index: number) => void;
}) {
  const timelineRef = useTimelineProgress<HTMLDivElement>();
  const { t } = useTranslation();
  const total = service.process.length;

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline || typeof IntersectionObserver === "undefined") return;

    const steps = timeline.querySelectorAll<HTMLLIElement>(
      "li[data-step-index]",
    );
    if (steps.length === 0) return;

    /*
     * More than one step can be inside the band at once — they are shorter than
     * it is on a wide screen — and the one that owns the focus is the highest
     * of them. Tracking the set rather than the last event is what keeps that
     * answer stable when two steps cross the band on the same frame, in
     * whichever order the observer happens to report them.
     */
    const inBand = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number(entry.target.getAttribute("data-step-index"));
          if (entry.isIntersecting) inBand.add(index);
          else inBand.delete(index);
        }

        // Scrolled clean past the section: hold the last step rather than
        // dropping the highlight, which would read as the rail switching off.
        if (inBand.size > 0) onActiveChange(Math.min(...inBand));
      },
      { rootMargin: FOCUS_BAND },
    );

    for (const step of steps) observer.observe(step);

    return () => {
      observer.disconnect();
    };
  }, [timelineRef, onActiveChange]);

  return (
    <div ref={timelineRef} className="relative flex flex-col">
      {/*
        The track and the fill over it, both a hairline on the column the marks
        sit in: that cell is 1rem wide, so its centre — and theirs — is 0.5rem.

        `inset-y-0` spans the ends as well as the steps, so the line begins at
        the tick and stops at the mark rather than bleeding past both.
      */}
      <span
        aria-hidden="true"
        className="bg-indigo-deep pointer-events-none absolute inset-y-0 left-2 w-px -translate-x-1/2"
      />
      <span
        aria-hidden="true"
        /*
         * `scaleY` on a composited layer rather than a height: the fill is
         * repainted on every scroll frame, and growing a box would put layout
         * and paint on that frame instead of a transform the compositor
         * already owns. The custom property is written by `useTimelineProgress`
         * outside React entirely — see the hook for why it is not smoothed.
         */
        className="brand-sweep-y pointer-events-none absolute inset-y-0 left-2 w-px origin-top -translate-x-1/2 scale-y-[var(--timeline-progress,0)]"
      />

      <RailEnd tone="start" label={t("servicePages.labels.timelineStart")} />

      <ol className="flex flex-col">
        {service.process.map((step, index) => (
          <ProcessStep
            key={step}
            service={service}
            step={step}
            index={index}
            total={total}
            active={index === activeIndex}
          />
        ))}
      </ol>

      <RailEnd tone="finish" label={t("servicePages.labels.timelineFinish")} />
    </div>
  );
}

/**
 * How an engagement runs, start to finish.
 *
 * One layout at every width. This section used to pin itself on a wide screen
 * and spend the reader's scroll walking six panels sideways — which meant two
 * sets of markup for one piece of content, a measured section height, and a
 * page that stopped answering the scroll wheel for the length of it. The rail
 * says the same thing in one shape, and lets the reader keep their scroll.
 *
 * The heading rides in a column of its own on a wide screen and stays with the
 * reader down the length of the list, which is what the pin was really for: the
 * question the six steps answer, on screen for as long as they are.
 */
export function ProcessTimeline({ service }: { service: ServiceDefinition }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, className } = useReveal<HTMLDivElement>();

  return (
    <SectionShell
      className="bg-transparent"
      data-testid={`service-${service.key}-process`}
      innerClassName="pb-16 lg:pb-24"
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        {/*
          `self-start` is what makes `sticky` do anything: a grid item stretches
          to its row by default, so the rail would already be as tall as the
          steps and have nothing to travel over.
        */}
        <div
          ref={ref}
          className={clsx(
            "flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start",
            className,
          )}
        >
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`servicePages.${service.key}.process.title`)}
          </h2>

          <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty">
            {t(`servicePages.${service.key}.process.intro`)}
          </p>

          {/*
            Where the reader has got to, in the same figures the rail is
            numbered in. It is the one thing the pinned track did better than a
            plain list — you could see the whole sequence at once — said in two
            numbers instead of a hijacked scroll.

            Hidden from assistive technology: the list is an ordered one and the
            step being read already carries `aria-current`, so this would be a
            third telling of something said twice.
          */}
          <div
            aria-hidden="true"
            className="border-indigo-deep mt-2 hidden w-fit items-baseline gap-2 border-t pt-4 lg:flex"
          >
            <span className="font-display text-lavender text-2xl tabular-nums">
              {(activeIndex + 1).toString().padStart(2, "0")}
            </span>
            <span className="text-mist/55 font-display text-base tabular-nums">
              / {service.process.length.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        <ProcessRail
          service={service}
          activeIndex={activeIndex}
          onActiveChange={setActiveIndex}
        />
      </div>
    </SectionShell>
  );
}
