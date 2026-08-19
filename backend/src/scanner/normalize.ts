import { domainToASCII } from "node:url";

/*
 * Turning what a person typed into something safe to act on.
 *
 * Everything here runs on the server. The browser copy of these rules exists
 * only so the field can complain before a round trip; it is not a control, and
 * nothing downstream may assume the client ran it.
 *
 * The two jobs are different in kind. A domain is going to be *resolved and
 * connected to*, so the bar is "unambiguous and safe to hand to a network
 * stack" and anything doubtful is refused. An email address is only ever going
 * to be hashed, encrypted and mailed, so the bar is "plausibly deliverable" and
 * over-strict rules are the failure mode to avoid: refusing a real address is
 * a person who cannot use the feature at all.
 */

/** A normalized subject, ready to store. Never echoed back to the caller. */
export type NormalizedSubject =
  | { kind: "website"; value: string }
  | { kind: "email"; value: string };

export type NormalizeError =
  | "empty"
  | "too_long"
  | "invalid_domain"
  | "invalid_email"
  | "unsupported_scheme"
  | "ip_not_allowed"
  | "public_suffix_only";

export type NormalizeResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: NormalizeError };

function fail<T>(error: NormalizeError): NormalizeResult<T> {
  return { ok: false, error };
}

/*
 * Length ceilings, applied before any parsing.
 *
 * DNS allows 253 characters for a name; RFC 5321 allows 254 for a mailbox. The
 * limits are here rather than only in the schema because every function below
 * runs regular expressions, and an unbounded string is how a regular expression
 * becomes a denial of service.
 */
const MAX_DOMAIN = 253;
const MAX_EMAIL = 254;
const MAX_INPUT = 2048;

/**
 * A single DNS label: alphanumeric, inner hyphens allowed, 63 characters.
 * Applied to the punycode form, so an internationalized name is checked as
 * what will actually be resolved rather than as what was typed.
 */
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Bare IPv4, which we refuse as a scan subject (see `normalizeDomain`). */
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

/**
 * Reduce a typed website to the bare registrable host we will resolve.
 *
 * Accepts what people actually paste — `https://Example.com/pricing?x=1`,
 * `www.example.com`, `EXAMPLE.COM.` — and returns `example.com`. Everything
 * that is not the host is dropped rather than carried along: a path or query
 * we do not use is a string we would otherwise have to keep safe forever, and
 * credentials in a URL are a secret we should never have received.
 *
 * Refusals are deliberate, not incidental:
 *
 * - Only http and https. A `file:`, `gopher:` or `javascript:` subject is
 *   either a mistake or an attempt to reach something that is not a website.
 * - No bare IP addresses. The scanner reports on a public web presence, and an
 *   IP subject is the shape SSRF attempts arrive in. `ssrf.ts` still guards
 *   the resolved address, because a hostname can point anywhere; this is the
 *   cheap first refusal, not the defence.
 * - No single-label hosts. `localhost`, `intranet`, or a bare TLD are not
 *   registrable names, and `localhost` in particular is the whole game.
 *
 * The `www.` prefix is dropped because `www.example.com` and `example.com` are
 * one subject to a person, and treating them as two would scan the same site
 * twice and rate-limit it half as well.
 */
