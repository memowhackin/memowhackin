import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { useReveal } from "@/components/common/useReveal";

/** One question, open on click and present in the markup either way. */
function FaqEntry({
  serviceKey,
  entry,
  index,
}: {
  serviceKey: string;
  entry: string;
  index: number;
}) {
  const { t } = useTranslation();
  const { ref, className, style } = useReveal<HTMLDetailsElement>({
    delay: Math.min(index, 4) * 60,
  });

  return (
    /*
     * A native `<details>`, not a state-driven panel. The answer is in the
     * document whether or not it is open, which is what a crawler and an answer
     * engine read — an accordion that mounts its answer on click ships a page of
     * questions with no answers on it. It also keeps the keyboard and the
     * screen-reader behaviour the browser already implements correctly.
     *
     * A hairline above rather than a box around, which is how the ruled lists
     * on these pages are drawn (see the coverage grid and the process rail).
     * The rule is the only thing that changes colour on open, so an opened
     * question is marked without the row growing a border it did not have.
     */
    <details
      ref={ref}
      style={style}
      data-testid={`service-faq-${entry}`}
      className={clsx(
        "faq-reveal group border-indigo-deep/60 open:border-lavender/50 border-t transition-colors",
        className,
      )}
    >
      {/*
        The number sits in a column of its own rather than inline, so the
        questions all start at the same x whatever their index — the same figure
        the coverage cells make with their icons. It is decorative: the ordinal
        is a reading aid, and announcing "zero one" before every question is
        noise on a screen reader.

        Below `sm` the column is dropped entirely; a phone needs the width for
        the question more than it needs the count.
      */}
      <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-5 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-6 sm:py-6 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="font-display text-lavender/60 group-open:text-lavender hidden pt-1 text-sm tabular-nums transition-colors sm:block"
        >
          {(index + 1).toString().padStart(2, "0")}
        </span>

        <h3 className="text-mist group-hover:text-lavender-soft group-open:text-lavender-soft text-base leading-snug font-medium text-pretty transition-colors sm:text-lg">
          {t(`servicePages.${serviceKey}.faq.items.${entry}.q`)}
        </h3>

        {/*
          A plus that turns into a cross on open, rather than a chevron. Both
          states of a chevron are an arrow pointing somewhere; the plus/cross
          pair says "there is more here" and "close this" without either reading
          as a direction. It fills with the brand lavender when open, which is
          the one piece of colour the section takes.
        */}
        <span
          aria-hidden="true"
          className="border-indigo-deep bg-ink-deep/60 text-lavender group-hover:border-lavender/60 group-open:border-lavender group-open:bg-lavender group-open:text-ink-deep flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors sm:size-9"
        >
          <Plus className="size-4 transition-transform duration-300 group-open:rotate-45" />
        </span>
      </summary>

      {/* Indented onto the question's column: 2rem of number plus the 1.5rem
          gap above, which is why both are written as fixed track and gap rather
          than left to `auto`. */}
      <p className="text-mist/80 max-w-prose pb-6 text-base leading-relaxed text-pretty sm:pl-14">
        {t(`servicePages.${serviceKey}.faq.items.${entry}.a`)}
      </p>
    </details>
  );
}

/**
 * A page's questions, answered on the page.
 *
 * Shared by the pentest template and the awareness page, which are otherwise
 * built quite differently: the questions a buyer asks are the same *kind* of
 * thing whatever the service, and two copies of an accordion is how two pages
 * end up opening at different speeds.
 *
 * The heading lives here rather than in the pages, because it is half of the
 * layout: on a wide screen it holds a column of its own and stays with the
 * reader while they work down the list. Both callers name their block the same
 * way (`servicePages.<key>.faq.title`), so one lookup covers them.
 */
export function ServiceFaq({
  serviceKey,
  entries,
}: {
  serviceKey: string;
  entries: readonly string[];
}) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
      {/*
        `self-start` is what makes `sticky` do anything: a grid item stretches
        to its row by default, so the rail would already be as tall as the
        questions and have nothing to travel over.
      */}
      <div
        ref={ref}
        className={clsx(
          "flex flex-col gap-5 lg:sticky lg:top-32 lg:self-start",
          className,
        )}
      >
        <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
          {t(`servicePages.${serviceKey}.faq.title`)}
        </h2>

        {/*
          Deliberately not the `brand-rule` utility, which opens on `ink-deep`:
          on this background its first third would be the page colour and the
          accent would fade in from nothing. Same trap `ServiceComparison`
          documents for its column heads.
        */}
        <span aria-hidden="true" className="bg-lavender/70 h-px w-16" />
      </div>

      <div className="border-indigo-deep/60 flex flex-col border-b">
        {entries.map((entry, index) => (
          <FaqEntry
            key={entry}
            serviceKey={serviceKey}
            entry={entry}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
