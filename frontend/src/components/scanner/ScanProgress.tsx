import { useTranslation } from "react-i18next";
import { GlassPanel } from "@/components/scanner/GlassPanel";

/*
 * The waiting state.
 *
 * A scan takes well under a minute, so this reads as work in progress without
 * inventing detail it does not have. One arc turning over a faint track, the
 * word "Scanning", and a single line of reassurance. The arc is the only
 * moving part, and it is the whole effect: no stage checklist, no progress
 * bar, no list of the protocols being read, which dressed one indeterminate
 * wait up as a dashboard.
 */

export function ScanProgress() {
  const { t } = useTranslation();

  return (
    <GlassPanel
      className="max-w-2xl"
      innerClassName="flex flex-col items-center gap-7 px-6 py-16 text-center sm:py-20"
    >
      <div
        data-testid="scan-progress"
        className="flex flex-col items-center gap-7"
      >
        <Spinner />

        <div className="flex flex-col gap-2">
          <p
            aria-live="polite"
            data-testid="scan-progress-status"
            className="font-display text-mist text-2xl leading-tight font-normal sm:text-3xl"
          >
            {t("scanner.progress.scanning")}
          </p>
          <p className="text-mist/50 text-sm">
            {t("scanner.progress.scanningHint")}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}

/*
 * A thin arc over its own faint track. Drawn rather than borrowed from the icon
 * set: a lucide spinner is a stroke-only glyph that reads as a placeholder,
 * where the two-circle build states the full ring first and then sweeps one
 * segment of it, which is the difference between "loading" and considered.
 * Radius 20 gives a circumference near 126; the dash shows just under a third
 * of it. It only turns where motion is welcome.
 */
function Spinner() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="text-lavender size-12 motion-safe:animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        strokeWidth="3"
        className="stroke-indigo-deep"
      />
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="126"
        strokeDashoffset="90"
        className="stroke-current"
      />
    </svg>
  );
}
