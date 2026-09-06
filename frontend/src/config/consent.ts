/*
 * Whether the visitor has agreed to measurement, and nothing else.
 *
 * Kept apart from `analytics.ts` on purpose: this module decides, that one
 * acts. GA4 stores an identifier in the browser, which under the ePrivacy rules
 * — in the Netherlands article 11.7a Telecommunicatiewet — may only happen
 * after the visitor has said yes. So the default is "not asked", never
 * "allowed", and a visitor who has not answered is treated exactly like one who
 * refused.
 *
 * The choice lives in localStorage rather than a cookie, because a cookie to
 * record that cookies were refused is the joke that writes itself: this key is
 * first-party, is never sent to a server, and is the only thing this site
 * stores before consent.
 */

const STORAGE_KEY = "assistsec.consent.analytics";

export type ConsentChoice = "granted" | "denied";

/** What the visitor has decided, or undefined when they have not been asked. */
export function readConsent(): ConsentChoice | undefined {
  /*
   * Every read is guarded. A private window, cleared site data or a browser
   * configured to block storage makes the accessor itself throw, and an
   * analytics preference is never worth taking the page down for.
   */
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "granted" || stored === "denied") return stored;
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Record a decision. A failure to store is deliberately silent and leaves the
 * visitor un-asked rather than assumed-consenting: they will see the banner
 * again, which is the harmless direction to fail in.
 */
export function writeConsent(choice: ConsentChoice): void {
  try {
    localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage refused; the choice holds for this page view only.
  }
}

/** Forget the decision, so the banner asks again. Used by the privacy policy. */
export function clearConsent(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, nothing to undo.
  }
}
