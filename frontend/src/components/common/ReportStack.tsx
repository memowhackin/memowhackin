import { useTranslation } from "react-i18next";

/**
 * The artwork's intrinsic size. Set on both layers so the grid reserves the
 * row before the first spread decodes — without it the copy column snaps
 * upward as the section scrolls in.
 */
const spreadWidth = 1500;
const spreadHeight = 1300;

/**
 * The deliverable as a still life: the sample report open at the executive
 * summary, and behind it — dimmed, tilted, half-hidden — the technical
 * appendix. The back spread's "Appendix A" strip peeks above the front page
 * with its finding title cropped mid-line, which is the point: it shows that
 * more exists without ever showing it. There is deliberately no way to page
 * through here; the only path to the rest is the CTA beside it.
 *
 * It lives in `common/` because the report is what every service sells, not a
 * home-page ornament: the landing page's benefits section and each service
 * page's "what you get" both end on this picture, and a second copy of it would
 * be a second thing to keep in step with the renders.
 */
export function ReportStack() {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-none relative aspect-[1500/1300] w-full select-none">
      {/* Reading-light glow anchoring the paper on the ink background. */}
      <div
        aria-hidden="true"
        className="absolute top-[2%] left-[8%] size-[86%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-indigo-bright)_52%,transparent),color-mix(in_oklab,var(--color-indigo)_24%,transparent)_55%,transparent_80%)] opacity-60"
      />

      {/*
        The appendix, in shadow. The clip removes the render's own standing
        cover (every spread ships with one; two covers would read as a bug),
        and the up-right offset floats the surviving page's top strip above
        the front spread.
      */}
      <img
        src="/assets/report/hero-4.webp"
        srcSet="/assets/report/hero-4.webp 1x, /assets/report/hero-4@2x.webp 2x"
        width={spreadWidth}
        height={spreadHeight}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="motion-safe:animate-report-sway absolute inset-0 size-full translate-x-[5%] -translate-y-[13%] scale-[0.985] rotate-[1.5deg] object-contain brightness-[0.82] [clip-path:inset(0_0_20%_16%)]"
      />

      <img
        src="/assets/report/hero-1.webp"
        srcSet="/assets/report/hero-1.webp 1x, /assets/report/hero-1@2x.webp 2x"
        width={spreadWidth}
        height={spreadHeight}
        alt={t("benefits.reportAlt")}
        loading="lazy"
        className="absolute inset-0 size-full object-contain"
      />
    </div>
  );
}
