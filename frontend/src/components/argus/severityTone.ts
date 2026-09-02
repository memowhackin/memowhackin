/** Severity, in the three colours the rest of the site already spends. */
export type Severity = "critical" | "high" | "medium";

/*
 * Its own module rather than an export from `PortalUI`, because a component
 * file that also exports a constant cannot be hot-reloaded — and because
 * severity must be spelt in exactly one set of tones, or the queue and the
 * CVSS score explaining it drift apart.
 */
export const SEVERITY_TONE: Record<Severity, string> = {
  critical: "bg-ember/15 text-ember border-ember/30",
  high: "bg-warning/10 text-warning border-warning/25",
  medium: "bg-lavender/10 text-lavender border-lavender/25",
};
