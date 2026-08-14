# AssistSec landing

The AssistSec marketing site (`assistsec.nl`) and the small CMS that its blog
runs on.

Two applications in one repository:

|                 |                                   |                                                              |
| --------------- | --------------------------------- | ------------------------------------------------------------ |
| **`frontend/`** | React 19 + TypeScript + Vite      | The public site. Static — no server, no data layer, no auth. |
| **`backend/`**  | Express 5 + TypeScript + Postgres | The blog CMS: admin login, posts, image uploads.             |

The product itself (the scanner, the customer portal) is a **separate project**
at `scanner.assistsec.nl`. Nothing here talks to it, shares a database with it,
or uses its accounts.

---

## How it fits together

```
                writes a post
   author ──────────────────────►  backend/  ──►  Postgres
     │        /studio-b78262a861   (the CMS)          │
     │                                                │
     │                                  GET /api/public/posts
     │                                                │
     ▼                                                ▼
   frontend/  ────────────── nginx /api proxy ────────┘
     │
     ▼
   visitors ──►  prerendered HTML, then the live post list
```

Posts live in Postgres and nowhere else. No copy of the blog is committed to
this repository, so publishing in the CMS changes the site immediately — no
rebuild, no deploy, no generated JSON to drift out of sync with what is actually
published.

The site fetches them from `/api/public/posts` — **same origin**, proxied to the
backend by nginx (and by the vite dev server locally). Nothing in the browser
ever makes a cross-origin request, so there is no CORS configuration to keep
correct and no second hostname baked into the bundle.

The build **prerenders every route to real HTML** (`npm run build:static`): it
loads each page in a real browser, waits for that fetch to resolve, and writes
the result to disk. Crawlers, link unfurlers and readers without JavaScript get
the full article text and the SEO tags rather than an empty `<div id="root">`;
React mounts on top of that markup when the page loads and takes over.

Prerendering therefore needs a reachable CMS, and `docker compose build` does
not have one — compose builds images before it starts any service. That case
degrades rather than fails: the marketing pages are prerendered, the blog is
left to render in the browser, and the build warns. Build where the CMS is
reachable when the blog's SEO matters.

### Languages

The site ships **one build per language**, not one build that switches at
runtime — a search engine indexes URLs, and a language kept in `localStorage`
has no URL to index. The default language keeps the bare paths so no existing
link moves; every other language is prefixed:

```
/about        English      /nl/about        Dutch
/blog/<slug>  English      /nl/blog/<slug>  Dutch
```

Each build is prerendered in its own language, they cross-reference each other
with `hreflang` (plus `x-default`), each carries a canonical pointing at itself,
and one `sitemap.xml` at the root lists them all.

**Adding a language means adding it to `SUPPORTED_LANGUAGES` in
`frontend/src/config/locale.ts` and dropping in a translation file.** The build,
the prerender, the sitemap, the `hreflang` tags, the `_redirects` rules and the
nginx fallback all derive from that list — nothing else is hardcoded.

Blog posts are per-language too. Each build requests its own language, and a
language with no posts of its own **falls back to the default language** rather
than showing an empty blog. Slugs are per-language, so a Dutch article can live
at its own Dutch URL.

Today only English posts exist, so both languages serve the same articles under
translated page furniture — `hreflang` describes that correctly rather than as
duplicate content. Write one Dutch post in the CMS and that language stops
falling back, with no build or config change.

---

## Repository layout

```
.
├── frontend/            the public site (see frontend/ for its own config)
│   ├── src/             app code; config/blog.ts reads posts, config/cms.ts writes
│   ├── e2e/             Playwright tests
│   ├── scripts/         build-locales.mjs, prerender.mjs, serve-dist.mjs
│   ├── Dockerfile       multi-stage: node build -> nginx
│   └── nginx.conf       SPA fallback + /api proxy to the backend
├── backend/             the CMS API (see backend/README.md for detail)
│   ├── src/             routes, auth, sanitizer, migrations runner
│   ├── drizzle/         generated SQL migrations — version-controlled
│   └── Dockerfile       multi-stage, runs as a non-root user
├── docker-compose.yml   the whole application: postgres + backend + site
├── eslint.config.js     one lint config covering both apps
└── package.json         repo tooling and orchestration only
```

The root `package.json` owns repo-wide concerns — formatting, linting, git
hooks — and delegates everything else. Each app has its own `package.json`,
lockfile and Dockerfile, so they build and deploy independently.

---

## Local development

