import { createInstance, type i18n as I18N } from "i18next";
import { initReactI18next } from "react-i18next";
import { env } from "@/config/env";
import { SITE_LOCALE, type SupportedLanguage } from "@/config/locale";

import enTranslation from "@/locales/en/translation.json";
import nlTranslation from "@/locales/nl/translation.json";

// The language list and the URL each language lives at are defined together in
// @/config/locale; re-exported here so existing imports keep working.
export { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/config/locale";

/*
 * The language is fixed at build time and is not read from storage.
 *
 * It used to come from localStorage, which meant every language lived at the
 * same URL and only one of them could ever be indexed. Now each language is its
 * own build at its own path (see @/config/locale), so the language is a
 * property of the page you are on — and a prerendered page can never disagree
 * with what the visitor then sees.
 */

const instance = createInstance() as I18N;

export const i18nInit = instance.use(initReactI18next).init({
  debug: import.meta.env.DEV,
  lng: env.noTranslations ? "en" : SITE_LOCALE,
  fallbackLng: "en",
  defaultNS: "translation",
  ns: ["translation"],
  resources: {
    en: { translation: enTranslation },
    nl: { translation: nlTranslation },
  },
  interpolation: {
    escapeValue: false,
  },
});

/**
 * Switching language means going to that language's URL — see LanguageSwitcher.
 * This remains for tests and for any in-place change that does not need to move
 * the address.
 */
export function changeLanguage(lng: SupportedLanguage): void {
  void instance.changeLanguage(lng);
}

export default instance;
