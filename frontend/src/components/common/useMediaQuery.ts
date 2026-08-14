import { useEffect, useState } from "react";

/**
 * `matchMedia` is missing in jsdom and in any other non-browser host, so it is
 * probed rather than assumed. Treating "cannot tell" as no match keeps the
 * heavy branch — a video, a large image — from being requested where nothing
 * can play it anyway.
 */
function matchesQuery(query: string): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;

  return window.matchMedia(query).matches;
}

/**
 * Tracks a media query in JavaScript, for the cases CSS cannot cover — chiefly
 * deciding whether to render an element at all rather than hiding one that has
 * already been fetched.
 *
 * The query is read during the initial state so the first render is already
 * correct; the effect only subscribes to later changes. Pass a constant query,
 * as a changing one is not re-read until it next fires.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => matchesQuery(query));

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const list = window.matchMedia(query);

    function onChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    list.addEventListener("change", onChange);
    return () => {
      list.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}
