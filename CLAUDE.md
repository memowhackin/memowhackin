# CLAUDE.md

## Rules for Claude

Avoid using hard-coded pixel values. The UI should be responsive to the user's viewport. Use Tailwind and DaisyUI classes when available.

Avoid nested ternary operations. Use switch/case or if-checks instead.

Do not use the type `any`. No `as any` or `: any` types allowed.

Avoid multiple or multi-step type-casts (e.g. do not do `value as unknown as Type`).

Prefer the nullish coalescing operator (`??`) over logical or (`||`), as it is safer (enforced by `@typescript-eslint/prefer-nullish-coalescing`). Only fall back to `||` when you intentionally need empty-string/`0`/`false` treated as absent.

If you are unsure, ask the user instead of guessing — it is always better to ask clarifying questions than to do useless work.

## Repository layout

Two applications, plus a thin root that owns repo-wide tooling:

```
frontend/   the public marketing site (Vite + React 19 + TanStack Router)
backend/    the blog CMS API (Express 5 + Postgres via Drizzle)
./          eslint + oxfmt + husky config, orchestration scripts, docker-compose
```

Lint, format and git hooks are configured **once, at the root**, and cover both apps —
`eslint.config.js` applies React rules to `frontend/` and Node rules to `backend/`. Each app owns
its own `package.json`, lockfile, tsconfig and Dockerfile.

Run repo-wide commands from the root (`npm run check`, `npm run lint`, `npm run fmt`); per-app
ones with `npm --prefix frontend run <script>`. Paths in this file are repo-relative — note the
`frontend/` and `backend/` prefixes.

## Frontend

**Stack:** React 19 + TypeScript (strict), Vite, TanStack Router (file-based), Tailwind CSS v4 +
DaisyUI v5, i18next, `lucide-react` for icons.

**The public site has two data-backed features — the blog and the exposure scanner — and must keep
it that way.** No React Query, no HTTP client library, no state-management library. Don't add a
third without being asked.

The scanner (`/security-scan`) is the one place a public route holds authenticated state: a private
personal report is unlocked by a single-use token mailed to the address it belongs to. That token
travels in the URL fragment, never a query string, and is spent server-side on first use. Website
scans carry no auth at all — the opaque scan id is the whole capability, which is why a scan id
never reveals its subject, and why an email scan is deliberately _not_ readable from its id.

**Blog content comes from the CMS at runtime**, through `frontend/src/config/blog.ts` — a `fetch`
against `/api/public/posts`, resolved by a TanStack Router loader so the router waits rather than
painting an empty page. Posts are not committed anywhere in this repository; publishing in the CMS
changes the site with no rebuild. `VITE_CMS_API_URL` is empty by default, meaning same-origin:
nginx, the vite dev server and the static servers used for prerendering and e2e all proxy `/api`
to the backend, so no cross-origin request is ever made and there is no CORS entry to maintain.

**Exactly four files in `frontend/src/` make network calls — keep it that way**, so the network
surface stays auditable in one place: `config/blog.ts` reads published posts, `config/cms.ts` does
everything the admin area needs (`/studio-b78262a861` and its login: sign in, CRUD, uploads,
publish), `config/scanner.ts` does everything the exposure scanner needs, and
`config/inquiries.ts` posts the contact and demo forms. Nothing in the
frontend is a security control: the server authorizes every request, and the UI hiding a button is
a courtesy, not a boundary. In particular the scanner's field validation exists so a typo gets an
answer without a round trip; `backend/src/scanner/normalize.ts` re-derives every rule and its
answer is the one that decides anything.

**`frontend/src/main.tsx` must call `createRoot` unconditionally.** The build prerenders every
route to static HTML, and the old `if (!rootElement.innerHTML)` guard meant React never mounted
over that markup — a page that looks correct and does nothing. It is `createRoot`, not
`hydrateRoot`, on purpose: reveal-on-scroll, viewport queries and the stored language all differ
between the snapshot and the visitor, so hydration would treat each as a mismatch.

**The site is built once per language** (`frontend/scripts/build-locales.mjs`), each to its own
path — `/` for the default, `/nl` for the rest — and prerendered in that language. The language is
fixed at build time by `VITE_SITE_LOCALE` and read through `frontend/src/config/locale.ts`; it is
deliberately _not_ read from `localStorage` any more, because a language without a URL cannot be
indexed. Switching language is a navigation, not a state change.

