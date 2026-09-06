export const env = {
  noTranslations: import.meta.env.VITE_NO_TRANSLATIONS === "true",
  /*
   * The GA4 property to report to, e.g. "G-XXXXXXXXXX". Empty is the default
   * and the normal state of a development build: `analytics.ts` then loads
   * nothing at all, so a build without this variable makes no request to
   * Google and stores nothing in the browser.
   *
   * Vite inlines this at build time, so it is a build argument rather than a
   * runtime setting — changing it means rebuilding the image.
   */
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID ?? "",
} as const;
