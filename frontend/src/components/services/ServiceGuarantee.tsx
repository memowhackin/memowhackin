import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import { useReveal } from "@/components/common/useReveal";
import type { ServiceDefinition } from "@/config/services";

/*
 * The three things a reader actually wants to know once a promise like this is
 * made, in the order they think of them: what a finding is, what happens to
 * the bill, and whether the work still ends with something in their hands.
 */
const TERMS = ["counts", "pay", "keep"] as const;

const TYPES_OUT = "(prefers-reduced-motion: no-preference)";

/*
 * Typing speed. Fast enough not to hold the reader up, slow enough to be
 * legible as typing rather than as a stutter on first paint; the two pauses
 * are what make it read as a question being asked and then answered instead of
 * one long string.
 */
const CHARACTER_MS = 78;
const SENTENCE_MS = 420;
const ANSWER_MS = 900;

/*
 * The glow behind the statement. It is a wash rather than a border, because the
 * lift here has to come from light: this card sits inside a panel that already
 * carries a rounded edge, and a second outline around it read as a coupon
 * stapled to the comparison.
 */
const GUARANTEE_WASH = {
  background:
    "radial-gradient(120% 140% at 8% 0%, color-mix(in oklab, var(--color-indigo-bright) 30%, transparent) 0%, color-mix(in oklab, var(--color-indigo-deep) 22%, transparent) 42%, transparent 78%)",
} as const;

interface TypedLineProps {
  text: string;
  /** How many of this line's characters have been typed so far. */
  typed: number;
  /**
   * Whether the caret currently sits on this line. It belongs to the act of
   * typing, so once the statement is finished no line carries one: a cursor
   * blinking under a finished sentence reads as an input waiting for the
   * reader rather than as a promise.
   */
  caret: boolean;
  className?: string;
}

/**
 * One line of the statement, revealed a character at a time.
 *
 * Every character is in the document from the first paint and stays there —
 * the untyped ones are transparent, not absent. That is what keeps the page
 * the crawler is served (and the one a screen reader reads) the finished
 * sentence rather than an empty line, and it is also why nothing reflows as
 * the line fills: the space was always taken.
 *
 * The caret is placed between the two halves rather than after the line, so it
 * sits where the next character will land.
 *
 * Each character carries a `data-testid` for one reason that is not testing:
 * the prerenderer holds its snapshot until every element with one is at full
 * opacity (`scripts/prerender.mjs`). Without that the build froze whatever had
 * been typed by the time it looked into the HTML crawlers are served — the
 * question typed out and the answer invisible under it.
 */
function TypedLine({ text, typed, caret, className }: TypedLineProps) {
  const characters = useMemo(() => Array.from(text), [text]);

  return (
    <span className={className}>
      {characters.map((character, index) => (
        <span
          key={`${index.toString()}-${character}`}
          data-testid="typed-character"
          className={clsx(index >= typed && "opacity-0")}
        >
          {character}
        </span>
      ))}

      {caret && (
        <span
          aria-hidden="true"
          className="bg-lavender motion-safe:animate-caret-blink ml-0.5 inline-block h-[0.9em] w-0.5 translate-y-[0.06em]"
        />
      )}
    </span>
  );
}

/**
 * The no-cure-no-pay promise, as the payoff of the comparison above it.
 *
 * It is typed out because the promise is a question with an answer, and a
 * question that arrives already answered is not one. The typing starts when
 * the card is scrolled to — not on mount, which would spend the whole
 * animation on a screen nobody is looking at yet — and is skipped entirely
 * where reduced motion is asked for, which is also the state every non-browser
 * host lands in, so tests and the prerenderer see the finished lines.
 *
 * The terms below the statement are the detail that makes it a promise rather
 * than a slogan: what counts, what it costs, what you keep. They are a `<dl>`
 * because that is what they are — three terms and their definitions.
 */
export function ServiceGuarantee({ service }: { service: ServiceDefinition }) {
  const { t } = useTranslation();
  const { ref, className, revealed } = useReveal<HTMLDivElement>();
  const typesOut = useMediaQuery(TYPES_OUT);

  const key = (suffix: string) =>
    `servicePages.${service.key}.comparison.guarantee.${suffix}`;

  const question = t(key("question"));
  const answer = t(key("answer"));
  const total = question.length + answer.length;

  const [typed, setTyped] = useState(() => (typesOut ? 0 : total));

  useEffect(() => {
    if (!typesOut || !revealed || typed >= total) return;

    /*
     * The delay before the *next* character, worked out from the one just
     * typed: a beat after the question mark, a longer one before the answer
     * opens. Anything else runs at the plain rate.
     */
    function delay(): number {
      if (typed === question.length) return ANSWER_MS;
      if (/[?.]/.test(question[typed - 1] ?? "")) return SENTENCE_MS;
      return CHARACTER_MS;
    }

    const timer = setTimeout(() => {
      setTyped(typed + 1);
    }, delay());

    return () => {
      clearTimeout(timer);
    };
  }, [typesOut, revealed, typed, total, question]);

  const askedTo = Math.min(typed, question.length);
  const answeredTo = Math.max(0, typed - question.length);

  return (
    <div
      ref={ref}
      data-testid="service-comparison-guarantee"
      className={clsx(
        "bg-ink-deep/85 rounded-2xl relative isolate mt-6 overflow-hidden p-6 sm:p-8 lg:p-10",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={GUARANTEE_WASH}
      />

      {/*
        The question in the reading colour and the answer in the accent: the
        pair is one statement, and colour is what tells you which half is the
        promise. Mono, because that is the display face here and because a
        caret belongs at the end of a monospaced line.

        It opens a step smaller than it ends: at the size it takes on a desktop
        the Dutch question breaks after its first word on a phone, and a
        statement typed out over two ragged lines loses the shape that makes it
        one.
      */}
      <p className="font-display flex flex-col text-2xl font-normal tracking-tight sm:text-3xl lg:text-4xl">
        <TypedLine
          text={question}
          typed={askedTo}
          caret={typed < question.length}
          className="text-mist/70"
        />
        <TypedLine
          text={answer}
          typed={answeredTo}
          caret={typed >= question.length && typed < total}
          className="text-lavender"
        />
      </p>

      <p className="text-mist/75 mt-5 max-w-2xl text-base leading-relaxed text-pretty">
        {t(key("body"))}
      </p>

      <dl className="border-lavender/15 mt-8 grid gap-6 border-t pt-8 sm:grid-cols-3 sm:gap-8">
        {TERMS.map((term) => (
          <div key={term} className="flex flex-col gap-2">
            <dt className="text-mist/45 text-xs font-medium tracking-[0.06em] uppercase">
              {t(key(`terms.${term}.term`))}
            </dt>
            <dd className="text-mist text-base leading-relaxed text-pretty">
              {t(key(`terms.${term}.detail`))}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
