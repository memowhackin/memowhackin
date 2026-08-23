import { Suspense, lazy, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { SectionShell } from "@/components/common/SectionShell";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import { EdgeProtection } from "@/components/scanner/EdgeProtection";
import { PublishedPaths } from "@/components/scanner/PublishedPaths";
import { ReportMasthead } from "@/components/scanner/ReportMasthead";
import {
  SECTION_SHELL,
  SectionHeading,
} from "@/components/scanner/SectionHeading";
import { SiteImages } from "@/components/scanner/SiteImages";
import { Subdomains } from "@/components/scanner/Subdomains";
import { TechStack } from "@/components/scanner/TechStack";
import { GateModal, type Lead } from "@/components/scanner/GateModal";
import { buildWebsiteGraph } from "@/components/scanner/websiteGraphModel";
import { ScannerError, submitLead } from "@/config/scanner";
import type {
  LookalikeDomain,
  ScanState,
  WebsiteFinding,
} from "@/config/scanner";

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

/** Severity as a filled badge. The word stays the label; colour finds it. */
const SEVERITY_BADGE: Record<string, string> = {
  high: "bg-ember/15 text-ember",
  medium: "bg-lavender/15 text-lavender",
  low: "bg-indigo-bright/20 text-lavender/80",
  info: "bg-mist/8 text-mist/55",
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
 * The report's contents.
 *
 * Eight sections is enough that a reader arriving at the top cannot see the
 * shape of what they have been given, and a long scroll with no map is the
 * other half of "it is not clear what I am looking at". Set as a single
 * wrapping strip rather than a sidebar: it costs one row, it needs no second
 * column, and on a phone it degrades to exactly the same thing.
 */
function Contents({
  entries,
}: {
  entries: readonly { id: string; label: string; count?: number }[];
}) {
  return (
    <nav data-testid="scan-contents" className="-mx-1">
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="glass text-mist/65 hover:text-mist focus-visible:outline-lavender inline-flex items-baseline gap-2 rounded-lg px-3 py-1.5 text-sm transition hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {entry.label}
              {entry.count !== undefined && (
                <span className="text-mist/45 font-mono text-sm tabular-nums">
                  {entry.count}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * One finding, as an expanding card.
 *
 * Rebuilt without the leading severity bar: a coloured rule down the edge of
 * every row is exactly the decoration the brief rules out, and it did the same
 * job the severity badge already does. What is left is the title, a tidy badge
 * row, and a chevron. The badges are the only colour, and severity is a filled
 * pill rather than a bar or a dot, so the worst rows are findable at a glance
 * without any rule or circle.
 *
 * `<details>` keeps the reasoning in the document whether or not it is open,
 * which is what a crawler and a screen reader read, and gives the keyboard
 * behaviour for free.
 */
function Finding({
  finding,
  locked,
  onLockedOpen,
}: {
  finding: WebsiteFinding;
  locked: boolean;
  onLockedOpen: () => void;
}) {
  const { t } = useTranslation();
  const key = `scanner.findings.${finding.id}`;

  const detail = [
    { part: "observed", tone: "text-mist/75" },
    { part: "impact", tone: "text-mist/75" },
    { part: "remediation", tone: "text-mist/90" },
  ] as const;

  return (
    <details
      data-testid={`scan-finding-${finding.id}`}
      className="group glass rounded-2xl transition duration-300 hover:brightness-[1.4]"
    >
      <summary
        onClick={(event) => {
          // Locked: the click opens the gate instead of expanding the row.
          // Preventing the default stops the native <details> from toggling.
          if (locked) {
            event.preventDefault();
            onLockedOpen();
          }
        }}
        className="flex cursor-pointer list-none items-start gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <h3 className="text-mist group-hover:text-lavender text-base leading-snug font-medium text-pretty transition-colors sm:text-lg">
            {t(`${key}.title`, {
              defaultValue: t("scanner.findings.fallback.title"),
            })}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={clsx(
                "rounded-md px-2.5 py-1 text-sm font-medium",
                SEVERITY_BADGE[finding.severity] ?? "bg-mist/8 text-mist/60",
              )}
            >
              {t(`scanner.severity.${finding.severity}`)}
            </span>
            <span className="glass text-mist/70 rounded-md px-2.5 py-1 text-sm">
              {t(`scanner.categories.${finding.category}`)}
            </span>
            <span className="text-mist/50 px-1 text-sm">
              {t(`scanner.confidence.${finding.confidence}.short`)}
            </span>
          </div>
        </div>

        <ChevronDown
          aria-hidden="true"
          className="text-mist/35 group-hover:text-lavender mt-1 size-5 shrink-0 transition-transform duration-300 group-open:rotate-180"
          strokeWidth={2}
        />
      </summary>

      <div className="flex max-w-2xl flex-col gap-4 px-4 pb-5 sm:px-5">
        {detail.map(({ part, tone }) => (
          <p
            key={part}
            className={clsx("text-base leading-relaxed text-pretty", tone)}
          >
            {t(`${key}.${part}`, {
              defaultValue: t(`scanner.findings.fallback.${part}`),
            })}
          </p>
        ))}
      </div>
    </details>
  );
}

/**
 * A run of hostnames, as badges.
 *
 * These were wrapped lines of plain text, which is how a list of names is set
 * in print but not how it reads on screen: with only word spacing between
 * them, `mail.acme.com vpn.acme.com` runs together and the reader has to parse
 * where one name ends. A chip gives each name its own edge, which is the whole
 * job here, and the mono face keeps the characters unambiguous.
 *
 * Alert names carry a tinted surface rather than only coloured text, so the
 * ones that matter are findable without reading every chip.
 */
function NameList({
  names,
  tone,
}: {
  names: readonly string[];
  tone?: "alert" | "quiet";
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {names.map((name) => (
        <li
          key={name}
          className={clsx(
            "max-w-full truncate rounded-lg px-3 py-1.5 font-mono text-sm ring-1",
            tone === "alert" && "bg-ember/12 text-ember ring-ember/25",
            tone === "quiet" && "bg-mist/4 text-mist/55 ring-mist/8",
            tone === undefined && "glass text-mist/80",
          )}
        >
          {name}
        </li>
      ))}
    </ul>
  );
}

/** Domains registered to resemble the target, split by whether they take mail. */
function Lookalikes({
  lookalikes,
}: {
  lookalikes: readonly LookalikeDomain[];
}) {
  const { t } = useTranslation();
  const mailCapable = lookalikes.filter((entry) => entry.hasMail);
  const parked = lookalikes.filter((entry) => !entry.hasMail);

  return (
    <section data-testid="scan-lookalikes" className={SECTION_SHELL}>
      <SectionHeading
        id="lookalikes"
        title={t("scanner.report.lookalikesTitle")}
        count={String(lookalikes.length)}
      >
        {t("scanner.report.lookalikesBody", { count: lookalikes.length })}
      </SectionHeading>

      {mailCapable.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-mist/80 max-w-2xl text-base leading-relaxed">
            {t("scanner.report.lookalikesMail", { count: mailCapable.length })}
          </p>
          <NameList
            names={mailCapable.map((entry) => entry.domain)}
            tone="alert"
          />
        </div>
      )}

      {parked.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-mist/60 text-base">
            {t("scanner.report.lookalikesOther", { count: parked.length })}
          </p>
          <NameList names={parked.map((entry) => entry.domain)} tone="quiet" />
        </div>
      )}
    </section>
  );
}

/** Session-scoped unlock, so an unlocked scan survives a refresh in this tab. */
function unlockKey(scanId: string): string {
  return `scanner:unlocked:${scanId}`;
}
function readUnlocked(scanId: string): boolean {
  try {
    return sessionStorage.getItem(unlockKey(scanId)) === "1";
  } catch {
    return false;
  }
}
function rememberUnlocked(scanId: string): void {
  try {
    sessionStorage.setItem(unlockKey(scanId), "1");
  } catch {
    // Private mode or storage disabled: the unlock just does not persist.
  }
}

/*
 * The gate's dissolve.
 *
 * A single `blur()` over the locked region drew one frosted slab with a hard
 * top edge, which reads as a screenshot behind glass. This ramps instead:
 * backdrop layers whose radius doubles from one to the next, each masked with
 * a trapezoid that rises through the band below its predecessor and falls
 * through the band above its successor. Because every mask overlaps both of
 * its neighbours, no layer's edge is ever visible on its own; the composite
 * is one continuous gradient of focus. The earlier version masked each layer
 * with a bare two-stop ramp and no overlap, and every boundary between two
 * radii printed as a seam.
 *
 * Under the deepest layers a gradient to the page's own ground finishes the
 * job: the report does not end in a smear of 32px blur, it dissolves into the
 * background the way the blog index's pattern strip does. It is purely visual
 * and never takes pointer or focus.
 *
 * Radii are set in rem, matching the one other backdrop blur on the site, so
 * the effect tracks the root type size rather than pinning to device pixels.
 */
const BLUR_LAYER_COUNT = 6;
/** Where the dissolve begins and completes, as % of the gated region. */
const RAMP_START = 8;
const RAMP_END = 78;

/** A gradient stop, tidied so the style attribute stays readable. */
function pct(value: number): string {
  return `${String(Math.round(Math.max(value, 0) * 10) / 10)}%`;
}

function ProgressiveBlur() {
  const span = (RAMP_END - RAMP_START) / BLUR_LAYER_COUNT;

  return (
    /*
     * Full-bleed on purpose. Sized to the content column, the effect stopped
     * dead at the column's edges, and the boundary between blurred text and
     * untouched page printed as a vertical seam down each side. Spanning the
     * viewport moves both edges into empty ground, where blurring a uniform
     * background changes nothing and the boundary cannot be seen. The body
     * hides horizontal overflow, so the width costs no sideways scroll.
     */
    <div
      className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2"
      aria-hidden="true"
    >
      {Array.from({ length: BLUR_LAYER_COUNT }, (_unused, index) => {
        // Doubling radii: 1, 2, 4, 8, 16, 32 css-px at the default type size.
        const radius = 0.0625 * 2 ** index;
        const rise = RAMP_START + (index - 1) * span;
        const hold = RAMP_START + index * span;
        const peak = RAMP_START + (index + 1) * span;
        const fall = RAMP_START + (index + 2) * span;

        // The deepest layer never fades back out: full blur holds to the foot.
        const mask =
          index === BLUR_LAYER_COUNT - 1
            ? `linear-gradient(to bottom, transparent ${pct(rise)}, black ${pct(hold)}, black 100%)`
            : `linear-gradient(to bottom, transparent ${pct(rise)}, black ${pct(hold)}, black ${pct(peak)}, transparent ${pct(fall)})`;

        const blur = `blur(${String(radius)}rem)`;

        return (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              backdropFilter: blur,
              WebkitBackdropFilter: blur,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}

      {/* The foot settles into the page itself rather than ending on a smear. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent ${pct(RAMP_END - 18)}, var(--color-ink) 97%)`,
        }}
      />
    </div>
  );
}

export function WebsiteReport({ scan }: { scan: ScanState }) {
  const { t } = useTranslation();
  const result = scan.websiteResult;
  const wideEnough = useMediaQuery("(min-width: 1024px)");

  /*
   * The lead gate. The free preview runs to the end of Published files; opening
   * a finding or scrolling past that asks for who is looking before the rest is
   * revealed. It is a lead wall, not a lock — the data is the visitor's own
   * public exposure — so a submit that reaches the server unlocks the report
   * whatever the server then does with the lead.
   */
  const [unlocked, setUnlocked] = useState(() => readUnlocked(scan.id));
  const [gateOpen, setGateOpen] = useState(false);
  const [gateBusy, setGateBusy] = useState(false);
  const [gateError, setGateError] = useState<string | undefined>(undefined);

  function unlock() {
    rememberUnlocked(scan.id);
    setUnlocked(true);
    setGateOpen(false);
    setGateBusy(false);
    setGateError(undefined);
  }

  function handleLead(lead: Lead) {
    setGateBusy(true);
    setGateError(undefined);
    submitLead({ scanId: scan.id, ...lead })
      .then(unlock)
      .catch((cause: unknown) => {
        // Only a rejected email keeps the gate shut; a network or server blip
        // must not trap a visitor behind a wall that is not a security control.
        if (cause instanceof ScannerError && cause.code === "invalid_email") {
          setGateError(t("scanner.gate.emailCompany"));
          setGateBusy(false);
          return;
        }
        unlock();
      });
  }

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

  /*
   * The scanned domain, recovered from the host list rather than carried in
   * the payload — the scan's subject is deliberately not a field the client
   * receives. The shortest observed name is the apex: every other host in a
   * Certificate Transparency answer for a domain is a label under it.
   */
  const subject = result.assets.reduce(
    (shortest, host) => (host.length < shortest.length ? host : shortest),
    result.assets[0] ?? "",
  );

  /*
   * The contents, built from what this scan actually produced. A fixed list
   * would advertise sections that are not on the page.
   */
  const contents: { id: string; label: string; count?: number }[] = [
    {
      id: "findings",
      label: t("scanner.report.findingsTitle"),
      count: ordered.length,
    },
  ];
  if (result.images.length > 0) {
    contents.push({
      id: "images",
      label: t("scanner.report.imagesTitle"),
      count: result.images.length,
    });
  }
  if (result.paths.entries.length > 0) {
    contents.push({
      id: "paths",
      label: t("scanner.report.pathsTitle"),
      count: result.paths.entries.length,
    });
  }
  contents.push({ id: "edge", label: t("scanner.report.edgeTitle") });
  contents.push({
    id: "stack",
    label: t("scanner.report.stackTitle"),
    count: result.technologies.length,
  });
  if (result.lookalikes.length > 0) {
    contents.push({
      id: "lookalikes",
      label: t("scanner.report.lookalikesTitle"),
      count: result.lookalikes.length,
    });
  }
  if (result.assets.length > 0) {
    contents.push({
      id: "hosts",
      label: t("scanner.report.hostsTitle"),
      count: result.assets.length,
    });
  }

  return (
    <>
      <SectionShell
        data-testid="scan-report"
        className="bg-transparent"
        innerClassName="flex flex-col gap-10 pb-16 lg:gap-12 lg:pb-24"
      >
        <ReportMasthead
          scan={scan}
          subject={subject}
          findings={result.findings}
          hostCount={result.assets.length}
        />

        <Contents entries={contents} />

        {/*
          The map, where there is room for it. Below `lg` the list is the
          better reading and the diagram is not rendered at all, rather than
          squeezed into a column it does not fit.
        */}
        {wideEnough && graph !== undefined && (
          /*
            A tighter gap than the other sections on purpose: the diagram's
            fitted frame already carries air around the constellation, so the
            standard section gap left the graph floating a long way under its
            own title. gap-4 sits it just below the heading without crowding it.
          */
          <section
            data-testid="scan-graph"
            className="flex scroll-mt-24 flex-col gap-4"
          >
            <SectionHeading id="map" title={t("scanner.graph.website.title")} />
            <Suspense fallback={<GraphSkeleton rows={ordered.length + 4} />}>
              <ExposureGraph model={graph} />
            </Suspense>
          </section>
        )}

        <section data-testid="scan-findings" className={SECTION_SHELL}>
          <SectionHeading
            id="findings"
            title={t("scanner.report.findingsTitle")}
            count={
              ordered.length === 0
                ? undefined
                : t("scanner.report.countAreas", { count: areas.size })
            }
          >
            {ordered.length === 0
              ? undefined
              : t("scanner.report.findingsHint")}
          </SectionHeading>

          {ordered.length === 0 ? (
            <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
              {t("scanner.report.emptyBody")}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {ordered.map((finding) => (
                <Finding
                  key={finding.id}
                  finding={finding}
                  locked={!unlocked}
                  onLockedOpen={() => {
                    setGateOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/*
          The gallery sits directly under the findings, which is where it earns
          its place rather than merely fitting: the brand assets here are the
          same ones a lookalike domain further down the page would be copying,
          and seeing them a screen apart is what turns that section from a list
          of strings into something the reader recognises.
        */}
        <SiteImages images={result.images} domain={subject} />

        {/*
          The free preview fades out from here. Published files is where it
          begins to go: its opening rows stay sharp and readable, and the page
          dissolves gradually through the rest into the gated sections below, so
          there is no hard edge that reads as "the content just stopped". The
          prompt follows the scroll over the frosted-out remainder.
        */}
        <div className="relative" data-testid="scan-gated">
          <div
            className={clsx(
              "flex flex-col gap-10 lg:gap-12",
              !unlocked && "max-h-[46rem] overflow-hidden select-none",
            )}
          >
            <PublishedPaths paths={result.paths} />

            <div
              className={clsx(
                "flex flex-col gap-10 lg:gap-12",
                !unlocked && "pointer-events-none",
              )}
              aria-hidden={unlocked ? undefined : true}
            >
              <EdgeProtection detections={result.waf} />

              <TechStack technologies={result.technologies} />

              {result.lookalikes.length > 0 && (
                <Lookalikes lookalikes={result.lookalikes} />
              )}

              <Subdomains hosts={result.assets} />
            </div>
          </div>

          {!unlocked && (
            <>
              <ProgressiveBlur />

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
                {/*
                  One opaque card with the border everything else uses, over the
                  page's own dark ground, not a translucent glass fill. The logo
                  pattern band tops it, matching the report modal. It sits at
                  the centre of the frosted region and stays there: a card that
                  rode along with the scroll kept pulling the eye, where a
                  fixed one reads as the label on the section it covers.
                */}
                <div
                  data-testid="scan-gate-prompt"
                  className="glass bg-ink-deep pointer-events-auto z-10 flex w-full max-w-md flex-col overflow-hidden rounded-2xl text-center"
                >
                  <img
                    src="/assets/blog-pattern.webp"
                    alt=""
                    width={488}
                    height={84}
                    aria-hidden="true"
                    className="h-16 w-full object-cover sm:h-20"
                  />
                  <div className="flex flex-col items-center gap-4 p-6 sm:p-7">
                    <div className="flex flex-col gap-1.5">
                      <p className="font-display text-mist text-xl font-normal">
                        {t("scanner.gate.seeAll")}
                      </p>
                      <p className="text-mist/70 text-sm leading-relaxed text-pretty">
                        {t("scanner.gate.seeAllBody")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGateOpen(true);
                      }}
                      data-testid="scan-gate-cta"
                      className={brandButtonClass({
                        className: "w-full sm:w-fit",
                      })}
                    >
                      {t("scanner.gate.seeAllYes")}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SectionShell>

      <GateModal
        open={gateOpen}
        onClose={() => {
          setGateOpen(false);
        }}
        onSubmit={handleLead}
        busy={gateBusy}
        {...(gateError === undefined ? {} : { error: gateError })}
      />

      {/*
        The one object on the page, and only once the report is unlocked. While
        the gate is up the "see the full report" prompt is the single call to
        act; a second bordered card asking for contact underneath a blurred
        report would compete with it and read as two asks stacked. It returns
        the moment the report is open, which is when this invitation is earned.
        It is bordered precisely because nothing else is, so the single surface
        that asks for a decision is the single thing that reads as a surface.
      */}
      {unlocked && (
        <SectionShell
          data-testid="scan-cta"
          className="bg-transparent"
          innerClassName="pb-16 lg:pb-24"
        >
          <div className="glass flex flex-col gap-6 rounded-3xl p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-11">
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
      )}
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
