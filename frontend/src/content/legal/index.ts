import { DEFAULT_LOCALE, type SupportedLanguage } from "@/config/locale";
import { privacyPolicyEn } from "./privacyPolicy.en";
import { privacyPolicyNl } from "./privacyPolicy.nl";
import { termsOfServiceEn } from "./termsOfService.en";
import { termsOfServiceNl } from "./termsOfService.nl";
import type { LegalDocument, LegalDocumentKind, LegalRoutePath } from "./types";

export type { LegalDocument, LegalDocumentKind } from "./types";
export { openItems } from "./types";

/**
 * Every legal text the site publishes, by document and language. Listed in
 * full rather than built by string so that a missing translation is a type
 * error here, not an empty page in production.
 */
export const legalDocuments: Record<
  LegalDocumentKind,
  Record<SupportedLanguage, LegalDocument>
> = {
  privacyPolicy: { en: privacyPolicyEn, nl: privacyPolicyNl },
  termsOfService: { en: termsOfServiceEn, nl: termsOfServiceNl },
};

/** The route each document lives at, shared by the pages and the footer. */
export const legalPaths: Record<LegalDocumentKind, LegalRoutePath> = {
  privacyPolicy: "/privacy-policy",
  termsOfService: "/terms-of-service",
};

/**
 * The document in a language, falling back to the default language for a
 * language code that is not one of ours — i18next can report a regional
 * variant, and a legal page must never render empty.
 */
export function legalDocument(
  kind: LegalDocumentKind,
  language: string,
): LegalDocument {
  const byLocale = legalDocuments[kind];
  const locale = (Object.keys(byLocale) as SupportedLanguage[]).find(
    (candidate) => candidate === language,
  );
  return byLocale[locale ?? DEFAULT_LOCALE];
}
