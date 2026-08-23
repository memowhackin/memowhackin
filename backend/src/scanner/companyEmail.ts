/*
 * Whether an address is a company address rather than a consumer one.
 *
 * The lead gate wants business contacts, so a free webmail address is exactly
 * what it turns away. The frontend checks the same thing for a fast answer;
 * this is the copy that decides, because the frontend is not a control.
 *
 * The list is deny-only and errs toward letting an unknown domain through: a
 * consumer name that slips past is a slightly odd lead, whereas blocking a real
 * company domain is a lost one, so an unrecognised domain is treated as a
 * company.
 */

const FREE_EMAIL_DOMAINS = new Set<string>([
  "gmail.com",
  "googlemail.com",
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
  "protonmail.com",
  "protonmail.ch",
  "proton.me",
  "proton.com",
  "pm.me",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "aim.com",
  "gmx.com",
  "gmx.net",
  "gmx.de",
  "gmx.at",
  "gmx.ch",
  "gmx.co.uk",
  "mail.com",
  "email.com",
  "usa.com",
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
