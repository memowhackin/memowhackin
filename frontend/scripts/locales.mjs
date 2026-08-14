import { readFileSync } from "node:fs";
import path from "node:path";

/*
 * The language list, read from the app's own source rather than repeated here.
 *
 * Build tooling that keeps its own copy of this list is how a third language
 * ends up half-added: shipped in the bundle, missing from the sitemap. There is
 * one definition, in src/config/locale.ts, and everything else derives from it.
 */

const LOCALE_SOURCE = path.resolve("src/config/locale.ts");

function readLocales() {
  const source = readFileSync(LOCALE_SOURCE, "utf8");

  const list = /export const SUPPORTED_LANGUAGES = \[(.*?)\] as const;/s.exec(
    source,
  );
  const fallback =
    /export const DEFAULT_LOCALE: SupportedLanguage = "(\w+)"/.exec(source);

  if (list === null || fallback === null) {
    throw new Error(
      `could not read SUPPORTED_LANGUAGES/DEFAULT_LOCALE from ${LOCALE_SOURCE}`,
    );
  }

  const locales = [...list[1].matchAll(/"([\w-]+)"/g)].map((match) => match[1]);
  if (locales.length === 0) throw new Error("no locales found");

  return { locales, defaultLocale: fallback[1] };
}

const { locales, defaultLocale } = readLocales();

export const LOCALES = locales;
export const DEFAULT_LOCALE = defaultLocale;

/** Vite's `base` for a locale: "/" for the default, "/nl/" for the rest. */
export function localeBase(locale) {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}/`;
}

/** Build output directory: dist for the default, dist/nl for the rest. */
export function localeOutDir(locale) {
  return locale === DEFAULT_LOCALE ? "dist" : path.join("dist", locale);
}

/** URL prefix, with no trailing slash: "" or "/nl". */
export function localePrefix(locale) {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}
