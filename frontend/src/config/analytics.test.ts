import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The one property this feature has to hold: nothing reaches Google until the
 * visitor has agreed.
 *
 * Every test imports the module fresh. `analytics.ts` reads the measurement id
 * from `env` at module scope and remembers whether it has already injected the
 * script, so a shared instance would carry one test's state into the next and
 * hide exactly the failure this is here to catch.
 */

const MEASUREMENT_ID = "G-TEST123456";

async function load(id: string, consent: string | undefined) {
  vi.resetModules();
  vi.doMock("@/config/env", () => ({ env: { gaMeasurementId: id } }));
  vi.doMock("@/config/consent", () => ({
    readConsent: () => consent,
  }));
  return import("@/config/analytics");
}

function gaScripts(): HTMLScriptElement[] {
  return [...document.querySelectorAll("script")].filter((script) =>
    script.src.includes("googletagmanager.com"),
  );
}

beforeEach(() => {
  document.head.innerHTML = "";
  // No `window.gtag` to clear: the shim is module-private on purpose, so there
  // is no global that could reach the queue around the consent check.
  delete window.dataLayer;
});

afterEach(() => {
  vi.doUnmock("@/config/env");
  vi.doUnmock("@/config/consent");
});

describe("startAnalytics", () => {
  it("loads nothing when no measurement id is configured", async () => {
    const { startAnalytics } = await load("", "granted");

    expect(startAnalytics()).toBe(false);
    expect(gaScripts()).toHaveLength(0);
  });

  it("loads nothing before the visitor has been asked", async () => {
    const { startAnalytics } = await load(MEASUREMENT_ID, undefined);

    expect(startAnalytics()).toBe(false);
    expect(gaScripts()).toHaveLength(0);
  });

  it("loads nothing when the visitor refused", async () => {
    const { startAnalytics } = await load(MEASUREMENT_ID, "denied");

    expect(startAnalytics()).toBe(false);
    expect(gaScripts()).toHaveLength(0);
  });

  it("loads the tag once the visitor agrees", async () => {
    const { startAnalytics } = await load(MEASUREMENT_ID, "granted");

    expect(startAnalytics()).toBe(true);

    const [script] = gaScripts();
    expect(script?.src).toContain(MEASUREMENT_ID);
    expect(script?.async).toBe(true);
  });

  it("injects the tag once however often it is called", async () => {
    const { startAnalytics } = await load(MEASUREMENT_ID, "granted");

    startAnalytics();
    startAnalytics();
    startAnalytics();

    expect(gaScripts()).toHaveLength(1);
  });
});

describe("trackPageView", () => {
  it("sends nothing when the visitor refused", async () => {
    const { trackPageView } = await load(MEASUREMENT_ID, "denied");

    trackPageView("/about");

    expect(gaScripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
  });

  it("queues a page view carrying the path once allowed", async () => {
    const { trackPageView } = await load(MEASUREMENT_ID, "granted");

    trackPageView("/about");

    const queued = (window.dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    );
    const pageViews = queued.filter(
      (entry) => entry[0] === "event" && entry[1] === "page_view",
    );

    expect(pageViews).toHaveLength(1);
    expect(pageViews[0]?.[2]).toMatchObject({ page_path: "/about" });
  });

  it("turns GA's own page view off, so the SPA is not counted once", async () => {
    // Without this every navigation after the first would go unreported.
    const { startAnalytics } = await load(MEASUREMENT_ID, "granted");
    startAnalytics();

    const queued = (window.dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    );
    const config = queued.find((entry) => entry[0] === "config");

    expect(config?.[2]).toMatchObject({ send_page_view: false });
  });
});
