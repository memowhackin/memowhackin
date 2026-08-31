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
  PortalPanel,
  RequestPair,
  SampleNote,
  StateTrail,
} from "@/components/argus/PortalUI";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * The retest module.
 *
 * Four pages precede this one and none of them is built on proof: scanning is a
 * table, insights two clocks, chat a conversation, compliance a control map.
 * This page is built on the same request run twice, because that is the only
 * thing that settles whether a fix worked, and it is an image nobody can argue
 * with.
 *
 * The history panel in the hero and the request pair below it are the two
 * halves of one claim: the trail says a person changed the state, the responses
 * say why they were allowed to.
 */

const PATH = "/argus/retesting";
const KEY = "argusPages.retesting";

/** The finding's history, in the order it happened. */
const TRAIL = [
  { key: "published", state: true },
  { key: "deployed" },
  { key: "requested", state: true },
  { key: "attacked" },
  { key: "closed", state: true, closed: true },
] as const;

function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );
  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

export function RetestPage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/insights",
    "/argus/continuous-scanning",
    "/argus/expert-chat",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: trailRef, className: trailReveal } = useReveal<HTMLDivElement>({
    delay: 140,
  });
  const { ref: proofRef, className: proofReveal } = useReveal<HTMLDivElement>();

  useSeo({
    title: t("pages.argusRetesting.title"),
    description: t("pages.argusRetesting.description"),
    path: PATH,
    service: {
      name: t("pages.argusRetesting.heading"),
      serviceType: "Vulnerability retesting and fix verification",
      areaServed: SERVICE_AREA_SERVED,
    },
  });

  const skipped = ["cost", "moved", "ticket"];
  const does = ["onDemand", "sameSteps", "verdict", "regression"];

  return (
    <div data-testid="argus-retesting" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(48% 100% at 40% 0%, rgba(96,70,202,0.2) 0%, transparent 72%)",
        }}
      />

      {/*
        Copy on the left, the finding's own history on the right. A vertical log
        rather than a wide table, so the opening does not repeat the shape the
        scanning page opens on.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retesting-hero"
        innerClassName="grid grid-cols-[minmax(0,1fr)] items-center gap-12 pt-12 pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16 lg:pt-20 lg:pb-20"
      >
        <div ref={heroRef} className={clsx("flex flex-col gap-6", heroReveal)}>
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${KEY}.hero.heading`)}
          </h1>

          <p className="text-mist/75 max-w-xl text-lg leading-relaxed text-pretty">
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
              data-testid="argus-retesting-contact"
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`${KEY}.hero.secondary`)}
            </Link>
          </div>
        </div>

        <div
          ref={trailRef}
          className={clsx("flex flex-col gap-4", trailReveal)}
        >
          <PortalPanel label={t(`${KEY}.ui.trailLabel`)}>
            <StateTrail
              entries={TRAIL.map((entry) => ({
                time: t(`${KEY}.ui.trail.${entry.key}.time`),
                actor: t(`${KEY}.ui.trail.${entry.key}.actor`),
                event: t(`${KEY}.ui.trail.${entry.key}.event`),
                state:
                  "state" in entry
                    ? t(`${KEY}.ui.trail.${entry.key}.state`)
                    : undefined,
                closed: "closed" in entry,
              }))}
            />
          </PortalPanel>

          <SampleNote />
        </div>
      </SectionShell>

      {/*
        The payoff. One request, two answers, and the section says almost
        nothing because the responses say it better.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retesting-proof"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.proof.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
            {t(`${KEY}.proof.body`)}
          </p>
        </div>

        <div ref={proofRef} className={clsx("w-full", proofReveal)}>
          <RequestPair
            request={t(`${KEY}.ui.request`)}
            before={{
              label: t(`${KEY}.ui.before.label`),
              response: t(`${KEY}.ui.before.response`),
            }}
            after={{
              label: t(`${KEY}.ui.after.label`),
              response: t(`${KEY}.ui.after.response`),
            }}
          />
        </div>
      </SectionShell>

      {/* Why the step gets dropped everywhere else. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retesting-skipped"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.skipped.title`)}
        </h2>

        <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 sm:grid-cols-3">
          {skipped.map((reason) => (
            <li
              key={reason}
              data-testid={`argus-skipped-${reason}`}
              className="border-ember/50 flex flex-col gap-2 border-l-2 pl-5"
            >
              <span className="text-mist font-medium">
                {t(`${KEY}.skipped.items.${reason}.title`)}
              </span>
              <span className="text-mist/70 text-base leading-relaxed text-pretty">
                {t(`${KEY}.skipped.items.${reason}.body`)}
              </span>
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* What the module actually is. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-retesting-does"
        innerClassName="flex flex-col gap-10 pb-16 lg:pb-24"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.does.title`)}
        </h2>

        <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 sm:grid-cols-2">
          {does.map((item) => (
            <li
              key={item}
              data-testid={`argus-does-${item}`}
              className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-5"
            >
              <span className="font-display text-mist text-lg font-normal text-balance">
                {t(`${KEY}.does.items.${item}.title`)}
              </span>
              <span className="text-mist/70 max-w-prose text-base leading-relaxed text-pretty">
                {t(`${KEY}.does.items.${item}.body`)}
              </span>
            </li>
          ))}
        </ul>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-retesting-related"
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