Prerequisites: Node (current release) and a reachable PostgreSQL 16.

```bash
git clone <repo> && cd landing

# dependencies for the root tooling and both apps
npm ci && npm run install:all

# backend
cp backend/.env.example backend/.env    # fill in database settings
npm run db:migrate
npm --prefix backend run create-admin   # prompts; there is no signup endpoint
npm run dev:backend                     # http://localhost:8001

# frontend, in a second terminal
cp frontend/.env.example frontend/.env   # defaults are fine locally
npm run dev:frontend                    # http://localhost:3000
```

Then sign in at http://localhost:3000/studio-b78262a861/login.

The public pages work with the backend switched off. Only `/studio-b78262a861` and
`/studio-b78262a861/login` need it.

---

## Configuration

Nothing is configured by editing code, and no secret is ever committed. Each
piece has its own example file:

| file            | used by          | notes                                                 |
| --------------- | ---------------- | ----------------------------------------------------- |
| `backend/.env`  | the API          | database, allowed origins, cookie policy, deploy hook |
| `frontend/.env` | the build        | `VITE_CMS_API_URL`, language switch                   |
| `.env` (root)   | `docker compose` | passed to containers as environment                   |

Two settings that cause confusing failures if they are wrong:

**`ALLOWED_ORIGINS`** must list the exact origin people load the site from. It
is not decorative — the API rejects any state-changing request whose `Origin` is
not on the list, so a mismatch shows up as every login failing with `403`.

**`SECURE_COOKIES`** must be `true` in any deployment served over HTTPS, and
`false` only for plain HTTP (a local `docker compose up`). Browsers silently
drop a `Secure` cookie sent over HTTP, which looks exactly like a login that
succeeds and then instantly forgets you.

**Quote any `.env` value containing `#`.** dotenv reads an unquoted `#` as the
start of a comment, so `DB_PASSWORD=hunter#2` arrives as `hunter` and the only
symptom is `password authentication failed`.

---

## Database and migrations

Postgres, accessed through Drizzle. Schema lives in
`backend/src/db/schema.ts`; the SQL in `backend/drizzle/` is generated from it
and is the version history — those files are committed and must never be edited
after they have run anywhere.

```bash
npm run db:migrate                       # apply pending migrations (dev)
npm --prefix backend run db:generate     # after editing schema.ts
npm --prefix backend run db:migrate:prod # apply from the compiled build
```

Migrations run as their **own step, never on application startup**. Two
instances starting together would otherwise race the same DDL, and a failed
migration would leave a half-started app instead of stopping the deploy. In
`docker-compose.yml` this is the `migrate` service, which the backend waits on
via `service_completed_successfully`.

Applying twice is a no-op — applied migrations are recorded in a `drizzle`
schema inside your database and skipped. Nothing resets or drops data on start.

Read the generated SQL before applying it. Drizzle infers intent from a schema
diff, and a column rename looks identical to a drop plus an add.

Full detail — rollbacks, starting over, seed data — is in
[`backend/README.md`](backend/README.md).

---

## Common commands

Run from the repository root:

| command                                  | what it does                                                  |
| ---------------------------------------- | ------------------------------------------------------------- |
| `npm run check`                          | format, lint, typecheck and test everything                   |
| `npm run lint`                           | eslint across both apps                                       |
| `npm run fmt`                            | format the repo (oxfmt)                                       |
| `npm run test`                           | unit tests, both apps                                         |
| `npm run e2e`                            | Playwright against the built site                             |
| `npm run build`                          | build both apps                                               |
| `npm --prefix frontend run build:static` | build every language **and prerender** — use this for deploys |
| `npm run dev:frontend` / `dev:backend`   | run one app                                                   |
| `npm run db:migrate`                     | apply migrations                                              |

Per-app commands work too: `npm --prefix backend run <script>`.

---

## Docker

`docker compose up` runs the entire application — database, API and site — on
one host.

```bash
cp .env.example .env      # set DB_PASSWORD at minimum
docker compose up -d --build
# http://localhost:8080

# first account — interactively:
docker compose run --rm backend node dist/scripts/create-admin.js
# ...or non-interactively, e.g. from a provisioning script:
printf 'you@example.com\nYour Name\nyour-password\nyour-password\n' \
  | docker compose run --rm -T backend node dist/scripts/create-admin.js
```

The password is never accepted as a command-line argument: arguments land in
shell history and are visible in the process list to every user on the box.

What it builds:

