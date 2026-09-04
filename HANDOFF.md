# In-flight work on `argus-2`

## One thing needs you

**SMTP credentials**, as backend environment variables. Without them inquiries
are still stored and still visible in the studio, they are just not emailed:

- `SMTP_HOST`, `SMTP_PORT` (587, or 465 for implicit TLS)
- `SMTP_USER`, `SMTP_PASSWORD`
- `SMTP_FROM` — must be a domain you are allowed to send as. Defaults to
  `AssistSec <noreply@assistsec.nl>`.
- `INQUIRY_RECIPIENT` — defaults to `contact@assistsec.nl`.

Everything else is in place: `nodemailer` 9.1.1 and `@types/nodemailer` 8.0.1
are installed and the code typechecks and lints clean against them, and the
`inquiries` migration is committed as `drizzle/0006_fluffy_sunspot.sql`. Run
`npm run db:migrate` in `backend/` wherever it has not been applied yet.

## How "every inquiry is received" is achieved

The row is written to the database **before** any mail is attempted, and the
HTTP response does not depend on delivery. A mail provider that is down,
throttling or not configured cannot lose an inquiry: it leaves a row with a
null `delivered_at`, which the studio flags as "Not emailed". That flag is the
queue of anything still to answer by hand.

```sql
SELECT * FROM inquiries WHERE delivered_at IS NULL ORDER BY created_at;
```

## Where it lives

- `backend/src/db/schema.ts` — the `inquiries` table.
- `backend/src/inquiries/routes.ts` — `POST /api/public/inquiries`, public,
  rate limited, zod-validated, with a honeypot field. Answers 202 once stored.
- `backend/src/inquiries/mail.ts` — SMTP over nodemailer. `replyTo` is the
  visitor so answering the notification answers them; `from` stays our own
  domain so SPF and DMARC pass. Never throws into the request path.
- `backend/src/blog/routes.admin.ts` — `GET /api/inquiries?kind=contact|demo`,
  behind the same session, CSRF and rate-limit guards as the rest of the studio.
- `frontend/src/config/inquiries.ts` — the public client. This is a **fourth**
  network-calling file; `CLAUDE.md` has been updated to say four.
- `frontend/src/components/admin/InquiriesAdmin.tsx` — one screen, two routes:
  `/studio-b78262a861/contact-inquiries` and `/demo-inquiries`.

## Not yet done

- A backend test for `POST /api/public/inquiries`, in the style of
  `backend/src/api.test.ts` (needs a reachable Postgres).
- End-to-end proof that a real message arrives at `contact@assistsec.nl`, which
  cannot be run until the SMTP credentials above exist.
