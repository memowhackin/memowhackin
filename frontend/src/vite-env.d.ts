/// <reference types="vite/client" />

/*
 * Declaring the variables this app reads keeps `import.meta.env` typed instead
 * of falling back to `any`, so a typo in a variable name is a compile error
 * rather than a value that is silently `undefined` at runtime.
 */
interface ImportMetaEnv {
  readonly VITE_NO_TRANSLATIONS?: string;
  /** Base URL of the backend. Empty means same-origin, which is the default. */
  readonly VITE_CMS_API_URL?: string;
  /** Language this bundle is built for; set per build by build-locales.mjs. */
  readonly VITE_SITE_LOCALE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
