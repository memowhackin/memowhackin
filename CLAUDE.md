# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`frontend` is the **AssistSec marketing site**: a single, static landing page built from the Figma
source (`Assist Sec.fig` → canvas `🌟 Design` → frame `Homepage - 1`). It has no backend of its own.
The product — login, scanner, customer portal — lives on a separate host (`scanner.assistsec.nl`),
so every "app" action here is an outbound link, not an in-app route.

## Rules for Claude

Avoid using hard-coded pixel values. The UI should be responsive to the user's viewport. Use Tailwind and DaisyUI classes when available.

Avoid nested ternary operations. Use switch/case or if-checks instead.

Do not use the type `any`. No `as any` or `: any` types allowed.

Avoid multiple or multi-step type-casts (e.g. do not do `value as unknown as Type`).

Prefer the nullish coalescing operator (`??`) over logical or (`||`), as it is safer (enforced by `@typescript-eslint/prefer-nullish-coalescing`). Only fall back to `||` when you intentionally need empty-string/`0`/`false` treated as absent.

Never commit, push, merge, or perform any other write git operations. Read-only git commands are fine.

If you are unsure, ask the user instead of guessing — it is always better to ask clarifying questions than to do useless work.

Always add a unique, descriptive, stable `data-testid` attribute to interactive and testable UI elements.

## Architecture Overview

**Stack:** React 19 + TypeScript (strict), Vite, TanStack Router (file-based), Tailwind CSS v4 +
DaisyUI v5, i18next, `lucide-react` for icons. There is no data layer — no React Query, no HTTP
client, no auth. Don't add one without being asked.

### Routing

File-based routing via TanStack Router. **`src/routeTree.gen.ts` is auto-generated** by the vite
plugin on `dev`/`build` — do not edit it, and it is git-ignored. Routes live in `src/routes/`.
There is exactly one page: `src/routes/index.tsx` (`/`), which composes the landing sections in
order. `__root.tsx` renders `SiteHeader` / `SiteFooter` around the outlet and keeps `<html lang>`
and `document.title` in sync with the active language. No route guards — every page is public.

### Page structure

`src/routes/index.tsx` is the running order of the design, one component per Figma section:

| Component (`src/components/landing/`) | Section in the design                                     |
| ------------------------------------- | --------------------------------------------------------- |
| `Hero`                                | headline, sub-copy, "Book a live demo"                    |
| `PlatformShowcase`                    | portal screenshots, floating tags, partner row            |
| `AutonomousAgents`                    | skyline photo, oversized mono headline, agent alerts      |
| `Services`                            | pentesting / cloud / red teaming cards, alternating sides |
| `WhyAssistSec`                        | "Get hacked by AssistSec." three pillars                  |
| `Benefits`                            | report preview with labels, sample-report CTA             |
| `BlogHighlights`                      | three article teasers                                     |
| `ClosingCta`                          | robotic hand, final "Book a demo"                         |

Shared pieces live in `src/components/common/`: `SectionShell` (content column + gutters),
`BrandButton` (the pill CTA, three variants), `Logo` (`LogoLockup` / `LogoMark` /
`LogoWordmarkOutline`, vector paths exported from the Figma file).

### External links and copy

Outbound URLs and in-page anchor ids are centralised in [src/config/site.ts](src/config/site.ts) —
never inline `https://scanner.assistsec.nl/...` in a component. All external anchors use
`target="_blank"` with `rel="noreferrer noopener"`; `BrandButton` does this for you.

Section content (blog posts, service cards, pillars) is static arrays inside each component that
hold **translation keys**, not literal strings. If a real blog API arrives, that's the seam to
replace.

### Internationalization

Two languages: English (`en`, default) and Dutch (`nl`). Translation files in
`src/locales/{lang}/translation.json`, loaded inline in `src/localization/i18n.ts`. **Add every new
key to both files.** The stored choice lives under `assistsec-locale`; storage access is wrapped in
try/catch so the app still boots where `localStorage` is unavailable.
`VITE_NO_TRANSLATIONS=true` locks the UI to English and hides the switcher.

