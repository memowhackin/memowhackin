export const SUPPORTED_LANGUAGES = ["en", "nl"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/*
 * Which language this build is for, and where it lives.
 *
 * The site ships one build per language rather than one build that switches at
 * runtime, because a search engine indexes URLs, not localStorage. Each build is
 * prerendered in its own language and served from its own path, so every page
 * exists at a crawlable address in every language.
 *
 * The default language keeps the bare paths (`/about`) so existing URLs and
 * inbound links never move; every other language is prefixed (`/nl/about`).
 *
 * Nothing here is hardcoded to two languages: adding one means adding it to
 * SUPPORTED_LANGUAGES with a translation file, and the build, the prerender,
 * the sitemap and the hreflang tags all follow.
 */

export const DEFAULT_LOCALE: SupportedLanguage = "en";

function resolve(value: string | undefined): SupportedLanguage {
  return SUPPORTED_LANGUAGES.find((lng) => lng === value) ?? DEFAULT_LOCALE;
}

/**
 * The language prefix on the address bar, in development only.
 *
 * `npm run dev` is a single vite server, so it has a single
 * `VITE_SITE_LOCALE` — unset, meaning English. Production does not: the build
 * runs once per language and each bundle is compiled with its own value. That
 * gap made the language switcher look broken in dev and nowhere else, because
 * switching navigates to `/nl/...` and the one dev bundle did not recognise
 * the prefix as its own, so the router had no route and rendered not-found.
 *
 * Reading the prefix here gives the dev server what the build gives
 * production: the language of the page you are on. Everything downstream —
 * the router's basepath, i18next's `lng`, the links — already follows
 * `SITE_LOCALE`, so nothing else needs to know.
 *
 * `import.meta.env.DEV` is replaced with `false` at build time, so this whole
 * function drops out of production bundles and the built language stays fixed
 * by the env var, exactly as before.
 */
function devLocaleFromPath(): SupportedLanguage | undefined {
  if (!import.meta.env.DEV || typeof window === "undefined") return undefined;

  const [, first] = window.location.pathname.split("/");
  return SUPPORTED_LANGUAGES.find((lng) => lng === first);
}

/** The language this bundle was built for. */
export const SITE_LOCALE: SupportedLanguage =
  devLocaleFromPath() ?? resolve(import.meta.env.VITE_SITE_LOCALE);

/** URL prefix for a language: "" for the default, "/nl" for the rest. */
function localeBasePath(locale: SupportedLanguage): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** This build's prefix, e.g. "" or "/nl". */
export const BASE_PATH = localeBasePath(SITE_LOCALE);

/**
 * The same page in another language. Takes a path already stripped of this
 * build's prefix, so it round-trips: "/about" -> "/nl/about".
 */
export function localizedPath(locale: SupportedLanguage, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const base = localeBasePath(locale);
  // "/" under a prefix is "/nl", not "/nl/", which would 404 on a static host.
  if (clean === "/") return base === "" ? "/" : base;
  return `${base}${clean}`;
}

/** Strip this build's prefix off a browser path, for switching languages. */
export function stripBasePath(pathname: string): string {
  if (BASE_PATH === "") return pathname;
  if (pathname === BASE_PATH) return "/";
  return pathname.startsWith(`${BASE_PATH}/`)
    ? pathname.slice(BASE_PATH.length)
    : pathname;
}
