import { eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { db } from "../db/client.js";
import { inquiries } from "../db/schema.js";
import { publicLimiter } from "../auth/rateLimit.js";
import { logger } from "../logger.js";
import { sendInquiryMail } from "./mail.js";

/*
 * Contact and demo requests from the marketing site.
 *
 * Public and unauthenticated by definition: it is a contact form. That makes
 * the rate limiter and the length caps the only things standing between this
 * and a mail flood, so both are deliberate rather than incidental.
 *
 * The order of operations is the feature. The row is committed first and the
 * mail is attempted second, so a transport that is down, throttled or simply
 * not configured yet cannot lose an inquiry: it leaves a row with a null
 * `delivered_at` instead. The response does not depend on delivery either,
 * because a visitor who filled the form in correctly should not be shown an
 * error about our mail provider.
 */

export const inquiryRouter: Router = Router();

inquiryRouter.use(publicLimiter);

/*
 * Caps are generous for a human and hostile to a script. `message` is the only
 * long field and 5000 characters is several screens of prose.
 */
const payload = z.object({
  kind: z.enum(["contact", "demo"]),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(200).optional(),
  subject: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(60).optional(),
  message: z.string().trim().max(5000).optional(),
  consent: z.boolean().optional(),
  locale: z.enum(["en", "nl"]).optional(),
  /*
   * A honeypot. Nothing legitimate fills this in, because nothing legitimate
   * can see it; a bot that fills every input it finds gets a 202 and goes
   * away, which is quieter than a rejection it could learn from.
   */
  website: z.string().max(0).optional(),
});

inquiryRouter.post("/inquiries", async (req, res) => {
  const parsed = payload.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const body = parsed.data;

  const [row] = await db
    .insert(inquiries)
    .values({
      kind: body.kind,
      name: body.name,
      email: body.email,
      company: body.company ?? null,
      subject: body.subject ?? null,
      phone: body.phone ?? null,
      message: body.message ?? null,
      consent: body.consent ?? false,
      locale: body.locale ?? "en",
    })
    .returning();

  if (row === undefined) {
    // The insert is the promise this endpoint makes. If it did not happen,
    // say so rather than answering 202 for something nobody will ever read.
    logger.error("inquiry insert returned no row");
    res.status(500).json({ error: "storage_failed" });
    return;
  }

  logger.info(
    { inquiryId: row.id, kind: row.kind },
    "inquiry received and stored",
  );

  const delivered = await sendInquiryMail(row);
  if (delivered) {
    await db
      .update(inquiries)
      .set({ deliveredAt: new Date() })
      .where(eq(inquiries.id, row.id));
  }

  // 202: it is recorded. Whether the notification has left the building yet is
  // our problem, not the visitor's.
  res.status(202).json({ ok: true });
});
