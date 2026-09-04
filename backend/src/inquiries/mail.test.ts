import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Inquiry } from "../db/schema.js";

/*
 * Delivery of contact and demo requests.
 *
 * Two things here are worth a test rather than a read-through. The first is the
 * rule that a delivery failure must not become a lost inquiry: the row is
 * already committed when this runs, so every failure path has to return false
 * quietly instead of throwing into the request. The second is the addressing —
 * `from` on our own domain and `replyTo` on the visitor's — which is what keeps
 * the notification deliverable under SPF and DMARC while still letting a reply
 * reach the person who filled the form in.
 *
 * nodemailer is mocked because the alternative is an SMTP server, and none of
 * the behaviour above is nodemailer's: it is ours.
 */

const sendMail = vi.hoisted(() => vi.fn());
const createTransport = vi.hoisted(() => vi.fn(() => ({ sendMail })));

vi.mock("nodemailer", () => ({ createTransport }));

const BASE_ENV: Record<string, string> = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  DB_NAME: "as_landing_test",
  DB_USER: "admin",
  DB_PASSWORD: "secret",
  ALLOWED_ORIGINS: "http://localhost:3000",
  NODE_ENV: "test",
};

function inquiry(overrides: Partial<Inquiry> = {}): Inquiry {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    kind: "contact",
    name: "Sam de Vries",
    email: "sam@klant.nl",
    company: "Klant B.V.",
    subject: "Web application pentest",
    phone: "+31 6 12345678",
    message: "We are launching in March and need a test before then.",
    consent: false,
    locale: "nl",
    deliveredAt: null,
    createdAt: new Date("2026-03-01T09:30:00.000Z"),
    ...overrides,
  };
}

/** Import fresh, because the transport is cached in module state. */
async function loadMail(smtp: Record<string, string> = {}) {
  vi.resetModules();
  for (const name of Object.keys(process.env)) {
    if (name.startsWith("SMTP_") || name === "INQUIRY_RECIPIENT") {
      vi.stubEnv(name, undefined);
    }
  }
  for (const [k, v] of Object.entries({ ...BASE_ENV, ...smtp })) {
    vi.stubEnv(k, v);
  }
  return import("./mail.js");
}

const CONFIGURED = {
  SMTP_HOST: "smtp.example.net",
  SMTP_PORT: "587",
  SMTP_USER: "postmaster",
  SMTP_PASSWORD: "hunter2",
  SMTP_FROM: "AssistSec <noreply@assistsec.nl>",
  INQUIRY_RECIPIENT: "contact@assistsec.nl",
};

