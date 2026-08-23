import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Clock, Hash, Server, type LucideIcon } from "lucide-react";
import { SITE_LOCALE } from "@/config/locale";
import { ScoreDial } from "@/components/scanner/ScoreDial";
import type { ScanState, WebsiteFinding } from "@/config/scanner";

/*
 * The report's masthead.
 *
 * The page used to open on a score dial beside a sentence, and the complaint
 * it earned was exactly right: you could not tell what you were looking at. A
 * security report is a document about a specific target at a specific moment,
 * and a document that does not say which target or which moment reads as a
 * widget someone embedded.
 *
 * So this states what a report is obliged to state before it says anything
 * else: what was examined, when, under what reference, and only then delivers
 * the verdict. The identifiers are set in the mono face because they are
 * identifiers: a hostname, a timestamp and a reference are data to be read
 * exactly, not prose.
 *
 * The severity breakdown is a row of counts rather than tiles or a meter. An
 * earlier version used four unlabelled bars and the honest reaction to it was
 * "elevated — what does this even mean?". Counts cannot be misread.
 */

/*
 * Severity as the colour of the count itself. The number carries the hue and
 * the word carries the meaning, so the breakdown reads without a dot, a chip
 * or a bar. The ramp is the dial's: ember for the worst, cooling through
 * lavender and indigo, so the two readings on this row agree at a glance.
 */
const SEVERITY_TEXT: Record<string, string> = {
  high: "text-ember",
  medium: "text-lavender",
  low: "text-indigo-bright",
  info: "text-mist/45",
};

const SEVERITY_SEQUENCE = ["high", "medium", "low", "info"] as const;

/** The scan's moment, in the build's language. */
function formatted(iso: string): string {
  if (iso.length === 0) return "";
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return "";

  return new Intl.DateTimeFormat(SITE_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(when);
}

/**
 * One labelled fact, as a small chip with an icon.
 *
 * Each fact was a bare label over a value, which read as loose text a reader
 * had to parse before knowing it was a set. A chip with an icon gives the three
 * of them a shape, and the value wraps rather than truncates: a medium
 * timestamp does not fit on one phone line, and a fact with its answer cut off
 * is the one thing a record row must not do.
 */
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
      <Icon
        aria-hidden="true"
        className="text-lavender/70 size-5 shrink-0"
        strokeWidth={1.75}
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-mist/50 text-xs">{label}</dt>
        <dd className="text-mist font-mono text-base leading-tight break-words tabular-nums">
          {value}
        </dd>
      </div>
    </div>
  );
}

export function ReportMasthead({
  scan,
  subject,
  findings,
  hostCount,
}: {
  scan: ScanState;
  subject: string;
  findings: readonly WebsiteFinding[];
  hostCount: number;
}) {
  const { t } = useTranslation();
  const band = scan.websiteResult?.scoreBand ?? "fair";

  const counts = SEVERITY_SEQUENCE.map((severity) => ({
    severity,
    total: findings.filter((finding) => finding.severity === severity).length,
  })).filter((entry) => entry.total > 0);

  const when = formatted(scan.createdAt);

  return (
    <header
      data-testid="scan-masthead"
      className="flex flex-col gap-8 lg:gap-10"
    >
      {/*
        What was examined leads, with nothing above it. The report used to open
        on a status pill, but a completed report does not need a badge to say it
        finished, and a small chip above the hostname read as a label on the
        subject. The subject is the largest thing on the page, and correctly so.
      */}
      <h1
        data-testid="scan-subject"
        className="text-mist font-mono text-3xl leading-none font-normal break-all sm:text-4xl lg:text-5xl"
      >
        {subject}
      </h1>

      {/* The record. Three facts as chips, each with its own icon. */}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {when.length > 0 && (
          <Fact
            icon={Clock}
            label={t("scanner.report.factCompleted")}
            value={when}
          />
        )}
        <Fact
          icon={Hash}
          label={t("scanner.report.factReference")}
          value={scan.id.slice(0, 8)}
        />
        <Fact
          icon={Server}
          label={t("scanner.report.factHosts")}
          value={String(hostCount)}
        />
      </dl>

      {/*
        The verdict. Keeps the `scan-verdict` handle the e2e suite asserts on:
        the block moved into the masthead, but "the page has reached a verdict"
        is still the thing those tests are waiting for.
      */}
      <div
        data-testid="scan-verdict"
        className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-16"
      >
        <ScoreDial scan={scan} />

        <div className="flex max-w-xl flex-col gap-6">
          {/*
            Smaller than the hostname above it, larger than the counts below.
            The verdict is the sentence a reader takes away, so it leads the
            column; the target still wins the page, and the numbers support the
            verdict rather than competing with it.
          */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-mist text-2xl leading-snug font-normal text-balance sm:text-3xl">
              {t(`scanner.scoreBands.${band}.title`)}
            </h2>

            <p className="text-mist/75 text-lg leading-relaxed text-pretty">
              {t(`scanner.scoreBands.${band}.body`)}
            </p>
          </div>

          {counts.length > 0 && (
            <ul
              data-testid="scan-severity-counts"
              className="flex flex-wrap items-baseline gap-x-8 gap-y-3"
            >
              {counts.map((entry) => (
                <li key={entry.severity} className="flex items-baseline gap-2">
                  <span
                    className={clsx(
                      "font-display text-2xl leading-none tabular-nums",
                      SEVERITY_TEXT[entry.severity] ?? "text-mist",
                    )}
                  >
                    {entry.total}
                  </span>
                  <span className="text-mist/60 text-sm">
                    {t(`scanner.severity.${entry.severity}`)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {scan.partial === true && (
            <p className="text-mist/50 text-sm">
              {t("scanner.report.statusPartial")}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
