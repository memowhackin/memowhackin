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

/** Anchor targets for the in-page navigation. */
export const sectionIds = {
  services: "services",
  about: "about",
  demonstrate: "demonstrate",
  blog: "blog",
} as const;
