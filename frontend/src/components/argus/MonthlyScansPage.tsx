import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { Check } from "lucide-react";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import {
  AssetRail,
  AssetRows,
  Callout,
  FindingsRows,
  PortalPanel,
  SampleNote,
  ScanStrip,
} from "@/components/argus/PortalUI";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * Monthly scans.
 *
 * Built as its own page rather than from a shared template. The six ARGUS
 * features are not the same argument with different nouns in it, and the thing
 * that makes a product page work is that its pictures show the feature being
 * described. That only happens if the page and its pictures are composed
 * together, which is what this file is.
 *
 * Every picture here is drawn from `PortalUI`, in the page's own tokens, with
 * sample data marked as sample data. When a real screenshot of the portal
 * exists it should take the place of the composition in the hero.
 */

/** Which state each sample row in the surface-changes panel is in. */
const STATE_BY_ROW = { found: "new", known: "known", gone: "closed" } as const;

const PATH = "/argus/continuous-scanning";
const KEY_ROOT = "argusPages";
const KEY = `${KEY_ROOT}.scanning`;

function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );
  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

/** The queue, as it looks the morning after a pass. */
function QueueComposition() {
  const { t } = useTranslation();

  const rows = ["cookie", "admin", "tls", "bucket"] as const;
  const severities = ["critical", "high", "high", "medium"] as const;

  return (
    <div className="relative">
      <PortalPanel label={t(`${KEY}.ui.queueLabel`)}>
        <div className="flex">
          <AssetRail
            items={["domains", "apis", "hosts", "staging"].map((asset) => ({
              label: t(`${KEY}.ui.assets.${asset}.label`),
              count: t(`${KEY}.ui.assets.${asset}.count`),
            }))}
          />

          <div className="min-w-0 flex-1">
            <FindingsRows
              rows={rows.map((row, index) => ({
                severity: severities[index] ?? "medium",
                name: t(`${KEY}.ui.findings.${row}.name`),
                meta: t(`${KEY}.ui.findings.${row}.meta`),
              }))}
            />
          </div>
        </div>
      </PortalPanel>

      {/*
        The one loud element in the picture, and it carries the argument the
        section makes: everything in that queue was checked by a person.
      */}
      <Callout
        figure={t(`${KEY}.ui.callout.figure`)}
        label={t(`${KEY}.ui.callout.label`)}
        className="-bottom-8 left-0 sm:-left-10"
      />
    </div>
  );
}

