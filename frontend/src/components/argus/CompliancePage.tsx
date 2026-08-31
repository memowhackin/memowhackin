import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import {
  type ControlChip,
  ControlGrid,
  ControlList,
  FindingsRows,
  PortalPanel,
  SampleNote,
} from "@/components/argus/PortalUI";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * ISO 27001 mapping.
 *
 * The other three pages are built on a table, two clocks and a conversation.
 * This one is built on the auditor's own object: a numbered list of controls,
 * shown as a coverage map. Most of that map is dim, which is the honest picture
 * and the thing the page ends on.
 *
 * The middle of the page is the mechanic rather than a feature list: one
 * finding on the left, the controls it speaks to on the right, so the reader
 * can see a technical result turn into audit language.
 */

const PATH = "/argus/compliance";
const KEY = "argusPages.compliance";

/*
 * Real Annex A identifiers, in order, with the technological controls a testing
 * programme can actually produce evidence for lit and the rest left dim. The
 * numbers are real because a compliance officer reads them and a made-up
 * control would be spotted on sight.
 */
const CONTROLS: readonly ControlChip[] = [
  { id: "A.5.7", state: "partial" },
  { id: "A.5.14", state: "none" },
  { id: "A.5.15", state: "partial" },
  { id: "A.5.23", state: "evidence" },
  { id: "A.5.30", state: "none" },
  { id: "A.6.3", state: "none" },
  { id: "A.6.8", state: "partial" },
  { id: "A.7.1", state: "none" },
  { id: "A.7.4", state: "none" },
  { id: "A.8.1", state: "none" },
  { id: "A.8.2", state: "evidence" },
  { id: "A.8.3", state: "evidence" },
  { id: "A.8.5", state: "evidence" },
  { id: "A.8.7", state: "none" },
  { id: "A.8.8", state: "evidence" },
  { id: "A.8.9", state: "evidence" },
  { id: "A.8.12", state: "evidence" },
  { id: "A.8.16", state: "partial" },
  { id: "A.8.20", state: "evidence" },
  { id: "A.8.21", state: "evidence" },
  { id: "A.8.23", state: "none" },
  { id: "A.8.24", state: "evidence" },
  { id: "A.8.25", state: "partial" },
  { id: "A.8.26", state: "evidence" },
  { id: "A.8.28", state: "partial" },
  { id: "A.8.29", state: "evidence" },
  { id: "A.8.31", state: "none" },
  { id: "A.8.32", state: "partial" },
];

function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );
  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

export function CompliancePage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/insights",
    "/argus/continuous-scanning",
    "/argus/integrations",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: gridRef, className: gridReveal } = useReveal<HTMLDivElement>({
    delay: 140,
  });
  const { ref: mapRef, className: mapReveal } = useReveal<HTMLDivElement>();

  useSeo({
    title: t("pages.argusCompliance.title"),
    description: t("pages.argusCompliance.description"),
    path: PATH,
    service: {
      name: t("pages.argusCompliance.heading"),
      serviceType: "ISO 27001 control evidence",
      areaServed: SERVICE_AREA_SERVED,
    },
  });

  const legend = ["evidence", "partial", "none"] as const;
  const asks = ["how", "when", "fixed", "scope"];

  return (
    <div data-testid="argus-compliance" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(50% 100% at 65% 0%, rgba(96,70,202,0.18) 0%, transparent 72%)",
        }}
      />

      {/*
        Copy on the left, and the coverage map as a wide band under it rather
        than a panel beside it. It is a long numbered list, so it wants width,
        and no other page here opens on a shape like it.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-compliance-hero"
        innerClassName="flex flex-col gap-12 pt-12 pb-14 lg:gap-16 lg:pt-20 lg:pb-20"
      >
        <div
          ref={heroRef}
          className={clsx("flex max-w-3xl flex-col gap-6", heroReveal)}
        >
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${KEY}.hero.heading`)}
          </h1>

          <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
            {t(`${KEY}.hero.lede`)}
          </p>

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
              data-testid="argus-compliance-contact"
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`${KEY}.hero.secondary`)}
            </Link>
          </div>
        </div>

        <div ref={gridRef} className={clsx("flex flex-col gap-5", gridReveal)}>
          <PortalPanel label={t(`${KEY}.ui.gridLabel`)}>
            <div className="p-4 sm:p-5">
              <ControlGrid controls={CONTROLS} />
            </div>
          </PortalPanel>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legend.map((state) => (
              <span key={state} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={clsx(
                    "size-2.5 rounded-xs border",
                    state === "evidence" && "border-lavender/50 bg-lavender/40",
                    state === "partial" && "border-indigo/60 bg-indigo/40",
                    state === "none" && "border-indigo-deep/70 bg-ink",
                  )}
                />
                <span className="text-mist/50 text-xs">
                  {t(`${KEY}.ui.legend.${state}`)}
                </span>
              </span>
            ))}
          </div>

          <SampleNote />
        </div>
      </SectionShell>

      {/*
        The mechanic, shown rather than described: a finding on one side, the
        controls it answers on the other.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-compliance-mapping"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.mapping.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
            {t(`${KEY}.mapping.body`)}
          </p>
        </div>

        <div
          ref={mapRef}
          className={clsx(
            "grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10",
            mapReveal,
          )}
        >
          <PortalPanel label={t(`${KEY}.ui.findingLabel`)}>
            <FindingsRows
              rows={[
                {
                  severity: "high",
                  name: t(`${KEY}.ui.finding.name`),
                  meta: t(`${KEY}.ui.finding.meta`),
                },
              ]}
            />
            <p className="text-mist/60 border-indigo-deep/60 border-t px-4 py-3.5 text-sm leading-relaxed text-pretty">
              {t(`${KEY}.ui.finding.detail`)}
            </p>
          </PortalPanel>

          <PortalPanel label={t(`${KEY}.ui.controlsLabel`)}>
            <ControlList
              rows={(["a88", "a89", "a824"] as const).map((row) => ({
                id: t(`${KEY}.ui.controls.${row}.id`),
                title: t(`${KEY}.ui.controls.${row}.title`),
                evidence: t(`${KEY}.ui.controls.${row}.evidence`),
              }))}
            />
          </PortalPanel>
        </div>
      </SectionShell>

      {/* What the auditor asks, and what you hand over. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-compliance-asks"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.asks.title`)}
        </h2>

        <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-10 sm:grid-cols-2">
          {asks.map((ask) => (
            <li
              key={ask}
              data-testid={`argus-ask-${ask}`}
              className="flex flex-col gap-3"
            >
              <p className="font-display text-mist border-lavender/40 border-l-2 pl-4 text-lg leading-snug font-normal text-pretty">
                {t(`${KEY}.asks.items.${ask}.q`)}
              </p>
              <p className="text-mist/70 pl-4 text-base leading-relaxed text-pretty">
                {t(`${KEY}.asks.items.${ask}.a`)}
              </p>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/*
        The limits. On a compliance page this is worth more than another claim,
        and it is the sentence the dim half of the map above was already making.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-compliance-limits"
        innerClassName="flex flex-col gap-4 pb-16 lg:pb-24"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.limits.title`)}
        </h2>
        <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          {t(`${KEY}.limits.body`)}
        </p>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-compliance-related"
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("argusPages.labels.related")}
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
