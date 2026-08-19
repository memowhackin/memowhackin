/*
 * Field-level checks, so a typo gets an answer without a round trip.
 *
 * This is a courtesy, not a control. The server re-derives every one of these
 * rules in `backend/src/scanner/normalize.ts` and its answer is the one that
 * decides anything; nothing here is relied on for safety. The two are kept
 * deliberately close in behaviour so the message a person sees while typing
 * matches the one they get on submit.
 *
 * The bar is the same as the server's: refuse what is definitely wrong, and
 * otherwise let it through. A field that rejects a valid address is worse
 * than one that accepts an invalid one, because the server catches the second
 * and nothing catches the first.
 */

export type ValidationError =
  | "empty"
  | "invalid_domain"
  | "invalid_email"
  | "ip_not_allowed"
  | "public_suffix_only"
  | "unsupported_scheme"
  | "too_long";

export type Validation = { ok: true } | { ok: false; error: ValidationError };

const ok: Validation = { ok: true };
const bad = (error: ValidationError): Validation => ({ ok: false, error });

const MAX_INPUT = 2048;

export function validateDomain(raw: string): Validation {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return bad("empty");
  if (trimmed.length > MAX_INPUT) return bad("too_long");

  if (
    /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) &&
    !/^https?:\/\//i.test(trimmed)
  ) {
    return bad("unsupported_scheme");
  }

  let host = trimmed.replace(/^https?:\/\//i, "");
  const at = host.lastIndexOf("@");
  if (at !== -1) host = host.slice(at + 1);
  host = host.split(/[/?#]/)[0] ?? "";

  if (host.startsWith("[") || (host.match(/:/g)?.length ?? 0) > 1) {
    return bad("ip_not_allowed");
  }
  host = host.split(":")[0] ?? "";
  host = host.replace(/\.+$/, "").toLowerCase();
  if (host.startsWith("www.")) host = host.slice(4);
  if (host.length === 0) return bad("invalid_domain");

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return bad("ip_not_allowed");

  const labels = host.split(".");
  if (labels.length < 2) return bad("public_suffix_only");

  /*
   * Unicode is accepted here rather than punycoded. The browser cannot convert
   * reliably without the full IDNA tables, and the server does it properly —
   * so this checks the shape and lets `bücher.de` through instead of
   * rejecting a name it cannot spell.
   */
  const label =
    /^[\p{Letter}\p{Number}]([\p{Letter}\p{Number}-]{0,61}[\p{Letter}\p{Number}])?$/u;
  if (!labels.every((part) => label.test(part))) return bad("invalid_domain");

  const tld = labels[labels.length - 1] ?? "";
  if (tld.length < 2 || /^\d+$/.test(tld)) return bad("invalid_domain");

  return ok;
}

export function validateEmail(raw: string): Validation {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return bad("empty");
  if (trimmed.length > 254) return bad("too_long");

  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return bad("invalid_email");

  const domain = trimmed.slice(at + 1);
  // A domain with no dot is either a local name or a typo; neither receives
  // public mail.
  if (!domain.includes(".")) return bad("invalid_email");
  if (/[\s,;:<>"'\\()[\]]/.test(trimmed)) return bad("invalid_email");
  if (/\.{2,}/.test(domain)) return bad("invalid_email");

  return ok;
}

export function validate(kind: "website" | "email", raw: string): Validation {
  return kind === "website" ? validateDomain(raw) : validateEmail(raw);
}