`SUPPORTED_LANGUAGES` in `frontend/src/config/locale.ts` is the single source of truth: the build
scripts read it out of that file rather than keeping their own copy, so adding a language must not
require touching build tooling, hosting config or the sitemap.

**Prerendering needs the CMS; building does not.** `npm run build` only compiles the bundle.
`npm run build:static` additionally renders every route in a real browser, so it asks the CMS which
articles exist. When the CMS is unreachable — which is always true during `docker compose build`,
since compose builds images before it starts anything — it warns and prerenders the marketing pages
only. The blog then still works for readers, who run JavaScript, but is invisible to crawlers. That
is why a deploy that cares about blog SEO builds where the CMS is reachable.

## Backend

**Stack:** Express 5 + TypeScript, Postgres via Drizzle, argon2id passwords, DB-backed sessions.
See `backend/README.md` for migrations, accounts and deployment.

Invariants that took work to get right — changing any of them reopens a real hole:

- **Post HTML is sanitized on write** (`backend/src/blog/sanitize.ts`) and only the sanitized
  result is stored. The site renders bodies with `dangerouslySetInnerHTML`, so anything that
  survives the sanitizer runs in a visitor's browser. Never move this to render time. Its tests
  are the guard — do not weaken them to make a formatting feature work.
- **`style` attributes are stripped**; image sizing rides on `data-display-width`.
- **SVG uploads are rejected** and every image is re-encoded through sharp. An SVG is a document
  that can carry script.
- **CSRF is a synchronizer token bound to the session, plus an `Origin` allowlist.**
  `SameSite=Lax` is _not_ sufficient: `assistsec.nl` and `cms.assistsec.nl` are the same site.
- **Sessions are rows, not JWTs**, so logout and revocation are real operations.
- **Responses are built by explicit field mapping** (`backend/src/blog/serialize.ts`), never by
  returning a database row.
- **Migrations run as their own step, never on startup**, and are generated by drizzle-kit —
  never hand-written, never edited after they have run anywhere.

### Scanner invariants (`backend/src/scanner/`)

Changing any of these reopens a hole that took work to close:

- **Fixture results are refused in production**, twice over: `env.ts` will not boot with
  `SCANNER_PROVIDER=fixture` under `NODE_ENV=production`, and `providers/index.ts` will not hand
  them out there either. Inventing security findings about a real company is the worst thing this
  feature could do, so it is guarded in two independent places.
- **The subject never reaches a URL or a log.** A scan id is opaque; mail logging records the
  recipient's domain only. The website report body is a deliberate exception: it names the
  hostnames found in Certificate Transparency, and the apex is usually among them, so anyone
  holding the results link can see what was scanned. Every name in that list is already public in
  an append-only log, the page is `noindex` and `no-store`, and the link is the capability. What
  stays redacted is `evidence` — readable paths and version banners, which are not public and do
  shorten an attack.
- **Email scans are unreadable from their id.** They are unlocked only by a single-use token, and
  `GET /scans/:id` answers 404 for them — not 403, because confirming the row exists is itself the
  disclosure.
- **The email endpoint answers identically for every address**, always 202 with the same body and
  no id. Any observable difference turns it into a breach-membership oracle.
- **SSRF checks run on the resolved address, never the hostname, and every record must pass.**
  `resolvePublicAddress` returns the literal it approved; connecting to anything else — including
  re-resolving the name — reopens DNS rebinding.
- **No password material at any fidelity.** `BreachRecord` has no field for a password, a hash or
  a fragment, and `redact.ts` enforces two digits of a phone number, a country code and nothing
  finer. Tests assert the absence.
- **Tokens are stored hashed and spent in one conditional UPDATE.** A read-then-write would be a
  replay window.

## Testing

- `npm run check` at the root: format, lint, typecheck, unit tests for both apps.
- `npm run e2e`: Playwright. Locally it runs against the dev server; with `CI=1` it builds,
  prerenders, and serves `dist/` the way nginx does — including a `no-javascript` project that
  checks what a crawler receives.
- `backend/src/api.test.ts` attacks the running API (auth, CSRF, injection, traversal, uploads)
  and needs a reachable Postgres.