/** One feature, with the fragment of interface that shows it. */
function FeatureCell({
  item,
  picture,
}: {
  item: string;
  picture: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLLIElement>();

  return (
    <li
      ref={ref}
      data-testid={`argus-feature-${item}`}
      className={clsx("flex flex-col gap-5", className)}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-mist text-xl font-normal text-balance">
          {t(`${KEY}.features.items.${item}.title`)}
        </h3>
        <p className="text-mist/70 max-w-prose text-base leading-relaxed text-pretty">
          {t(`${KEY}.features.items.${item}.body`)}
        </p>
      </div>

      {picture}
    </li>
  );
}

export function MonthlyScansPage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/insights",
    "/argus/retesting",
    "/services/web-app-pentesting",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: shotRef, className: shotReveal } = useReveal<HTMLDivElement>({
    delay: 120,
  });

  useSeo({
    title: t("pages.argusScanning.title"),
    description: t("pages.argusScanning.description"),
    path: PATH,
    service: {
      name: t("pages.argusScanning.heading"),
      serviceType: "Continuous security scanning",
      areaServed: SERVICE_AREA_SERVED,
    },
  });

  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug"];

  return (
    <div data-testid="argus-scanning" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(55% 100% at 50% 0%, rgba(96,70,202,0.22) 0%, transparent 70%)",
        }}
      />

      {/*
        Copy on the left, the product on the right, running past the edge of
        the column. The picture is doing the same job as the headline, so it
        gets the same weight rather than sitting under the fold as an
        afterthought.
      */}
      <SectionShell
        className="overflow-x-clip bg-transparent"
        data-testid="argus-scanning-hero"
        innerClassName="grid grid-cols-[minmax(0,1fr)] items-center gap-14 pt-10 pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-x-16 lg:pt-16 lg:pb-24"
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-start gap-6", heroReveal)}
        >
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${KEY}.hero.heading`)}
          </h1>

          <p className="text-mist/75 max-w-xl text-lg leading-relaxed text-pretty">
            {t(`${KEY}.hero.lede`)}
          </p>

          <ul className="flex flex-col gap-2.5">
            {["surface", "validated", "ranked", "retest"].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check
                  aria-hidden="true"
                  className="text-lavender mt-1 size-4 shrink-0"
                />
                <span className="text-mist/80 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.hero.points.${point}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-1 flex flex-wrap items-center gap-4">
            <BrandButton
              href={site.bookDemoUrl}
              variant="sweep"
              data-testid="page-book-demo"
              className="text-nowrap"
            >
              {t("nav.bookDemo")}
            </BrandButton>

            <Link
              to="/contact"
              data-testid="argus-scanning-contact"
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`${KEY}.hero.secondary`)}
            </Link>
          </div>

          <p className="text-mist/45 text-sm leading-relaxed text-pretty">
            {t(`${KEY}.hero.footnote`)}
          </p>
        </div>

        <div
          ref={shotRef}
          className={clsx("flex flex-col gap-14 lg:w-[118%]", shotReveal)}
        >
          <QueueComposition />
          <SampleNote className="pl-1" />
        </div>
      </SectionShell>

      {/* What is actually broken, said once and briefly. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-scanning-problem"
        innerClassName="flex flex-col gap-5 py-14 lg:py-20"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.problem.title`)}
        </h2>
        <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          {t(`${KEY}.problem.body`)}
        </p>
      </SectionShell>

      {/* Four features, each with the piece of interface that shows it. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-scanning-features"
        innerClassName="flex flex-col gap-10 pb-14 lg:gap-14 lg:pb-20"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.features.title`)}
        </h2>

        <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-14 lg:grid-cols-2">
          <FeatureCell
            item="discovery"
            picture={
              <PortalPanel label={t(`${KEY}.ui.discoveryLabel`)}>
                <AssetRows
                  rows={(["found", "known", "gone"] as const).map((row) => ({
                    state: STATE_BY_ROW[row],
                    name: t(`${KEY}.ui.discovery.${row}.name`),
                  }))}
                />
              </PortalPanel>
            }
          />

          <FeatureCell
            item="validated"
            picture={
              <PortalPanel label={t(`${KEY}.ui.validationLabel`)}>
                <div className="flex flex-col gap-3 p-4">
                  <p className="text-mist/85 text-sm leading-relaxed">
                    {t(`${KEY}.ui.validation.finding`)}
                  </p>
                  <div className="border-indigo-deep/60 flex items-center gap-2 border-t pt-3">
                    <Check
                      aria-hidden="true"
                      className="text-lavender size-4 shrink-0"
                    />
                    <span className="text-mist/60 text-xs">
                      {t(`${KEY}.ui.validation.by`)}
                    </span>
                  </div>
                </div>
              </PortalPanel>
            }
          />

          <FeatureCell
            item="ranked"
            picture={
              <PortalPanel label={t(`${KEY}.ui.rankLabel`)}>
                <FindingsRows
                  rows={(["critical", "high", "medium"] as const).map(
                    (severity) => ({
                      severity,
                      name: t(`${KEY}.ui.rank.${severity}.name`),
                      meta: t(`${KEY}.ui.rank.${severity}.meta`),
                    }),
                  )}
                />
              </PortalPanel>
            }
          />

          <FeatureCell
            item="record"
            picture={
              <PortalPanel label={t(`${KEY}.ui.historyLabel`)}>
                <div className="p-5">
                  <ScanStrip months={months} covered={6} current={5} />
                </div>
              </PortalPanel>
            }
          />
        </ul>
      </SectionShell>

      {/* How one pass runs. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-scanning-process"
        innerClassName="flex flex-col gap-10 pb-16 lg:pb-24"
      >
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.process.title`)}
          </h2>
          <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
            {t(`${KEY}.process.intro`)}
          </p>
        </div>

        <ol className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {["scope", "discover", "test", "validate", "publish"].map(
            (step, index) => (
              <li
                key={step}
                data-testid={`argus-step-${step}`}
                className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-4"
              >
                <span
                  aria-hidden="true"
                  className="font-display text-lavender/60 text-sm tabular-nums"
                >
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span className="font-display text-mist text-lg font-normal">
                  {t(`${KEY}.process.steps.${step}.title`)}
                </span>
                <span className="text-mist/70 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.process.steps.${step}.body`)}
                </span>
              </li>
            ),
          )}
        </ol>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-scanning-related"
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t(`${KEY_ROOT}.labels.related`)}
          </h2>

          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((leaf, index) => (
              <PageLinkCard key={leaf.key} leaf={leaf} index={index} />
            ))}
          </ul>
        </SectionShell>
      )}

      <ClosingCta />
    </div>
  );
}
