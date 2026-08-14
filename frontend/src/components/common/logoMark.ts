/**
 * The square mark's design canvas. It lives apart from `Logo.tsx` so callers
 * that stamp the mark into their own artwork (the hero lattice, for one) can
 * centre it without re-reading the viewBox — and so `Logo.tsx` stays
 * component-only, which is what Fast Refresh needs.
 */
export const LOGO_MARK_VIEWBOX = { width: 60.27, height: 52 } as const;