beforeEach(() => {
  sendMail
    .mockReset()
    .mockResolvedValue({ accepted: ["contact@assistsec.nl"] });
  createTransport.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("renderInquiryMail", () => {
  it("puts the kind and the company in the subject", async () => {
    const { renderInquiryMail } = await loadMail(CONFIGURED);

    expect(renderInquiryMail(inquiry()).subject).toBe(
      "Contact request: Sam de Vries (Klant B.V.)",
    );
    expect(renderInquiryMail(inquiry({ kind: "demo" })).subject).toBe(
      "Demo request: Sam de Vries (Klant B.V.)",
    );
  });

  it("leaves the parenthesis off entirely when there is no company", async () => {
    const { renderInquiryMail } = await loadMail(CONFIGURED);

    for (const company of [null, "", "   "]) {
      expect(renderInquiryMail(inquiry({ company })).subject).toBe(
        "Contact request: Sam de Vries",
      );
    }
  });

  it("carries every field somebody answering would need", async () => {
    const { renderInquiryMail } = await loadMail(CONFIGURED);
    const { text } = renderInquiryMail(inquiry());

    expect(text).toContain("Name: Sam de Vries");
    expect(text).toContain("Email: sam@klant.nl");
    expect(text).toContain("Company: Klant B.V.");
    expect(text).toContain("Phone: +31 6 12345678");
    expect(text).toContain("Language: nl");
    expect(text).toContain("We are launching in March");
    // The reference is how a reply gets tied back to the row.
    expect(text).toContain("Reference: 11111111-2222-3333-4444-555555555555");
    expect(text).toContain("Received: 2026-03-01T09:30:00.000Z");
  });

  it("drops an empty field rather than printing a bare label", async () => {
    const { renderInquiryMail } = await loadMail(CONFIGURED);
    const { text } = renderInquiryMail(
      inquiry({ company: null, phone: "  ", subject: null, message: null }),
    );

    // A line reading "Phone:" with nothing after it is worse than no line.
    expect(text).not.toMatch(/^Company:/m);
    expect(text).not.toMatch(/^Phone:/m);
    expect(text).not.toMatch(/^Subject:/m);
    expect(text).toContain("Name: Sam de Vries");
  });

  it("states marketing consent in words, both ways", async () => {
    const { renderInquiryMail } = await loadMail(CONFIGURED);

    expect(renderInquiryMail(inquiry({ consent: true })).text).toContain(
      "Marketing consent: yes",
    );
    // `false` must still be stated. An absent line would read as "not asked".
    expect(renderInquiryMail(inquiry({ consent: false })).text).toContain(
      "Marketing consent: no",
    );
  });
});

describe("sendInquiryMail", () => {
  it("addresses the notification so a reply reaches the visitor", async () => {
    const { sendInquiryMail } = await loadMail(CONFIGURED);

    await expect(sendInquiryMail(inquiry())).resolves.toBe(true);
    expect(sendMail).toHaveBeenCalledTimes(1);

    const sent = sendMail.mock.calls[0]?.[0] as Record<string, unknown>;
    // From our own domain: a message claiming to be from the visitor's domain
    // is what SPF and DMARC exist to reject.
    expect(sent.from).toBe("AssistSec <noreply@assistsec.nl>");
    expect(sent.to).toBe("contact@assistsec.nl");
    expect(sent.replyTo).toBe("sam@klant.nl");
    expect(sent.subject).toContain("Contact request");
  });

  it("reports failure instead of sending when SMTP is not configured", async () => {
    const { sendInquiryMail } = await loadMail({ SMTP_HOST: "" });

    await expect(sendInquiryMail(inquiry())).resolves.toBe(false);
    expect(createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  /*
   * The row is committed before this runs, so a transport that is down must
   * leave a retryable row rather than throw into the request path and show an
   * error to somebody who filled the form in correctly.
   */
  it("swallows a transport failure and reports it as undelivered", async () => {
    const { sendInquiryMail } = await loadMail(CONFIGURED);
    sendMail.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    await expect(sendInquiryMail(inquiry())).resolves.toBe(false);
  });

  it("builds the transport once, not once per message", async () => {
    const { sendInquiryMail } = await loadMail(CONFIGURED);

    await sendInquiryMail(inquiry());
    await sendInquiryMail(
      inquiry({ id: "aaaaaaaa-0000-0000-0000-000000000000" }),
    );

    expect(sendMail).toHaveBeenCalledTimes(2);
    // A connection per message is the failure this cache exists to prevent.
    expect(createTransport).toHaveBeenCalledTimes(1);
  });

  it("uses implicit TLS on 465 and STARTTLS everywhere else", async () => {
    const { sendInquiryMail } = await loadMail({
      ...CONFIGURED,
      SMTP_PORT: "465",
    });
    await sendInquiryMail(inquiry());

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 465, secure: true }),
    );

    createTransport.mockClear();
    const other = await loadMail({ ...CONFIGURED, SMTP_PORT: "587" });
    await other.sendInquiryMail(inquiry());

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ port: 587, secure: false }),
    );
  });

  it("omits auth entirely when no user is set, rather than sending empties", async () => {
    const { sendInquiryMail } = await loadMail({
      ...CONFIGURED,
      SMTP_USER: "",
      SMTP_PASSWORD: "",
    });
    await sendInquiryMail(inquiry());

    // An open relay on a private network is a legitimate setup; offering it a
    // blank username is not.
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ auth: undefined }),
    );
  });
});
