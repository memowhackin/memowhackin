/*
 * Whether an address looks like a company address rather than a consumer one.
 *
 * The gate exists to capture business leads, so a free webmail address is
 * exactly what it is meant to turn away. This is not a security control — the
 * server re-checks the same list — it is a courtesy so a typo or a gmail
 * address gets an answer without a round trip.
 *
 * The list is the consumer and disposable providers, including the Dutch ISPs
 * this site's audience actually uses. It can never be complete; a name that
 * slips through is a lead with a slightly odd domain, which is a survivable
 * failure, whereas blocking a real company domain is not, so the list stays
 * deny-only and errs toward letting an unknown domain pass.
 */

const FREE_EMAIL_DOMAINS = new Set<string>([
  // Google
  "gmail.com",
  "googlemail.com",
  // Microsoft
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "hotmail.de",
  "hotmail.it",
  "hotmail.es",
  "hotmail.nl",
  "hotmail.be",
  "outlook.com",
  "outlook.nl",
  "outlook.be",
  "outlook.fr",
  "outlook.de",
  "outlook.es",
  "outlook.it",
  "live.com",
  "live.nl",
  "live.be",
  "live.co.uk",
  "live.fr",
  "live.de",
  "live.it",
  "msn.com",
  "windowslive.com",
  // Yahoo
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.es",
  "yahoo.it",
  "yahoo.nl",
  "yahoo.ca",
  "yahoo.com.au",
  "ymail.com",
  "rocketmail.com",
  // Proton
  "protonmail.com",
  "protonmail.ch",
  "proton.me",
  "proton.com",
  "pm.me",
  // Apple
  "icloud.com",
  "me.com",
  "mac.com",
  // AOL
  "aol.com",
  "aim.com",
  // GMX / Mail.com family
  "gmx.com",
  "gmx.net",
  "gmx.de",
  "gmx.at",
  "gmx.ch",
  "gmx.co.uk",
  "mail.com",
  "email.com",
  "usa.com",
  // Zoho, Yandex, others
  "zoho.com",
  "zohomail.com",
  "yandex.com",
  "yandex.ru",
  "ya.ru",
  "tutanota.com",
  "tutanota.de",
  "tuta.io",
  "tutamail.com",
  "fastmail.com",
  "fastmail.fm",
  "hey.com",
  "hushmail.com",
  "mailfence.com",
  // Dutch consumer ISPs
  "ziggo.nl",
  "kpnmail.nl",
  "kpn.nl",
  "home.nl",
  "hetnet.nl",
  "planet.nl",
  "chello.nl",
  "telfort.nl",
  "xs4all.nl",
  "casema.nl",
  "quicknet.nl",
  "zonnet.nl",
  "online.nl",
  "upcmail.nl",
  "caiway.nl",
  "freeler.nl",
  "wanadoo.nl",
  "tiscali.nl",
  "solcon.nl",
  "kabelfoon.nl",
  // Disposable
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "yopmail.com",
  "sharklasers.com",
  "maildrop.cc",
  "throwawaymail.com",
  "mailnesia.com",
  "moakt.com",
]);

export type EmailVerdict =
  | { ok: true }
  | { ok: false; reason: "format" | "free" };

/** Verdict on one address: well-formed, and not a consumer/free provider. */
export function checkCompanyEmail(raw: string): EmailVerdict {
  const email = raw.trim().toLowerCase();
  const match = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(email);
  if (match === null) return { ok: false, reason: "format" };

  const domain = match[1];
  if (domain === undefined) return { ok: false, reason: "format" };
  if (FREE_EMAIL_DOMAINS.has(domain)) return { ok: false, reason: "free" };

  return { ok: true };
}
