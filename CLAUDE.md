# CLAUDE.md

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
