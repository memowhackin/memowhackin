import { env } from "../env.js";
import { logger } from "../logger.js";

/*
 * Transactional delivery for report links.
 *
 * The backend had no mail capability before this feature, so rather than pull
 * in a provider SDK on a guess, this is the interface plus a development
 * transport that writes to the process log. Wiring a real sender means adding
 * one adapter here and a branch in `transport()`; nothing else changes.
 *
 * Two rules the message itself has to follow, and they are the reason this is
 * not a one-line `sendMail`:
 *
 *   - The body carries a link, never a finding. Mail sits unencrypted in
 *     inboxes, forwards, backups and mailbox providers' indexes, and "your
 *     password from the X breach is exposed" in a mail body is a disclosure we
 *     performed ourselves.
 *   - The message is identical whether or not exposure was found, because the
 *     mere fact of a different message is itself the answer. See the
 *     enumeration note in `routes.public.ts`.
 */

export interface ReportMail {
  to: string;
  locale: string;
  /** Absolute, single-use, expiring. The only sensitive thing in the mail. */
  link: string;
  expiresAt: Date;
}

export interface MailTransport {
  readonly name: string;
  send(message: ReportMail): Promise<void>;
}

/*
 * The copy, in both languages, kept here rather than in the frontend bundle
 * because it is the server that sends it. Deliberately neutral: it says a
 * report is ready to open, not what is in it.
 */
const SUBJECTS: Record<string, string> = {
  en: "Your AssistSec exposure report is ready",
  nl: "Uw AssistSec-blootstellingsrapport staat klaar",
};

const BODIES: Record<string, (link: string, expires: string) => string> = {
  en: (link, expires) =>
    [
      "You asked AssistSec for a digital exposure report for this address.",
      "",
      `Open it here: ${link}`,
      "",
      `This link works once and expires at ${expires}.`,
      "If you did not request this report, you can ignore this message.",
    ].join("\n"),
  nl: (link, expires) =>
    [
      "U heeft AssistSec gevraagd om een blootstellingsrapport voor dit adres.",
      "",
      `Open het hier: ${link}`,
      "",
      `Deze link werkt eenmalig en verloopt op ${expires}.`,
      "Heeft u dit rapport niet aangevraagd, dan kunt u dit bericht negeren.",
    ].join("\n"),
};

export function renderReportMail(message: ReportMail): {
  subject: string;
  body: string;
} {
  const locale = message.locale in SUBJECTS ? message.locale : "en";
  const expires = message.expiresAt.toISOString();

  return {
    subject: SUBJECTS[locale] ?? SUBJECTS.en ?? "",
    body: (BODIES[locale] ?? BODIES.en)?.(message.link, expires) ?? "",
  };
}

/*
 * Development transport. Logs that a message would have been sent, and to
 * which domain — never the full address and never the link. A log line
 * containing a working single-use report link would put the report into log
 * aggregation, which is precisely where it must not be.
 */
const logTransport: MailTransport = {
  name: "log",
  send(message: ReportMail): Promise<void> {
    const domain = message.to.slice(message.to.lastIndexOf("@") + 1);
    logger.info(
      { transport: "log", recipientDomain: domain, locale: message.locale },
      "scanner report mail prepared (not sent: log transport)",
    );
    return Promise.resolve();
  },
};

export function transport(): MailTransport | undefined {
  if (env.SCANNER_MAIL_TRANSPORT === "log") return logTransport;
  return undefined;
}

/**
 * Send, reporting only whether it worked.
 *
 * Never throws into the request path: a delivery failure must not change the
 * response, because the response is identical for every address by design and
 * an error here would break that.
 */
export async function sendReportMail(message: ReportMail): Promise<boolean> {
  const active = transport();
  if (active === undefined) {
    logger.warn("scanner mail transport not configured; no report link sent");
    return false;
  }

  try {
    await active.send(message);
    return true;
  } catch (error) {
    logger.error({ err: error }, "scanner report mail failed");
    return false;
  }
}
