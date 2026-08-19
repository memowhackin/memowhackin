import { Suspense, lazy, useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Link } from "@tanstack/react-router";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { SectionShell } from "@/components/common/SectionShell";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import { ScoreDial } from "@/components/scanner/ScoreDial";
import { TechStack } from "@/components/scanner/TechStack";
import { buildWebsiteGraph } from "@/components/scanner/websiteGraphModel";
import type { ScanState, WebsiteFinding } from "@/config/scanner";

/*
 * The website report.
 *
 * Rebuilt away from panels. The previous version put every part of the page
 * inside a rounded, bordered box on the same ground — summary, diagram,
 * details, each finding, the call to action — which is the failure the brief
 * names as card soup: sixteen containers, four of them nested inside another,
 * nine carrying a border on both the parent and its children. A box stops
 * meaning anything when everything is one, and the page read as a dashboard
 * template rather than as a document.
 *
 * Structure now comes from what a printed report uses: a measure that changes
 * with importance, space that changes with hierarchy, and alignment. There is
 * exactly one bordered surface left, and it is the call to action, which is
 * the only element meant to read as an object.
 *
 * Findings are a list rather than a grid of cards, each a row with an accent
 * rule and a native `<details>` for the reasoning — the same disclosure the
 * service pages already use for their questions, so this page is built from
 * the site's vocabulary instead of a new one.
 */

const ExposureGraph = lazy(async () => {
  const module = await import("@/components/scanner/ExposureGraph");
  return { default: module.ExposureGraph };
});

/** Severity as a leading rule. Colour reinforces; the word is the label. */
const SEVERITY_ACCENT: Record<string, string> = {
  high: "bg-ember",
  medium: "bg-lavender",
  low: "bg-indigo-bright",
  info: "bg-indigo-deep",
};

const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  info: 3,
};
const CONFIDENCE_ORDER: Record<string, number> = {
  confirmed: 0,
  high: 1,
  possible: 2,
};

/**
 * The verdict, as the page's opening statement.
 *
 * A headline and a lede rather than an eyebrow, a card, a meter and two metric
 * tiles. The counts are a sentence because that is how a person says them, and
 * a row of statistic tiles for three numbers is the pattern that makes a page
 * look automatically generated.
 */
function Verdict({
  scan,
  findingCount,
  areaCount,
  hostCount,
}: {
  scan: ScanState;
  findingCount: number;
  areaCount: number;
  hostCount: number;
}) {
  const { t } = useTranslation();
  const band = scan.websiteResult?.scoreBand ?? "fair";

  return (
    <div
      data-testid="scan-verdict"
      className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16"
    >
      <ScoreDial scan={scan} />

      <div className="flex max-w-2xl flex-col gap-5">
        <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-[2.5rem] lg:leading-[1.14]">
          {t(`scanner.scoreBands.${band}.title`)}
        </h1>

        <p className="text-mist/75 text-lg leading-relaxed text-pretty">
          {t(`scanner.scoreBands.${band}.body`)}
        </p>

        {/*
          What the number is a number *of*. Without this the dial is the same
          unlabelled scale the four bars were: a reading with no units, which
          is what made "Elevated" meaningless.
        */}
        <p className="text-mist/50 max-w-prose text-sm leading-relaxed text-pretty">
          {t("scanner.report.scoreScope")}
        </p>

        <p className="text-mist/55 text-base leading-relaxed">
          {t("scanner.report.summaryLine", {
            findings: findingCount,
            areas: areaCount,
            count: findingCount,
          })}{" "}
          {t("scanner.report.summaryHosts", { count: hostCount })}
        </p>
      </div>
    </div>
  );
}

/**
 * One finding: a row, not a card.
 *
 * `<details>` keeps the reasoning in the document whether or not it is open,
 * which is what a crawler and a screen reader read, and gives the keyboard
 * behaviour for free.
 */
function Finding({ finding }: { finding: WebsiteFinding }) {
  const { t } = useTranslation();
  const key = `scanner.findings.${finding.id}`;

  return (
    <details
      data-testid={`scan-finding-${finding.id}`}
      className="group border-indigo-deep/50 border-t"
    >
      <summary className="flex cursor-pointer list-none items-start gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className={clsx(
            "mt-1.5 h-8 w-0.5 shrink-0 rounded-full",
            SEVERITY_ACCENT[finding.severity] ?? "bg-indigo-deep",
          )}
        />

        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-mist group-hover:text-lavender text-base leading-snug font-medium text-pretty transition-colors sm:text-lg">
            {t(`${key}.title`, {
              defaultValue: t("scanner.findings.fallback.title"),
            })}
          </span>
          <span className="text-mist/45 text-sm">
            {t(`scanner.categories.${finding.category}`)}
            {" · "}
            {t(`scanner.severity.${finding.severity}`)}
            {" · "}
            {t(`scanner.confidence.${finding.confidence}.short`)}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="text-mist/30 group-hover:text-lavender mt-1 shrink-0 text-lg leading-none transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <div className="flex max-w-2xl flex-col gap-4 pb-6 pl-8 sm:pl-9">
        <p className="text-mist/70 text-sm leading-relaxed text-pretty">
          {t(`${key}.observed`, {
            defaultValue: t("scanner.findings.fallback.observed"),
          })}
        </p>
        <p className="text-mist/70 text-sm leading-relaxed text-pretty">
          {t(`${key}.impact`, {
            defaultValue: t("scanner.findings.fallback.impact"),
          })}
        </p>
        <p className="text-mist/85 text-sm leading-relaxed text-pretty">
          {t(`${key}.remediation`, {
            defaultValue: t("scanner.findings.fallback.remediation"),
          })}
        </p>
      </div>
    </details>
  );
}

