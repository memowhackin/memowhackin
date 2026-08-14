# Landing CMS backend

The blog's own backend: admin login, post storage, image uploads. Express 5 +
TypeScript + Postgres (Drizzle). It is deliberately independent of the product
API — its own service, its own database, its own accounts.

The public marketing site never calls this at runtime. It reads posts once, at
build time, and ships them as static HTML. Only the admin UI at `/studio-b78262a861`
talks to this service while someone is using it.

```
src/
  env.ts          config, validated on boot — the process exits if it is wrong
  db/             drizzle schema, pool, migration runner
  auth/           argon2 passwords, DB-backed sessions, rate limiting
  blog/           sanitizer, routes, image processing
  audit.ts        who did what
scripts/          create-admin, import-seed
drizzle/          generated SQL migrations — commit these
```

---

## First run (local)

```bash
cd backend
npm install
cp .env.example .env      # then fill it in
npm run db:migrate
npm run create-admin
npm run dev               # http://localhost:8001
```

Check it came up:

```bash
curl -s localhost:8001/health          # {"ok":true}
curl -s localhost:8001/api/public/posts # []
curl -o /dev/null -w '%{http_code}\n' localhost:8001/api/posts  # 401
```

### Filling in `.env`

Database settings are separate fields rather than one `DATABASE_URL`, because a

**Quote any value containing `#`.** dotenv reads an unquoted `#` as the start of
a comment, so an unquoted password is silently truncated at the first `#` and
the only symptom is `password authentication failed`:

```ini
DB_PASSWORD='s3cret#value!'   # correct — quoted, arrives intact
```

`ALLOWED_ORIGINS` is an exact, comma-separated list. Wildcards are not accepted
and would be rejected by browsers anyway, since these routes use credentials.

---

## Migrations

Drizzle generates SQL from `src/db/schema.ts`. You never hand-write the SQL, and
you never edit a migration after it has run anywhere.

### Changing the schema

```bash
# 1. edit src/db/schema.ts
# 2. generate the SQL
npm run db:generate
# 3. read what it produced — always
cat drizzle/0001_*.sql
# 4. apply it
npm run db:migrate
```

Step 3 is not optional. Drizzle infers intent from the diff, and a column rename
looks exactly like a drop plus an add: run it unread and the data in that column
is gone. If the generated SQL is wrong, delete the file, fix the schema, and
regenerate.

Commit both `drizzle/*.sql` and `drizzle/meta/`. The meta directory is how the
next `generate` knows what already exists; without it you get a migration that
tries to recreate every table.

### Applying migrations

| where       | command                   | notes                                                        |
| ----------- | ------------------------- | ------------------------------------------------------------ |
| local / dev | `npm run db:migrate`      | runs the TypeScript directly through tsx                     |
| production  | `npm run db:migrate:prod` | runs the compiled `dist/`, so no dev dependencies are needed |

Both are the same code and both are idempotent — already-applied migrations are
recorded in a `drizzle` schema in your database and skipped. Running it twice is
a no-op, not an error.

Migrations run as a **separate step, never on boot**. If the service applied them
at startup, two containers starting together would race the same DDL.

Deploy order:

```bash
docker compose build landing-api
docker compose run --rm landing-api npm run db:migrate:prod
docker compose up -d landing-api
```

### Rolling back

Drizzle does not generate down-migrations, so there is no `db:rollback`. Write a
new forward migration that undoes the change. For anything destructive, take a
dump first:

```bash
pg_dump -h "$DB_HOST" -U "$DB_USER" -d as_landing -Fc -f before-migration.dump
```

### Starting over (development only)

```bash
psql -h "$DB_HOST" -U "$DB_USER" -d as_landing \
  -c 'drop schema public cascade; create schema public; drop schema if exists drizzle cascade;'
npm run db:migrate
```

Never on production. This deletes every post.

---

## Accounts

There is no registration endpoint. Accounts exist only because someone ran:

```bash
npm run create-admin
```

It prompts for email, name and password — prompts rather than arguments, so the
password stays out of shell history and out of `ps`. Minimum 12 characters,
stored as argon2id.

To lock someone out without deleting their posts, set `is_active = false`; their
sessions stop working on their next request rather than whenever the cookie
would have expired.

```sql
update admin_users set is_active = false where email = 'someone@assistsec.nl';
```

---

## Importing the old file-based posts

```bash
npm run import-seed -- --dir ./seed --author you@assistsec.nl
```

Idempotent on `(slug, locale)`, so re-running skips what is already there. Post
bodies go through the sanitizer during import, on purpose: if sanitizing alters
existing content, better to see it now than on someone's first edit.

---

## API

