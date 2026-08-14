# Landing CMS backend

The blog's own backend: admin login, post storage, image uploads. Express 5 +
TypeScript + Postgres (Drizzle). It is deliberately independent of the product
API — its own service, its own database, its own accounts.

The marketing site reads published posts from here at runtime, same-origin
through the `/api` proxy, so publishing changes the site with no rebuild. The
build additionally prerenders each article to static HTML, which is what a
crawler receives. The admin UI at `/studio-b78262a861` is the only thing that
writes.

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

### Backups

Post bodies exist only in Postgres and uploaded images only on disk, so those
two are the whole backup:

```bash
npm run db:backup                      # -> backend/backups/
BACKUP_DIR=/mnt/backups npm run db:backup
```

It dumps the database with `pg_dump -Fc`, tars `uploads/blog/`, verifies the
dump is readable with `pg_restore --list` — an unreadable dump is worse than
none, because it is trusted — and keeps the last 14 of each. Needs the Postgres
client tools (`apt install postgresql-client`).

Restoring into an empty database:

```bash
createdb -h "$DB_HOST" -U "$DB_USER" as_landing
pg_restore -h "$DB_HOST" -U "$DB_USER" -d as_landing --clean --if-exists backups/as_landing-<stamp>.dump
tar -xzf backups/uploads-<stamp>.tar.gz -C uploads/..
```

Nothing schedules this. On the server it wants a cron entry:

```cron
17 3 * * * cd /srv/landing/backend && BACKUP_DIR=/mnt/backups npm run db:backup
```

A backup nobody has restored is a hypothesis. Restore one into a scratch
database occasionally and count the posts.

### Starting over (development only)

Wipes everything and rebuilds the schema from the migrations:

```bash
psql -h "$DB_HOST" -U "$DB_USER" -d as_landing -c "
  drop schema public cascade;
  create schema public;
  grant all on schema public to \"$DB_USER\";
  drop schema if exists drizzle cascade;"
npm run db:migrate
npm run create-admin        # accounts went with the rest
```

Never on production. This deletes every post, every account and the audit log,
and none of it is recoverable without a dump.

Two details that are easy to get wrong, and both leave the database in a state
whose error message points somewhere unhelpful:

**`create schema public` is not optional.** Dropping the schema removes the
schema itself, not just the tables in it, and `search_path` still names it. Miss
that half and the next migration fails on its very first statement with

```
error: no schema has been selected to create in
```

which reads like a connection or permissions problem and is neither. The fix is
to create the schema (and grant on it — since Postgres 15 a fresh `public` does
not grant `CREATE` to everyone), then migrate again.

**Drop the `drizzle` schema too, or drop neither.** That schema holds the
migration history. Clearing it while the tables still exist makes drizzle replay
migration 1 against tables that are already there; leaving it behind after
dropping `public` is harmless but confusing, since the history then describes
tables that no longer exist. The recipe above removes both, so the rebuild starts
from nothing and `db:migrate` records all three again.

The backend does not survive its schema disappearing underneath it — restart
`npm run dev` (or the container) once the migration has run, or every request
will keep failing against a connection pool that outlived the tables.

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

## Tests

```bash
npm run test
```

The unit tests are pure. `src/api.test.ts` is different: it attacks the running
API against a real database, which means it creates accounts, publishes posts
and deletes rows.

**It refuses to run unless the database is named like a test one** — ending in
`_test`. The default `.env` on a developer's machine points at the database the
CMS actually uses, and a suite that deletes fixtures there is data loss with a
green tick beside it. Give it a database of its own:

```bash
psql -h "$DB_HOST" -U "$DB_USER" -c 'CREATE DATABASE as_landing_test'
cp .env.test.example .env.test        # then fill it in
DB_NAME=as_landing_test npm run db:migrate
```

`vitest.config.ts` loads `.env.test` ahead of `.env`, so once it exists the
suite targets it automatically. `ALLOW_DESTRUCTIVE_TESTS=1` overrides the guard
if you genuinely mean to point it somewhere else.

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

## Rebuilding the site after a publish

Publishing, updating, unpublishing or deleting a post calls `triggerDeploy`,
which POSTs to `DEPLOY_HOOK_URL` — debounced to 120s, fired without blocking
the author's save, and a silent no-op while the variable is empty.

**It is empty by default, and that has a visible consequence:** readers see a
new post immediately, because the site fetches posts at runtime, but the
prerendered HTML, the sitemap and the RSS feed stay at whatever the last build
produced. Those are what a crawler reads. Until the hook is set, publishing
does not reach search engines.

The body it sends is GitHub's `repository_dispatch` shape:

```ini
DEPLOY_HOOK_URL=https://api.github.com/repos/AssistSec/landing/dispatches
DEPLOY_HOOK_TOKEN=<fine-grained PAT, contents:read + actions:write, this repo only>
```

which needs a workflow that listens for it:

```yaml
on:
  repository_dispatch:
    types: [publish-blog]
```

A host deploy hook (Cloudflare Pages, Netlify) works too — those accept an
empty POST, so the token can be left blank and the URL is the secret. Either
way the build must run somewhere the CMS is reachable, or it prerenders the
marketing pages and skips the articles.

---

## Things that will bite you if you change them

**A post's URL follows its title, and every address it has ever had keeps
working.** Renaming a published article moves its slug — a headline about a
garage should not live at `/blog/working-in-kitchen` — and the outgoing slug is
filed in `post_slugs`. A request for a retired address answers `301` to the
current one, the public list carries each post's former addresses so the site
can redirect client-side, and `npm run build:static` turns them into real
redirect rules for the static host. Two consequences worth knowing: a slug is
never handed to a different post while it still redirects somewhere, and a draft
leaves nothing behind, because it never had a URL anyone could hold. Renaming a
post back to an earlier title reclaims its original address rather than earning a
suffixed variant.

**Duplicate titles get their own address rather than an error.** The readable
slug is used when it is free; otherwise the first eight characters of the post's
own id are appended (`practical-guide-for-x-9a6a4a3a`). The suffix comes from the
primary key so it is reproducible and cannot drift, and the editor has no slug
field — a rejection there would be a dead end for the author.

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
