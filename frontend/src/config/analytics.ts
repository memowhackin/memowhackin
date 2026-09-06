import { env } from "@/config/env";
import { readConsent } from "@/config/consent";

/*
 * Google Analytics 4, and the fifth place in `src/` that reaches the network.
 *
 * The other four each talk to our own API. This one loads a script from
 * Google and sends page views there, which is exactly why it is one module
 * with one entry point rather than a snippet in `index.html`: a tag in the
 * document head fires the moment the page parses, and this must not fire until
 * the visitor has agreed. See `consent.ts` for why that is not optional.
 *
 * Two independent conditions have to hold before anything is fetched, and both
 * are checked here rather than at the call sites:
 *
 *   - a measurement id is configured, and
 *   - consent has been granted.
 *
 * A missing id is the normal state of a development build and of any deploy
 * that has not been given one, and it means this file does nothing at all —
 * no script, no globals, no requests.
 */

/**
 * `gtag` as the snippet defines it: a function that pushes its own `arguments`
 * object onto the queue, so calls made before the script arrives are replayed
 * once it does.
 */
type GtagArgs =
  | ["js", Date]
  | ["config", string, Record<string, unknown>?]
  | ["event", string, Record<string, unknown>?]
  | ["consent", "default" | "update", Record<string, string>];

declare global {
  interface Window {
    /*
     * Only the queue is declared. `window.gtag` is deliberately never assigned:
     * the shim below is module-private, so there is exactly one way into the
     * queue and no global for other code to call around the consent check.
     */
    dataLayer?: unknown[];
  }
}

const SCRIPT_ID = "ga4";

/** Whether measurement may run at all: configured, and agreed to. */
export function analyticsAllowed(): boolean {
  return env.gaMeasurementId.length > 0 && readConsent() === "granted";
}

/*
 * The queue and the shim, as Google's own snippet defines them.
 *
 * `dataLayer.push(arguments)` is load-bearing: gtag.js reads each queued entry
 * as the `arguments` object of the original call, so the real one is pushed
 * rather than a rebuilt array. The rest parameter is there for the type only —
 * it is what makes the call sites below checkable — and is deliberately not
 * what gets queued.
 *
 * Calls made before the script finishes loading sit in this queue and are
 * replayed when it arrives, which is what lets `config` run on the line after
 * `appendChild` rather than in a load handler.
 */
function gtag(...args: GtagArgs): void {
  void args;
  window.dataLayer ??= [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

/**
 * Load GA4, once.
 *
 * Safe to call repeatedly — on consent, and again on every page view — because
 * the script tag is looked up by id and a second call is a no-op. Returns
 * whether measurement is running, so a caller can tell "loaded" from "not
 * allowed" without repeating the conditions.
 */
export function startAnalytics(): boolean {
  if (!analyticsAllowed()) return false;
  if (typeof document === "undefined") return false;
  if (document.getElementById(SCRIPT_ID) !== null) return true;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(env.gaMeasurementId)}`;
  document.head.appendChild(script);

  gtag("js", new Date());
  /*
   * `send_page_view: false` because this is a single-page app: GA's own page
   * view fires on script load and never again, so every navigation after the
   * first would go uncounted. `trackPageView` below is the one that reports,
   * and the router calls it for the first page too.
   */
  gtag("config", env.gaMeasurementId, { send_page_view: false });

  return true;
}

/**
 * Report one page view.
 *
 * Takes the path explicitly rather than reading `location`, so the caller
 * decides what a page view is — the router knows a navigation has settled, and
 * the URL during a transition is not the one to report.
 */
export function trackPageView(path: string): void {
  if (!startAnalytics()) return;

  /*
   * The module's own `gtag`, not `window.gtag`: nothing here ever assigns the
   * global, so reading it back would silently send nothing. gtag.js does not
   * need it either — it reads the queue this pushes to.
   */
  gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