```bash
npx i18next-cli extract   # extract new keys from source
npx i18next-cli types     # regenerate src/@types/resources.d.ts
```

### Styling & theming

Tailwind CSS v4 utility classes directly in JSX; `clsx` for conditional classes.
[src/index.css](src/index.css) holds everything design-system: the Google Fonts import
(Inter for UI/body, Geist Mono for display), a single DaisyUI theme named `assistsec`, and the
brand tokens under `@theme`.

**The site is dark by design** — the Figma file has one fixed look, so there is no light theme and
no theme toggle. Don't reintroduce one.

Brand tokens, straight from the Figma frame — use these utilities instead of hex values:
`bg-ink` `#110f2a` · `bg-ink-deep` `#0d0b21` · `bg-indigo-deep` `#292362` · `bg-indigo` `#413994` ·
`text-lavender` `#ad9dee` · `text-lavender-soft` `#ede9ff` · `text-mist` `#edeff7` ·
`text-mist-dim` `#d3d6e0` · `text-ember` `#ff4e22` · `text-slate-ink` `#141517`.
`font-display` is Geist Mono; `font-sans` is Inter. Two custom utilities carry the brand gradient:
`brand-sweep` (background) and `brand-rule` (gradient hairline).

### Design conventions

- **Brand tokens only.** Use the `@theme` tokens above and DaisyUI semantic classes. Don't paste
  hex values into components — the exceptions are the few inline `style` gradients where a token
  can't express a multi-stop radial, and those are commented.
- **No hard-coded pixels.** Use Tailwind's spacing/size scale and relative units; lay out with
  flex/grid. `oxfmt` sorts Tailwind classes (`sortTailwindcss`) — let it.
- **Images** live in `public/assets/` as `.webp`, exported from the Figma file. Always set `width`,
  `height`, `alt` (via i18n) and `loading="lazy"`; decorative layers get `aria-hidden`.
- **Accessibility is a hand-held convention** — `eslint-plugin-jsx-a11y` is deprecated and no longer
  installed, so nothing lints it for you. Give icon-only buttons an `aria-label`, mark decorative
  icons and layers `aria-hidden`, and keep every control reachable and labelled by hand.
- **`data-testid` on every interactive/testable element**, with stable, descriptive names
  (e.g. `hero-book-demo`, `service-cloud-explore`). The e2e suite asserts on section testids.
- **User-facing text goes through i18n** — no string literals in JSX. Add keys to both locale files.

## Where the design comes from

The source of truth is the Figma file, canvas `🌟 Design`, frame `Homepage - 1` (node `49:19107`),
reachable over the Figma MCP server with file key `5OEOY7bxZ6mmvcJYo4KwPo`. Use `get_design_context`
on a _leaf_ frame — the whole page frame exceeds the response limit and comes back as bare metadata.

The exported `Assist Sec.fig` at the repo root is the offline fallback. It is a zip: `canvas.fig` is a
zstd-compressed Kiwi message holding the node tree, `images/` holds the raw bitmaps and `videos/`
holds the hero banner loop. When a design question comes up, re-read the frame rather than guessing
at spacing or copy.

**Fonts.** The frame specifies Uncut Sans (UI/body), Neue Haas Grotesk Text Pro (hero headline) and
Geist Mono (display headings). The first two are not distributable, so `--font-sans` names them first
and falls back to Inter, which is what actually renders today; Geist Mono is loaded for real. Dropping
licensed copies into the stack needs no code change.

## Commands

```bash
npm install
npm run dev          # vite dev server on :3000 (generates routeTree.gen.ts)
npm run build        # tsc -b && vite build
npm run lint         # eslint
npm run test         # vitest
npm run e2e          # playwright smoke tests (first run: npx playwright install chromium)
npm run fmt          # oxfmt
```
