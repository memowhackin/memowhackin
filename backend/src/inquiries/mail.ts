import { createTransport, type Transporter } from "nodemailer";
import { env } from "../env.js";
import { logger } from "../logger.js";
import type { Inquiry } from "../db/schema.js";

/*
 * Delivery for contact and demo requests.
 *
 * Unlike the scanner's mail, there is nothing sensitive to withhold here: the
 * message goes to our own inbox and carries exactly what the visitor typed, so
 * whoever answers it has everything without opening the database.
 *
 * The transport is plain SMTP rather than a provider SDK. Every mail provider
 * worth using speaks it — Postmark, SES, Mailgun, Google Workspace — so the
 * choice of provider becomes five environment variables rather than a
 * dependency and a rewrite.
 *
 * Nothing here throws into the request path. The row is already committed by
 * the time this runs (see `routes.ts`), so a delivery failure is a row with a
 * null `delivered_at` to retry, not a lost inquiry and not a 500 shown to
 * somebody who filled the form in correctly.
 */

/** Built once: a transport per message would open a connection per message. */
let cached: Transporter | undefined;

function transport(): Transporter | undefined {
  if (env.SMTP_HOST.length === 0) return undefined;
  cached ??= createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // Implicit TLS on 465; everything else upgrades with STARTTLS.
    secure: env.SMTP_PORT === 465,
    auth:
      env.SMTP_USER.length > 0
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
  });
  return cached;
}

/** One labelled line, dropped when the field was left empty. */
function line(label: string, value: string | null): string | undefined {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? `${label}: ${trimmed}` : undefined;
}

export function renderInquiryMail(inquiry: Inquiry): {
  subject: string;
  text: string;
} {
  const kind = inquiry.kind === "demo" ? "Demo request" : "Contact request";
  const who = inquiry.company?.trim() ?? "";

  return {
    subject: `${kind}: ${inquiry.name}${who.length > 0 ? ` (${who})` : ""}`,
    text: [
      line("Type", kind),
      line("Name", inquiry.name),
      line("Email", inquiry.email),
      line("Company", inquiry.company),
      line("Subject", inquiry.subject),
      line("Phone", inquiry.phone),
      line("Language", inquiry.locale),
      line("Marketing consent", inquiry.consent ? "yes" : "no"),
      "",
      inquiry.message?.trim() ?? "",
      "",
      `Reference: ${inquiry.id}`,
      `Received: ${inquiry.createdAt.toISOString()}`,
    ]
      .filter((entry) => entry !== undefined)
      .join("\n"),
  };
}

/**
 * Send, reporting only whether the transport accepted it.
 *
 * `replyTo` is the visitor, so answering the notification answers the person
 * rather than our own mailbox. The `from` stays our own domain because a
 * message claiming to be from the visitor's domain is exactly what SPF and
 * DMARC exist to reject.
 */
export async function sendInquiryMail(inquiry: Inquiry): Promise<boolean> {
  const mailer = transport();
  if (mailer === undefined) {
    logger.warn(
      { inquiryId: inquiry.id },
      "SMTP not configured; inquiry stored but not mailed",
    );
    return false;
  }

  const { subject, text } = renderInquiryMail(inquiry);

  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: env.INQUIRY_RECIPIENT,
      replyTo: inquiry.email,
      subject,
      text,
    });
    return true;
  } catch (error) {
    logger.error(
      { err: error, inquiryId: inquiry.id },
      "inquiry mail failed; the row is kept for retry",
    );
    return false;
  }
}
