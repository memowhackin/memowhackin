import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { useMediaQuery } from "@/components/common/useMediaQuery";

/*
 * The fill is a reading aid, not decoration, but it is still movement tied to
 * the scroll — so where reduced motion is asked for the statement is simply
 * delivered whole rather than doled out. Deciding it here rather than in CSS
 * also skips the scroll listener entirely in that case.
 */
const FILL_ON_SCROLL = "(prefers-reduced-motion: no-preference)";

/*
 * Where in the viewport the fill starts and finishes, as a share of its height,
 * measured against the top of the statement.
 *
 * It completes well before the statement leaves the screen: a fill that ran to
 * the top edge finished on a line the reader had already passed, which reads as
 * lagging behind them rather than moving with them.
 */
const FILL_START = 0.85;
const FILL_END = 0.4;

interface ScrollFillTextProps {
  /** The sentence to fill. Split on whitespace; punctuation rides along. */
  children: string;
  className?: string;
}

interface FillStyle extends CSSProperties {
  "--word-count": number;
}

interface WordStyle extends CSSProperties {
  "--word-index": number;
}

interface Word {
  id: string;
  text: string;
  style: WordStyle;
}

function splitWords(text: string): readonly Word[] {
  return text
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word, index) => ({
      id: `${index.toString()}-${word}`,
      text: word,
      style: { "--word-index": index },
    }));
}

/**
 * A statement that fills in as it is scrolled through: the words start at the
 * muted weight the copy already uses and come up to full strength one after
 * another, so the eye is led along the sentence rather than handed all of it at
 * once.
 *
 * The scroll handler writes a single `--fill` on the wrapper and nothing else —
 * no state, so no re-render per frame — and each word works out its own weight
 * from that and its index (see `scroll-fill-word` in `index.css`). Without
 * JavaScript, or where reduced motion is asked for, `--fill` is never written
 * and its default leaves every word at full strength.
 */
export function ScrollFillText({ children, className }: ScrollFillTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const fillsOnScroll = useMediaQuery(FILL_ON_SCROLL);
  const words = useMemo(() => splitWords(children), [children]);

  useEffect(() => {
    if (!fillsOnScroll) return;

    let frame = 0;

    function update() {
      frame = 0;

      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight;

      // Both are positions for the *top* of the statement: it starts filling
      // when its top crosses the lower line, and is full once its foot has
      // reached the upper one.
      const start = viewport * FILL_START;
      const end = viewport * FILL_END - rect.height;
      const span = start - end;

      // A statement taller than the band between the two lines has no room to
      // fill gradually; give it to the reader whole rather than in a jump.
      const progress = span <= 0 ? 1 : (start - rect.top) / span;

      element.style.setProperty(
        "--fill",
        Math.min(Math.max(progress, 0), 1).toFixed(4),
      );
    }

    function onScroll() {
      // The listener can fire many times a frame; the write is worth doing once.
      if (frame !== 0) return;

      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [fillsOnScroll, words]);

  const style: FillStyle = { "--word-count": words.length };

  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, index) => (
        <span key={word.id} className="scroll-fill-word" style={word.style}>
          {word.text}
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