- **postgres** — not published to the host; only the backend reaches it, over
  the compose network.
- **migrate** — applies migrations, then exits. The backend will not start until
  it has completed successfully.
- **backend** — production dependencies only, running as a non-root user, with
  uploads on a named volume so a rebuild cannot delete the blog's images.
- **frontend** — nginx serving the compiled bundle and proxying `/api` to the
  backend, so the browser makes **no cross-origin request at all**: no CORS, no
  preflight, and a plain first-party session cookie.

Both images are multi-stage; neither ships source, dev dependencies or a
TypeScript toolchain. Every secret arrives as runtime environment, so the same
image is used in every environment.

For production, put TLS in front (nginx or a load balancer), set
`SECURE_COOKIES=true` and `ALLOWED_ORIGINS=https://your-domain`, and back up two
things: the Postgres database and the `blog_uploads` volume. Uploaded images
exist nowhere else.

---

## Deployment

Two deployment shapes are supported, and they are not exclusive:

1. **All-in-one (compose)** — as above. Simplest, one host, good for staging or
   a small production footprint.
2. **Static host + API** — the frontend builds to `frontend/dist/` and deploys
   to a static host (Cloudflare Pages / Netlify; `public/_redirects` carries the
   SPA fallback), while only the backend runs on the VPS behind
   `cms.assistsec.nl`. This is what `DEPLOY_HOOK_URL` exists for: publishing a
   post asks the static host to rebuild.

In shape 2 the browser _does_ make a cross-origin request, so
`ALLOWED_ORIGINS` must list the site's origin and `VITE_CMS_API_URL` must point
at the API.

---

## Backups

Two things hold state, and losing either is unrecoverable:

```bash
# 1. the database — posts, accounts, audit log
docker compose exec -T postgres pg_dump -U "$DB_USER" -Fc "$DB_NAME" > blog-$(date +%F).dump

# 2. uploaded images — these exist nowhere else, not even in git
docker run --rm -v landing_blog_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/blog-uploads-$(date +%F).tar.gz -C /data .
```

Restoring the database alone gives you posts whose images all 404. Back up both,
on the same schedule.

## Security

Design notes, so nobody has to rediscover why the code looks the way it does:

- **Post HTML is sanitized on write, server-side**, and only the sanitized
  result is stored. The site renders bodies with `dangerouslySetInnerHTML`, so
  anything that survives the sanitizer runs in a visitor's browser.
  `backend/src/blog/sanitize.ts` is the boundary; its tests are the guard.
- **CSRF is defended by a synchronizer token bound to the session**, plus an
  `Origin` allowlist. `SameSite=Lax` is _not_ sufficient here — `assistsec.nl`
  and `cms.assistsec.nl` are the same site, so Lax still sends the cookie.
- **Sessions are rows, not JWTs**, so logout, lockout and revoking a stolen
  cookie are real operations rather than waiting for an expiry.
- **Uploads are re-encoded** through sharp, which is what strips EXIF and
  rejects a file that merely claims to be an image. SVG is refused: it is a
  document that can carry script.
- **Nothing in the frontend is a security control.** The server authorizes every
  request; a hidden button is a courtesy.
- Accounts are created only by `create-admin` on the server. There is no
  registration endpoint.

The frontend once shipped a hardcoded admin username and password in its public
bundle. Both are gone from the code, but **that credential is permanently
compromised** — it remains in git history and in every previously deployed
bundle, where anyone can still read it. It must be rotated everywhere it was
ever used. The value itself is deliberately not repeated here; recover it from
git history if you need to check where it was reused.

---

## Troubleshooting

**Every login returns 403.** `ALLOWED_ORIGINS` does not include the origin the
browser is actually using. Check the port and scheme, not just the hostname.

**Login succeeds but you are immediately signed out again.** `SECURE_COOKIES` is
on while the site is served over plain HTTP, so the browser discarded the
cookie. Either put TLS in front or set it to `false` for that deployment.

**`password authentication failed`, but the password is right.** An unquoted `#`
in `.env` truncated it. Quote the value.

**The blog shows old posts after publishing.** Published posts reach the site at
build time. Rebuild, or configure `DEPLOY_HOOK_URL` so publishing does it.

**`npm run e2e` times out waiting for the dev server.** Something else is on
port 3000; vite silently moves to 3001 while Playwright waits on 3000.

**Type errors about `./routeTree.gen`.** The generated route tree is missing —
`npm --prefix frontend run routes` recreates it. It is gitignored on purpose.
