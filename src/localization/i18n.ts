import { createInstance, type i18n as I18N } from "i18next";
import { initReactI18next } from "react-i18next";
import { env } from "@/config/env";

import enTranslation from "@/locales/en/translation.json";
import nlTranslation from "@/locales/nl/translation.json";

export const SUPPORTED_LANGUAGES = ["en", "nl"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LOCALE_STORAGE_KEY = "assistsec-locale";

/**
 * localStorage is unavailable in some contexts (test runners, private-mode
 * quirks, pre-rendering). Language choice is a nicety, so degrade quietly.
 */
function readStoredLanguage(): string | null {
  try {
    return globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function storeLanguage(lng: SupportedLanguage): void {
  try {
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, lng);
  } catch {
    /* not persisted — the in-memory language change still applies */
  }
}

const instance = createInstance() as I18N;

export const i18nInit = instance.use(initReactI18next).init({
  debug: import.meta.env.DEV,
  lng: env.noTranslations ? "en" : (readStoredLanguage() ?? "en"),
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

export function changeLanguage(lng: SupportedLanguage): void {
  storeLanguage(lng);
  void instance.changeLanguage(lng);
}

export default instance;
