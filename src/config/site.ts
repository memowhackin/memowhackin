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
  loginUrl: "https://scanner.assistsec.nl/login",
  bookDemoUrl: "https://scanner.assistsec.nl/demo",
  linkedInUrl: "https://www.linkedin.com/company/assistsec",
} as const;

/** Anchor targets for the in-page navigation. */
export const sectionIds = {
  services: "services",
  about: "about",
  demonstrate: "demonstrate",
  blog: "blog",
} as const;
