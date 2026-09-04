import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { inArray } from "drizzle-orm";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { db } from "../db/client.js";
import { inquiries } from "../db/schema.js";

/*
 * The contact and demo endpoint, exercised over a real socket against a real
 * database, because the property that matters is an ordering one: the row is
 * committed first and the mail attempted second, so a mail transport that is
 * down cannot lose an inquiry. A unit test with a mocked database would assert
 * the calls happened and prove nothing about the row surviving.
 *
 * Mail is mocked. It has its own tests, and an SMTP server is not the subject.
 */

const sendInquiryMail = vi.hoisted(() => vi.fn());
vi.mock("./mail.js", () => ({ sendInquiryMail }));

let server: Server;
let base: string;
const created: string[] = [];

/*
 * The suite writes rows. Refuse to run against anything not named like a
 * throwaway database, for the same reason `api.test.ts` does.
 */
function assertDisposableDatabase(): void {
  const name = process.env.DB_NAME ?? "";
  if (process.env.ALLOW_DESTRUCTIVE_TESTS === "1") return;
  if (/(^|[_-])test(ing)?$/.test(name)) return;
  throw new Error(
    `refusing to write test rows to "${name}": its name does not end in _test.`,
  );
}

beforeAll(async () => {
  assertDisposableDatabase();
  const { app } = await import("../index.js");
  server = app.listen(0);
  base = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

afterAll(async () => {
  if (created.length > 0) {
    await db.delete(inquiries).where(inArray(inquiries.id, created));
  }
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}, 30_000);

beforeEach(() => {
  sendInquiryMail.mockReset().mockResolvedValue(true);
});

const VALID = {
  kind: "contact",
  name: "Sam de Vries",
  email: "sam@klant.nl",
  company: "Klant B.V.",
  subject: "Web application pentest",
  phone: "+31 6 12345678",
  message: "We are launching in March.",
  consent: true,
  locale: "nl",
} as const;

/*
 * The origin header is not optional. Every state-changing request passes the
 * allowlist in `security/origin.ts`, this endpoint included — a public form is
 * still a POST, and a browser always sends one.
 */
const ORIGIN = "http://localhost:3000";

async function post(body: unknown): Promise<Response> {
  return fetch(`${base}/api/public/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify(body),
  });
}

/** The row this request created, remembered so it can be cleaned up. */
async function latestFor(email: string) {
  const rows = await db.select().from(inquiries);
  const row = rows
    .filter((r) => r.email === email)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  if (row !== undefined) created.push(row.id);
  return row;
}

describe("POST /api/inquiries", () => {
  it("stores exactly what was typed and answers 202", async () => {
    const response = await post(VALID);
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });

    const row = await latestFor("sam@klant.nl");
    expect(row).toBeDefined();
    expect(row?.kind).toBe("contact");
    expect(row?.name).toBe("Sam de Vries");
    expect(row?.company).toBe("Klant B.V.");
    expect(row?.phone).toBe("+31 6 12345678");
    expect(row?.message).toBe("We are launching in March.");
    expect(row?.consent).toBe(true);
    expect(row?.locale).toBe("nl");
  });

  it("accepts a demo request", async () => {
    const response = await post({
      ...VALID,
      kind: "demo",
      email: "demo@klant.nl",
    });
    expect(response.status).toBe(202);

    const row = await latestFor("demo@klant.nl");
    expect(row?.kind).toBe("demo");
  });

  it("marks the row delivered only once the mail is accepted", async () => {
    await post({ ...VALID, email: "delivered@klant.nl" });

    const row = await latestFor("delivered@klant.nl");
    expect(row?.deliveredAt).toBeInstanceOf(Date);
  });

  /*
   * The reason the row is written before the mail is attempted. A transport
   * that is down, throttled or simply unconfigured leaves a retryable row, and
   * the visitor — who filled the form in correctly — still gets a 202.
   */
  it("keeps the inquiry and still answers 202 when delivery fails", async () => {
    sendInquiryMail.mockResolvedValue(false);

    const response = await post({ ...VALID, email: "undelivered@klant.nl" });
    expect(response.status).toBe(202);

    const row = await latestFor("undelivered@klant.nl");
    expect(row).toBeDefined();
    expect(row?.deliveredAt).toBeNull();
  });

  it("fills in the optional fields rather than storing undefined", async () => {
    const response = await post({
      kind: "contact",
      name: "Minimal",
      email: "minimal@klant.nl",
    });
    expect(response.status).toBe(202);

    const row = await latestFor("minimal@klant.nl");
    expect(row?.company).toBeNull();
    expect(row?.phone).toBeNull();
    expect(row?.message).toBeNull();
    // Defaults, not nulls: the columns are NOT NULL.
    expect(row?.consent).toBe(false);
    expect(row?.locale).toBe("en");
  });

  describe("rejects what it should", () => {
    const bad: [string, unknown][] = [
      ["an unknown kind", { ...VALID, kind: "partnership" }],
      ["a malformed address", { ...VALID, email: "not-an-email" }],
      ["a missing name", { kind: "contact", email: "a@b.nl" }],
      ["an empty name", { ...VALID, name: "   " }],
      ["a name past the cap", { ...VALID, name: "x".repeat(201) }],
      ["a message past the cap", { ...VALID, message: "x".repeat(5001) }],
      ["an unsupported locale", { ...VALID, locale: "de" }],
      ["no body at all", {}],
    ];

    it.each(bad)("refuses %s", async (_label, body) => {
      const response = await post(body);
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: "invalid_request",
      });
      expect(sendInquiryMail).not.toHaveBeenCalled();
    });
  });

  /*
   * The honeypot. Nothing legitimate fills `website` in, because nothing
   * legitimate can see it.
   *
   * This asserts what the endpoint does today, which is not what the comment
   * above the schema in `routes.ts` describes: that comment says a bot "gets a
   * 202 and goes away, which is quieter than a rejection it could learn from",
   * but `z.string().max(0)` fails the whole payload and the handler answers
   * 400. Both are defensible — a 400 is louder, and a bot can use it to find
   * the trap by bisecting fields. If the 202 is what is wanted, the honeypot
   * has to leave the schema and be checked in the handler; change this
   * assertion in the same commit.
   */
  it("drops a submission that filled the hidden field", async () => {
    const response = await post({
      ...VALID,
      email: "bot@spam.example",
      website: "http://spam.example",
    });

    expect(response.status).toBe(400);
    expect(sendInquiryMail).not.toHaveBeenCalled();

    const rows = await db.select().from(inquiries);
    expect(rows.some((r) => r.email === "bot@spam.example")).toBe(false);
  });

  it("accepts the hidden field when it is present but empty", async () => {
    const response = await post({
      ...VALID,
      email: "human@klant.nl",
      website: "",
    });
    expect(response.status).toBe(202);
    await latestFor("human@klant.nl");
  });
});