export function normalizeDomain(
  raw: string,
): NormalizeResult<{ kind: "website"; value: string }> {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return fail("empty");
  if (trimmed.length > MAX_INPUT) return fail("too_long");

  let host = trimmed;

  // Parse as a URL when it looks like one, so the path, query, fragment and
  // any credentials are removed by the parser rather than by a regex of ours.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      return fail("invalid_domain");
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return fail("unsupported_scheme");
    }
    host = parsed.hostname;
  } else {
    /*
     * No scheme, so this is a bare host — but it may still carry a path or a
     * userinfo section (`example.com/admin`, `user@example.com`). Cut at the
     * first delimiter rather than rejecting: the intent is unambiguous and the
     * remainder is exactly what we were going to discard anyway.
     */
    const at = host.lastIndexOf("@");
    if (at !== -1) host = host.slice(at + 1);
    host = host.split(/[/?#]/)[0] ?? "";

    /*
     * Colons mean one of two different things here, and the port stripper
     * below assumes the wrong one for IPv6. A bare `::1` cut at its first
     * colon becomes an empty string and would be refused as "malformed"
     * rather than as the loopback literal it plainly is — refused either way,
     * but the caller deserves the accurate reason. Two or more colons cannot
     * be a `host:port`.
     */
    if ((host.match(/:/g)?.length ?? 0) > 1) return fail("ip_not_allowed");

    // A bare `host:port`. The port is not part of the subject.
    const colon = host.indexOf(":");
    if (colon !== -1) host = host.slice(0, colon);
  }

  // A bracketed IPv6 literal survives URL parsing as `[::1]`.
  if (host.startsWith("[")) return fail("ip_not_allowed");

  host = host.replace(/\.+$/, "").toLowerCase();
  if (host.length === 0) return fail("invalid_domain");
  if (host.startsWith("www.")) host = host.slice(4);
  if (host.length === 0) return fail("invalid_domain");

  /*
   * Internationalized names are converted to punycode before validation, so
   * `bücher.de` is checked and stored as `xn--bcher-kva.de`. Doing it here
   * means one canonical form reaches the database, the rate limiter and the
   * resolver: two spellings of one name must not be two subjects.
   */
  const ascii = domainToASCII(host);
  if (ascii.length === 0) return fail("invalid_domain");
  if (ascii.length > MAX_DOMAIN) return fail("too_long");

  if (IPV4.test(ascii)) return fail("ip_not_allowed");
  // An unbracketed IPv6 literal, or anything else carrying a colon.
  if (ascii.includes(":")) return fail("ip_not_allowed");

  const labels = ascii.split(".");
  if (labels.length < 2) return fail("public_suffix_only");
  if (!labels.every((label) => LABEL.test(label)))
    return fail("invalid_domain");

  // A trailing all-numeric label would make this a malformed IP rather than a
  // name; no real TLD is numeric.
  const tld = labels[labels.length - 1] ?? "";
  if (tld.length < 2 || /^\d+$/.test(tld)) return fail("invalid_domain");

  return { ok: true, value: { kind: "website", value: ascii } };
}

/*
 * Conservative in the sense the brief means: it rejects what is definitely not
 * an address, and otherwise gets out of the way.
 *
 * Deliberately NOT enforced, because each of these rejects addresses that
 * exist and receive mail: a single `@` (quoted local parts may contain more),
 * an exhaustive local-part character list, a TLD allowlist, or a length below
 * the RFC ceiling. The only real test of an address is whether mail to it
 * arrives, which is what the verification step already is.
 */
const EMAIL =
  /^[^\s@,;:<>"'\\()[\]]{1,64}@[^\s@,;:<>"'\\()[\]]{1,253}\.[a-z]{2,63}$/i;

/**
 * Normalize an email address for storage and delivery.
 *
 * The domain is lowercased and punycoded because it is a hostname and case is
 * not significant there. The local part is left exactly as typed: RFC 5321
 * makes it case-sensitive and owned by the receiving server, and helpfully
 * lowercasing it is how mail to a case-sensitive mailbox silently stops
 * arriving. Nor are plus-tags stripped — `a+b@x.com` is a different address
 * from `a@x.com` and the person chose it.
 */
export function normalizeEmail(
  raw: string,
): NormalizeResult<{ kind: "email"; value: string }> {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return fail("empty");
  if (trimmed.length > MAX_INPUT) return fail("too_long");

  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return fail("invalid_email");

  const local = trimmed.slice(0, at);
  const domain = domainToASCII(trimmed.slice(at + 1).replace(/\.+$/, ""));
  if (domain.length === 0) return fail("invalid_email");

  const value = `${local}@${domain.toLowerCase()}`;
  if (value.length > MAX_EMAIL) return fail("too_long");
  if (!EMAIL.test(value)) return fail("invalid_email");

  return { ok: true, value: { kind: "email", value } };
}

/** Dispatch on the requested scan kind. */
export function normalizeSubject(
  kind: "website" | "email",
  raw: string,
): NormalizeResult<NormalizedSubject> {
  return kind === "website" ? normalizeDomain(raw) : normalizeEmail(raw);
}
