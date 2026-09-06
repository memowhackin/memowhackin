import { useEffect, useRef, useState } from "react";

interface RevealOptions {
  /**
   * Stagger, in milliseconds, applied to this element's transition. Use it to
   * walk a row of cards in rather than snapping them all at once.
   */
  delay?: number;
}

interface Reveal<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  className: string;
  style: React.CSSProperties | undefined;
  /**
   * Whether the element has been seen yet. Exposed so a component that has
   * something to start on arrival — a count, a typed line — can hang it off
   * the same observation rather than opening a second one on the same element
   * with its own idea of when "in view" begins.
   */
  revealed: boolean;
}

/**
 * Fades and lifts an element in the first time it scrolls into view.
 *
 * Returns props to spread onto an element that already exists rather than a
 * wrapper component: an extra `<div>` around a grid or flex child would become
 * the item itself and change the layout it is decorating.
 *
 * The reveal runs as the `reveal` keyframe animation (see `index.css`) rather
 * than as a transition, which leaves the element's own `transition` free for
 * hover and focus states. Both states are behind `motion-safe`, so a reader who
 * has asked for reduced motion gets the finished state on the first paint and
 * never the hidden one.
 */
export function useReveal<T extends HTMLElement>({
  delay,
}: RevealOptions = {}): Reveal<T> {
  const ref = useRef<T>(null);
  // Without the observer there is no moment to reveal on, so start revealed
  // rather than leaving the section blank for good.
  const [revealed, setRevealed] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || revealed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setRevealed(true);
        observer.disconnect();
      },
      /*
       * The bottom edge is pulled in so the movement reads as the element
       * arriving rather than as something already on screen shifting under the
       * reader. The top edge is pushed far out of the way on purpose: anything
       * scrolled past counts as intersecting.
       *
       * Without that, content the reader skipped stayed invisible for good.
       * The observer only samples on a frame, so a section that goes from
       * below the fold to above it in one jump — a nav anchor, End, a hard
       * trackpad flick — is never once seen intersecting, and scrolling back up
       * showed empty rows where the services were.
       */
      { rootMargin: "999999px 0px -10% 0px" },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [revealed]);

  return {
    ref,
    revealed,
    className: revealed
      ? "motion-safe:animate-reveal"
      : "motion-safe:opacity-0",
    // `both` fill mode holds the element at the keyframe's opening frame for
    // the length of the delay, so a staggered item stays hidden until its turn
    // instead of flashing in and then re-animating.
    style:
      delay === undefined
        ? undefined
        : { animationDelay: `${delay.toString()}ms` },
  };
}
