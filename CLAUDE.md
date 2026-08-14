# CLAUDE.md

## Rules for Claude

Avoid using hard-coded pixel values. The UI should be responsive to the user's viewport. Use Tailwind and DaisyUI classes when available.

Avoid nested ternary operations. Use switch/case or if-checks instead.

Do not use the type `any`. No `as any` or `: any` types allowed.

Avoid multiple or multi-step type-casts (e.g. do not do `value as unknown as Type`).

Prefer the nullish coalescing operator (`??`) over logical or (`||`), as it is safer (enforced by `@typescript-eslint/prefer-nullish-coalescing`). Only fall back to `||` when you intentionally need empty-string/`0`/`false` treated as absent.

Never commit, push, merge, or perform any other write git operations. Read-only git commands are fine. `git add` and `git mv` are write operations too.

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

**The public site has no data layer beyond the blog, and must keep it that way.** No React Query,
no HTTP client library, no auth in any public route. Don't add one without being asked.

**Blog content comes from the CMS at runtime**, through `frontend/src/config/blog.ts` — a `fetch`
against `/api/public/posts`, resolved by a TanStack Router loader so the router waits rather than
painting an empty page. Posts are not committed anywhere in this repository; publishing in the CMS
changes the site with no rebuild. `VITE_CMS_API_URL` is empty by default, meaning same-origin:
nginx, the vite dev server and the static servers used for prerendering and e2e all proxy `/api`
to the backend, so no cross-origin request is ever made and there is no CORS entry to maintain.

**Exactly two files in `frontend/src/` make network calls — keep it that way**, so the network
surface stays auditable in one place: `config/blog.ts` reads published posts, and `config/cms.ts`
does everything the admin area needs (`/studio-b78262a861` and its login: sign in, CRUD, uploads,
publish). Nothing in the frontend is a security control: the server authorizes every request, and
the UI hiding a button is a courtesy, not a boundary.

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

## Testing

- `npm run check` at the root: format, lint, typecheck, unit tests for both apps.
- `npm run e2e`: Playwright. Locally it runs against the dev server; with `CI=1` it builds,
  prerenders, and serves `dist/` the way nginx does — including a `no-javascript` project that
  checks what a crawler receives.
- `backend/src/api.test.ts` attacks the running API (auth, CSRF, injection, traversal, uploads)
  and needs a reachable Postgres.
