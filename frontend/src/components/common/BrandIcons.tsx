interface BrandIconProps {
  /** Extra classes for the root `<svg>` (sizing, colour). */
  className?: string;
}

/*
 * Third-party brand marks, drawn here because lucide dropped its brand icon
 * set. Both are the official single-path logos on a 24x24 grid, filled with
 * `currentColor` so they take the colour of whatever they sit in — which is
 * what lets the footer's links tint them on hover with no per-icon rule.
 *
 * They are decorative wherever they are used: every call site puts the brand's
 * name in text beside the glyph, so the icons are hidden from assistive
 * technology rather than repeating the label.
 */

export function LinkedInIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 21.5h5.16V9.75H2.4V21.5Zm7.9-11.75h4.95v1.61h.07c.69-1.24 2.37-2.05 4.06-2.05 4.34 0 5.14 2.66 5.14 6.12v6.07h-5.15v-5.38c0-1.28-.02-2.93-1.87-2.93-1.87 0-2.16 1.4-2.16 2.84v5.47H10.3V9.75Z"
      />
    </svg>
  );
}

export function YouTubeIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.08 0 12 0 12s0 3.92.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z"
      />
    </svg>
  );
}
