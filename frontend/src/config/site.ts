import { SITE_LOCALE, type SupportedLanguage } from "@/config/locale";

/**
 * Site-wide constants for the marketing pages.
 *
 * The product itself (login, scanner, customer portal) lives on a separate
 * host, so every "app" link here is an absolute external URL.
 */
export const site = {
  /** The marketing site's own origin, for canonical URLs and share cards. */
  baseUrl: "https://assistsec.nl",
  scannerBaseUrl: "https://scanner.assistsec.nl",
  contactEmail: "contact@assistsec.nl",
  /*
   * The customer portal's own sign-in, not the pentesting dashboard's. Both
   * live on the scanner host and the paths differ by one segment, so this is
   * worth naming: `/login` is where our own testers sign in, `/portal/login`
   * is where a customer does, and the header link is for customers.
   */
  loginUrl: "https://scanner.assistsec.nl/portal/login",
  bookDemoUrl: "https://scanner.assistsec.nl/demo",
  linkedInUrl: "https://www.linkedin.com/company/assistsec",
  youTubeUrl: "https://www.youtube.com/@assistsec",
} as const;

/*
 * The knowledge base is its own site on its own host, and it lays its languages
 * out as the mirror image of this one: Dutch sits at the root and every other
 * language is prefixed, where here English is the bare path. `localizedPath`
 * therefore cannot be reused for it — following this site's scheme would send
 * a Dutch reader to a page that does not exist — and this is the one place the
 * two schemes are mapped onto each other.
 *
 * The 301s that catch the retired /knowledge-base address encode the same
 * mapping, in `nginx.conf` and in `scripts/prerender.mjs`. Change one, change
 * all three.
 */
const KNOWLEDGE_BASE_ORIGIN = "https://kennisbank.assistsec.nl";
const KNOWLEDGE_BASE_DEFAULT_LOCALE: SupportedLanguage = "nl";

/**
 * Where the knowledge base keeps a language. Defaults to this build's own, so
 * a Dutch build links into the Dutch knowledge base without any caller saying
 * so.
 */
export function knowledgeBaseUrl(
  locale: SupportedLanguage = SITE_LOCALE,
): string {
  return locale === KNOWLEDGE_BASE_DEFAULT_LOCALE
    ? KNOWLEDGE_BASE_ORIGIN
    : `${KNOWLEDGE_BASE_ORIGIN}/${locale}`;
}

/** Anchor targets for the in-page navigation. */
export const sectionIds = {
  services: "services",
  about: "about",
  demonstrate: "demonstrate",
  blog: "blog",
} as const;