/**
 * A run of hostnames.
 *
 * Set as wrapped text rather than a row or a card each: forty subdomains as
 * forty rows is a page of scrolling, and as forty pills it is decoration.
 * Wrapped names at a small size is how a list like this is set in print, and
 * it reflows at every width without a breakpoint.
 */
function NameList({
  names,
  tone,
}: {
  names: readonly string[];
  tone?: "alert" | "quiet";
}) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {names.map((name) => (
        <li
          key={name}
          className={clsx(
            "text-sm leading-relaxed",
            tone === "alert" && "text-ember",
            tone === "quiet" && "text-mist/55",
            tone === undefined && "text-mist/75",
          )}
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

export function WebsiteReport({ scan }: { scan: ScanState }) {
  const { t } = useTranslation();
  const result = scan.websiteResult;
  const wideEnough = useMediaQuery("(min-width: 1024px)");

  const graph = useMemo(() => {
    if (result === undefined) return undefined;
    if (
      result.findings.length === 0 &&
      result.assets.length === 0 &&
      result.lookalikes.length === 0
    ) {
      return undefined;
    }
    return buildWebsiteGraph(
      {
        findings: result.findings,
        assets: result.assets,
        lookalikes: result.lookalikes,
      },
      {
        subject: t("scanner.graph.website.subject"),
        category: (key) => t(`scanner.categories.${key}`),
        finding: (id) =>
          t(`scanner.findings.${id}.title`, {
            defaultValue: t("scanner.findings.fallback.title"),
          }),
        explain: (id) =>
          t(`scanner.findings.${id}.impact`, {
            defaultValue: t("scanner.findings.fallback.impact"),
          }),
        action: (id) =>
          t(`scanner.findings.${id}.remediation`, {
            defaultValue: t("scanner.findings.fallback.remediation"),
          }),
        subjectExplanation: t("scanner.graph.website.subjectExplanation"),
        kindNames: {
          subject: t("scanner.graph.website.kinds.subject"),
          category: t("scanner.graph.website.kinds.category"),
          finding: t("scanner.graph.website.kinds.finding"),
          host: t("scanner.graph.website.kinds.host"),
          lookalike: t("scanner.graph.website.kinds.lookalike"),
        },
        categoryExplanation: (key) =>
          t(`scanner.graph.website.categoryExplanation.${key}`, {
            defaultValue: t("scanner.graph.website.categoryFallback"),
          }),
        provenance: {
          scan: t("scanner.graph.website.provenanceScan"),
          category: (key) => t(`scanner.categories.${key}`),
        },
        relation: {
          covers: t("scanner.graph.website.relations.covers"),
          found: t("scanner.graph.website.relations.found"),
        },
        hosts: {
          title: t("scanner.report.hostsTitle"),
          explanation: t("scanner.graph.website.hostsExplanation"),
          nodeExplanation: t("scanner.graph.website.hostExplanation"),
        },
        lookalikes: {
          title: t("scanner.report.lookalikesTitle"),
          explanation: t("scanner.graph.website.lookalikesExplanation"),
          parked: t("scanner.graph.website.lookalikeParked"),
          mail: t("scanner.graph.website.lookalikeMail"),
          action: t("scanner.graph.website.lookalikeAction"),
        },
      },
    );
  }, [result, t]);

  if (result === undefined) return null;

  const areas = new Set(result.findings.map((finding) => finding.category));
  // Worst and most certain first: the order a reader would triage in.
  const ordered = [...result.findings].sort((a, b) => {
    const bySeverity =
      (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4);
    if (bySeverity !== 0) return bySeverity;
    return (
      (CONFIDENCE_ORDER[a.confidence] ?? 3) -
      (CONFIDENCE_ORDER[b.confidence] ?? 3)
    );
  });

  const mailCapable = result.lookalikes.filter((entry) => entry.hasMail);
  const parked = result.lookalikes.filter((entry) => !entry.hasMail);

  return (
    <>
      <SectionShell
        data-testid="scan-report"
        className="bg-transparent"
        innerClassName="flex flex-col gap-14 pb-16 lg:gap-20 lg:pb-24"
      >
        <Verdict
          scan={scan}
          findingCount={result.findings.length}
          areaCount={areas.size}
          hostCount={result.assets.length}
        />

        {/*
          The map, where there is room for it. Below `lg` the list is the
          better reading and the diagram is not rendered at all, rather than
          squeezed into a column it does not fit.
        */}
        {wideEnough && graph !== undefined && (
          <section data-testid="scan-graph" className="flex flex-col gap-8">
            <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
              {t("scanner.graph.website.title")}
            </h3>
            <Suspense fallback={<GraphSkeleton rows={ordered.length + 4} />}>
              <ExposureGraph model={graph} />
            </Suspense>
          </section>
        )}

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
              {t("scanner.report.findingsTitle")}
            </h3>
            <p className="text-mist/45 text-sm">
              {t("scanner.report.findingsHint")}
            </p>
          </div>

          {ordered.length === 0 ? (
            <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
              {t("scanner.report.emptyBody")}
            </p>
          ) : (
            <div className="border-indigo-deep/50 border-b">
              {ordered.map((finding) => (
                <Finding key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </section>

        <TechStack technologies={result.technologies} />

        {result.lookalikes.length > 0 && (
          <section
            data-testid="scan-lookalikes"
            className="flex flex-col gap-8"
          >
            <div className="flex max-w-2xl flex-col gap-3">
              <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
                {t("scanner.report.lookalikesTitle")}
              </h3>
              <p className="text-mist/70 text-base leading-relaxed text-pretty">
                {t("scanner.report.lookalikesBody", {
                  count: result.lookalikes.length,
                })}
              </p>
            </div>

            {mailCapable.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-mist/80 max-w-2xl text-sm leading-relaxed">
                  {t("scanner.report.lookalikesMail", {
                    count: mailCapable.length,
                  })}
                </p>
                <NameList
                  names={mailCapable.map((entry) => entry.domain)}
                  tone="alert"
                />
              </div>
            )}

            {parked.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-mist/55 text-sm">
                  {t("scanner.report.lookalikesOther", {
                    count: parked.length,
                  })}
                </p>
                <NameList
                  names={parked.map((entry) => entry.domain)}
                  tone="quiet"
                />
              </div>
            )}
          </section>
        )}

        {result.assets.length > 0 && (
          <section data-testid="scan-hosts" className="flex flex-col gap-6">
            <div className="flex max-w-2xl flex-col gap-3">
              <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
                {t("scanner.report.hostsTitle")}
              </h3>
              <p className="text-mist/70 text-base leading-relaxed text-pretty">
                {t("scanner.report.hostsBody", { count: result.assets.length })}
              </p>
            </div>
            <NameList names={result.assets} />
          </section>
        )}
      </SectionShell>

      {/*
        The one object on the page. It is bordered precisely because nothing
        else is, so the single surface that asks for a decision is the single
        thing that reads as a surface.
      */}
      <SectionShell
        data-testid="scan-cta"
        className="bg-transparent"
        innerClassName="pb-16 lg:pb-24"
      >
        <div className="border-indigo-deep flex flex-col gap-6 rounded-2xl border p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-11">
          <div className="flex max-w-2xl flex-col gap-3">
            <h3 className="font-display text-mist text-xl leading-snug font-normal text-balance sm:text-2xl">
              {t("scanner.cta.website.title")}
            </h3>
            <p className="text-mist/70 text-base leading-relaxed text-pretty">
              {t("scanner.cta.website.body")}
            </p>
          </div>

          <Link
            to="/contact"
            data-testid="scan-cta-contact"
            className={brandButtonClass({
              className: "w-full shrink-0 justify-center sm:w-fit",
            })}
          >
            {t("scanner.cta.website.action")}
          </Link>
        </div>
      </SectionShell>
    </>
  );
}

/**
 * The diagram's placeholder while its chunk loads.
 *
 * Rows at the right heights in the right columns, so the page does not jump
 * when the real thing arrives. It fades rather than pulses: a pulsing block is
 * a heartbeat where nothing is happening, and the wait is a few hundred
 * milliseconds of network.
 */
function GraphSkeleton({ rows }: { rows: number }) {
  return (
    <div
      aria-hidden="true"
      className="motion-safe:animate-scan-settle flex flex-col gap-[1.625rem]"
    >
      {Array.from({ length: Math.min(rows, 10) }, (_unused, index) => (
        <div key={index} className="flex items-center gap-3">
          <span
            className="bg-indigo-deep/60 h-0.5 rounded-full"
            style={{ width: `${String(index % 3 === 0 ? 5 : 13)}rem` }}
          />
          <span
            className="bg-indigo-deep/35 h-2 rounded-full"
            style={{ width: `${String(7 + ((index * 3) % 9))}rem` }}
          />
        </div>
      ))}
    </div>
  );
}