| method           | path                                    | auth                                         |
| ---------------- | --------------------------------------- | -------------------------------------------- |
| POST             | `/api/auth/login`                       | — (rate limited: 10 per 15 min per IP+email) |
| POST             | `/api/auth/logout`                      | cookie                                       |
| GET              | `/api/auth/me`                          | cookie                                       |
| GET              | `/api/public/posts?locale=en`           | none — published only                        |
| GET              | `/api/public/posts/:slug`               | none                                         |
| GET              | `/api/public/media/:filename`           | none                                         |
| GET/POST         | `/api/posts`                            | admin                                        |
| GET/PATCH/DELETE | `/api/posts/:id`                        | admin                                        |
| POST             | `/api/posts/:id/publish` · `/unpublish` | admin                                        |
| POST             | `/api/media`                            | admin, multipart `file`                      |
| POST             | `/api/deploy`                           | admin                                        |
| GET              | `/health`                               | none                                         |

Public reads live under `/api/public/` so the unauthenticated surface is obvious
at a glance and can be cached and rate-limited separately at nginx.

### Calling it from the frontend

Every state-changing request needs three things: the session cookie, a matching
`X-CSRF-Token` header, and an `Origin` on the allowlist. `src/config/cms.ts` in
the frontend does all three — it is the only file in the site that makes network
calls, so there is one place to audit.

```
POST /api/auth/login  ->  { id, email, name, csrfToken }
                          cookie set httpOnly; token returned in the body
POST /api/posts       ->  cookie + X-CSRF-Token + allowed Origin
```

The token is returned in the body and **never** set as a cookie. The admin UI is
served from `assistsec.nl` and this API from `cms.assistsec.nl`, so its
JavaScript cannot read a cookie this origin sets — and a token an attacker's
page cannot read is exactly the point. `GET /api/auth/me` re-issues it after a
page reload; the frontend holds it in memory rather than `localStorage`, which
any injected script could read.

---

## Things that will bite you if you change them

**Post bodies are sanitized on write, and only the sanitized HTML is stored.**
`src/blog/sanitize.ts` is the security boundary of this service: the marketing
site renders bodies with `dangerouslySetInnerHTML`, so anything that survives it
runs in a visitor's browser. Sanitizing at render time instead would leave the
payload sitting in the database waiting for the one consumer that forgets.
`src/blog/sanitize.test.ts` is the guard — do not weaken it to make a formatting
feature work.

**`style` attributes are stripped.** Image sizing rides on `data-display-width`
and is styled by the site's CSS. Author-controlled CSS is an overlay and exfil
surface, not formatting.

**Relative `src="/api/public/media/…"` must survive sanitization.** There is a test for
exactly this. If it ever fails, every uploaded image silently disappears from the
published site.

**SVG uploads are rejected.** An SVG is a document that can carry script; served
from the marketing origin it is stored XSS. Uploads are decoded and re-encoded to
WebP through sharp, which is what actually strips EXIF and anything smuggled past
a content-type check.

**Sessions are rows, not JWTs.** That is what makes logout, lockout and revoking
a leaked cookie real operations instead of waiting for an expiry.

**`SameSite=Lax` is not the CSRF defence here, and must not be mistaken for it.**
`assistsec.nl` and `cms.assistsec.nl` are the _same site_, so Lax happily sends
the session cookie on a request from any subdomain — and `multipart/form-data`
is CORS-safelisted, so an upload needs no preflight either. What actually closes
this is the pair in `src/security/`: a synchronizer token bound to the session
row, plus an `Origin` allowlist on every non-GET request. Removing either one
re-opens it.

**`.strict()` on the post schema is load-bearing.** Without it a client can post
`status` or `publishedAt` and have them spread into the row — publishing straight
past the publish endpoint and its audit entry.

**Responses are built by explicit field mapping** in `src/blog/serialize.ts`,
never by returning a database row. A row spread into JSON leaks whatever column
gets added next.

---

## Production

Behind nginx on `cms.assistsec.nl`, with `app.set("trust proxy", 1)` already set
so rate limits see the real client IP rather than the proxy.

```nginx
server {
    server_name cms.assistsec.nl;
    client_max_body_size 10m;   # image uploads

    location / {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Set `NODE_ENV=production`, and `SECURE_COOKIES=true` once TLS is in front.

`GET /health` queries the database rather than just answering `ok`, so a process
whose datastore is unreachable reports `503` and an orchestrator stops routing
to it. `docker-compose.yml` and the Dockerfile both use it as their healthcheck.

`SIGTERM` and `SIGINT` shut down gracefully: the listener stops accepting
connections, in-flight requests finish, the connection pool closes, and a 10s
timeout forces the exit if something hangs. That is what makes `docker stop` and
a rolling restart safe rather than a dropped upload.

`ALLOWED_ORIGINS` must include `https://assistsec.nl`. The cookie is host-only
with `SameSite=Lax`, which works because `assistsec.nl` and `cms.assistsec.nl`
are the same site. Do not set a cookie `domain`; that hands the session to every
subdomain for no benefit.

**Back up two things**, or the blog exists in exactly one place:

- the `as_landing` database
- `uploads/blog/` — the image files, which are not in the database
