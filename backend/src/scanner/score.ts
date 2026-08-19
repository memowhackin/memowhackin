import type { PublicWebsiteFinding } from "./redact.js";

/*
 * The headline score.
 *
 * A number out of a hundred is a real product decision with a real cost, so it
 * is worth writing down what this one does and does not claim.
 *
 * It scores the *observed public surface*, not the security of the business.
 * An unauthenticated scan cannot see authorization, business logic or anything
 * behind a login, so a hundred here means "nothing wrong on the outside", not
 * "safe". The copy beside the dial says exactly that, and it is the reason the
 * dial is labelled with what it measured rather than with the word "security"
 * alone.
 *
 * The arithmetic is deliberately simple and published:
 *
 *   - Every finding costs points by severity.
 *   - Unverified findings cost a quarter of what confirmed ones do, so a pile
 *     of maybes cannot sink a score on its own.
 *   - The cost per finding tapers: the fifth missing header is not five times
 *     the problem of the first, and a linear scale would put every large site
 *     at zero and make the number useless for comparison.
 *
 * Deterministic, so the same findings always produce the same number. Nobody
 * can act on a score that moves when it is refreshed.
 */

const SEVERITY_COST: Record<string, number> = {
  high: 18,
  medium: 8,
  low: 3,
  info: 0,
};

const CONFIDENCE_WEIGHT: Record<string, number> = {
  confirmed: 1,
  high: 0.8,
  possible: 0.25,
};

export type ScoreBand = "strong" | "fair" | "weak" | "poor";

export interface SurfaceScore {
  /** 0 to 100, rounded. */
  value: number;
  band: ScoreBand;
}

/**
 * Score a set of findings.
 *
 * The taper is applied per severity class rather than across the whole list,
 * so ten low findings still cost less than one high one — which is the
 * ordering a reader expects and the one a flat taper would break.
 */
export function surfaceScore(
  findings: readonly PublicWebsiteFinding[],
): SurfaceScore {
  let penalty = 0;

  for (const severity of ["high", "medium", "low"]) {
    const inClass = findings.filter((finding) => finding.severity === severity);
    if (inClass.length === 0) continue;

    const cost = SEVERITY_COST[severity] ?? 0;

    inClass
      // Heaviest first, so the taper discounts the least important of a class.
      .map((finding) => CONFIDENCE_WEIGHT[finding.confidence] ?? 0.25)
      .sort((a, b) => b - a)
      .forEach((weight, index) => {
        // 1, 1/2, 1/3 … which flattens quickly without ever reaching zero.
        penalty += cost * weight * (1 / (index + 1));
      });
  }

  const value = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  return { value, band: bandFor(value) };
}

function bandFor(value: number): ScoreBand {
  if (value >= 85) return "strong";
  if (value >= 65) return "fair";
  if (value >= 40) return "weak";
  return "poor";
}
