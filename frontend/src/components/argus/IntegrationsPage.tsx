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
  RoutingRules,
  SampleNote,
  TerminalBlock,
  TicketCard,
} from "@/components/argus/PortalUI";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/*
 * Integrations.
 *
 * The last of the six, and the only one where the product is shown outside its
 * own interface. The other five draw the portal; this page draws everywhere the
 * portal is not, because that is the argument: a finding is worth nothing in a
 * tab nobody has open.
 *
 * The middle section is one finding rendered three ways, each in the idiom of
 * the place it lands. Three panels that look alike would have missed the point
 * entirely, so a log line looks like a log line and a ticket looks like a
 * ticket.
 */

const PATH = "/argus/integrations";
const KEY = "argusPages.integrations";

function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );
  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

/** The finding as a line in a log, which is all a SIEM ever shows. */
function LogLines() {
  const { t } = useTranslation();

  return (
    <div
      aria-hidden="true"
      className="border-indigo-deep bg-ink-deep flex flex-col gap-2 overflow-x-auto rounded-xl border p-4 font-mono text-[0.7rem] leading-relaxed"
    >
      {(["before", "finding", "after"] as const).map((line) => (
        <span
          key={line}
          className={clsx(
            "whitespace-nowrap",
            line === "finding" ? "text-lavender" : "text-mist/30",
          )}
        >
          {t(`${KEY}.ui.log.${line}`)}
        </span>
      ))}
    </div>
  );
}

export function IntegrationsPage() {
  const { t } = useTranslation();
  const related = relatedLeaves([
    "/argus/insights",
    "/argus/compliance",
    "/argus/continuous-scanning",
  ]);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: gateRef, className: gateReveal } = useReveal<HTMLDivElement>({
    delay: 140,
  });
  const { ref: threeRef, className: threeReveal } =
    useReveal<HTMLUListElement>();

  useSeo({
    title: t("pages.argusIntegrations.title"),
    description: t("pages.argusIntegrations.description"),
    path: PATH,
    service: {
      name: t("pages.argusIntegrations.heading"),
      serviceType: "Security finding integrations",
      areaServed: SERVICE_AREA_SERVED,
    },
  });

  const destinations = ["siem", "ticket", "pipeline"] as const;
  const boundary = ["out", "back", "truth"];

  return (
    <div data-testid="argus-integrations" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(50% 100% at 55% 0%, rgba(96,70,202,0.2) 0%, transparent 72%)",
        }}
      />

      {/*
        The hero shows a build gate, which is the least portal-like thing in the
        product and therefore exactly the right opening for this page.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-integrations-hero"
        innerClassName="grid grid-cols-[minmax(0,1fr)] items-center gap-12 pt-12 pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:pt-20 lg:pb-20"
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
              data-testid="argus-integrations-contact"
              className={brandButtonClass({
                variant: "ghost",
                className: "text-nowrap",
              })}
            >
              {t(`${KEY}.hero.secondary`)}
            </Link>
          </div>
        </div>

        <div ref={gateRef} className={clsx("flex flex-col gap-4", gateReveal)}>
          <TerminalBlock
            command={t(`${KEY}.ui.gate.command`)}
            lines={[
              { text: t(`${KEY}.ui.gate.scanning`), tone: "muted" },
              { text: t(`${KEY}.ui.gate.open`), tone: "warn" },
              { text: t(`${KEY}.ui.gate.blocked`), tone: "fail" },
              { text: t(`${KEY}.ui.gate.hint`), tone: "muted" },
            ]}
          />

          <SampleNote />
        </div>
      </SectionShell>

      {/*
        One finding, three idioms. The panels deliberately do not match each
        other: a log line, a ticket and a check are not the same object drawn
        three times, they are the same finding speaking three languages.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-integrations-destinations"
        innerClassName="flex flex-col gap-10 py-14 lg:py-20"
      >
        <div className="flex max-w-2xl flex-col gap-4">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.destinations.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
            {t(`${KEY}.destinations.body`)}
          </p>
        </div>

        <ul
          ref={threeRef}
          className={clsx(
            "grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-3",
            threeReveal,
          )}
        >
          {destinations.map((destination) => (
            <li
              key={destination}
              data-testid={`argus-destination-${destination}`}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-mist text-lg font-normal">
                  {t(`${KEY}.destinations.items.${destination}.title`)}
                </span>
                <span className="text-mist/70 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.destinations.items.${destination}.body`)}
                </span>
              </div>

              {destination === "siem" && <LogLines />}

              {destination === "ticket" && (
                <TicketCard
                  id={t(`${KEY}.ui.ticket.id`)}
                  title={t(`${KEY}.ui.ticket.title`)}
                  labels={[
                    t(`${KEY}.ui.ticket.labels.severity`),
                    t(`${KEY}.ui.ticket.labels.source`),
                    t(`${KEY}.ui.ticket.labels.asset`),
                  ]}
                  footer={t(`${KEY}.ui.ticket.footer`)}
                />
              )}

              {destination === "pipeline" && (
                <TerminalBlock
                  command={t(`${KEY}.ui.check.command`)}
                  lines={[
                    { text: t(`${KEY}.ui.check.pass`), tone: "ok" },
                    { text: t(`${KEY}.ui.check.note`), tone: "muted" },
                  ]}
                />
              )}
            </li>
          ))}
        </ul>
      </SectionShell>

      {/* Who decides what leaves, written as rules rather than as promises. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-integrations-routing"
        innerClassName="grid grid-cols-[minmax(0,1fr)] items-start gap-10 py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16 lg:py-20"
      >
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${KEY}.routing.title`)}
          </h2>
          <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
            {t(`${KEY}.routing.body`)}
          </p>
        </div>

        <PortalPanel label={t(`${KEY}.ui.rulesLabel`)}>
          <RoutingRules
            rules={(["critical", "high", "checkout", "reopened"] as const).map(
              (rule) => ({
                match: t(`${KEY}.ui.rules.${rule}.match`),
                destination: t(`${KEY}.ui.rules.${rule}.destination`),
              }),
            )}
          />
        </PortalPanel>
      </SectionShell>

      {/* The boundary. Three short statements, no picture. */}
      <SectionShell
        className="bg-transparent"
        data-testid="argus-integrations-boundary"
        innerClassName="flex flex-col gap-10 pb-16 lg:pb-24"
      >
        <h2 className="font-display text-mist max-w-3xl text-2xl font-normal text-balance sm:text-3xl">
          {t(`${KEY}.boundary.title`)}
        </h2>

        <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 sm:grid-cols-3">
          {boundary.map((item) => (
            <li
              key={item}
              data-testid={`argus-boundary-${item}`}
              className="border-indigo-deep/60 flex flex-col gap-2 border-t pt-5"
            >
              <span className="font-display text-mist text-lg font-normal">
                {t(`${KEY}.boundary.items.${item}.title`)}
              </span>
              <span className="text-mist/70 text-base leading-relaxed text-pretty">
                {t(`${KEY}.boundary.items.${item}.body`)}
              </span>
            </li>
          ))}
        </ul>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="argus-integrations-related"
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
