import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BadgeCheck, CalendarCheck } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { AgenticPentesting } from "@/components/argus/AgenticPentesting";
import { ArgusHero, type SkeletonNav } from "@/components/argus/ArgusHero";
import { FeatureRow, FeatureRows } from "@/components/argus/FeatureRow";
import { useSeo } from "@/localization/useSeo";
import { SERVICE_AREA_SERVED } from "@/config/services";

/*
 * Continuous compliance.
 *
 * The page argues one thing: the evidence an ISO 27001 audit asks for about
 * technical controls is a by-product of testing you are already doing, so it
 * should be collected as the testing happens rather than assembled from old
 * reports the week before the audit.
 *
 * It is careful about what it claims. Mapping a finding to a control is
 * traceability, not certification, and the light band says so in its own
 * section rather than hiding it in a footnote — a compliance page that
 * overstates is the one page here that could actually cost a customer
 * something.
 */

/**
 * The captured sidebar, with every nav item masked except Compliance, so the
 * hero shows the one screen this page is about. Percentages of the export, so
 * they hold at any rendered width; see `SkeletonNav`.
 */
const SKELETON_NAV: SkeletonNav = {
  sidebar: 14.9,
  rows: [
    { top: 23.8, height: 1.6 },
    { top: 28.6, height: 1.6 },
    { top: 33.3, height: 1.8 },
    { top: 38.4, height: 1.4 },
    { top: 52.6, height: 1.8 },
    { top: 57.5, height: 1.5 },
    { top: 67.3, height: 1.9 },
  ],
};

const PATH = "/argus/continuous-compliance";
const KEY = "argusPages.compliance";

const FAQ_ENTRIES = ["certify", "standards", "auditor"] as const;

/** The two things the compliance capture is showing, named over it. */
const HERO_WIDGETS = [
  {
    key: "mapped",
    icon: BadgeCheck,
    tone: "border-indigo/30 bg-indigo/10 text-indigo",
    // Above the readable Compliance row, below the project card.
    at: "top-[17%] -left-8",
  },
  {
    key: "evidence",
    icon: CalendarCheck,
    tone: "border-success/40 bg-success/10 text-success",
    at: "bottom-[6%] left-12",
  },
] as const;

const HERO_POINTS = ["mapped", "dated", "export"] as const;

export function ContinuousCompliancePage() {
  const { t } = useTranslation();

  const faq = useMemo(
    () =>
      FAQ_ENTRIES.map((entry) => ({
        question: t(`${KEY}.faq.items.${entry}.q`),
        answer: t(`${KEY}.faq.items.${entry}.a`),
      })),
    [t],
  );
  const serviceSchema = useMemo(
    () => ({
      name: t("pages.argusCompliance.heading"),
      serviceType: "Security compliance evidence",
      areaServed: SERVICE_AREA_SERVED,
    }),
    [t],
  );

  useSeo({
    title: t("pages.argusCompliance.title"),
    description: t("pages.argusCompliance.description"),
    path: PATH,
    service: serviceSchema,
    faq,
  });

  return (
    <div data-testid="argus-compliance" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(55% 100% at 50% 0%, rgba(96,70,202,0.22) 0%, transparent 70%)",
        }}
      />

      <ArgusHero
        base={KEY}
        image={{
          src: "/assets/dashboard-argus-8.png",
          width: 1439,
          height: 857,
        }}
        points={HERO_POINTS}
        widgets={HERO_WIDGETS}
        skeletonNav={SKELETON_NAV}
        data-testid="argus-compliance-hero"
      />

      <AgenticPentesting data-testid="argus-compliance-agentic" />

      <FeatureRows data-testid="argus-compliance-rows">
        <FeatureRow
          data-testid="argus-compliance-mapping"
          title={t(`${KEY}.mapping.title`)}
          body={t(`${KEY}.mapping.p1`)}
          framed
          visual={
            <img
              src="/assets/dashboard-argus-9.png"
              alt={t(`${KEY}.shots.controls`)}
              width={1006}
              height={642}
              loading="lazy"
              className="block h-auto w-full"
            />
          }
        />

        <FeatureRow
          data-testid="argus-compliance-coverage"
          imageFirst
          title={t(`${KEY}.coverage.title`)}
          body={t(`${KEY}.coverage.p1`)}
          framed
          visual={
            <img
              src="/assets/dashboard-4.png"
              alt={t(`${KEY}.shots.coverage`)}
              width={871}
              height={765}
              loading="lazy"
              className="block h-auto w-full"
            />
          }
        />
      </FeatureRows>

      <SectionShell
        className="bg-transparent"
        data-testid="argus-compliance-faq"
        innerClassName="py-14 lg:py-20"
      >
        <ServiceFaq base={`${KEY}.faq`} entries={FAQ_ENTRIES} />
      </SectionShell>

      <ClosingCta />
    </div>
  );
}
