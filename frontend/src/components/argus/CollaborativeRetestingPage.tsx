import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, RotateCcw } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { AgenticPentesting } from "@/components/argus/AgenticPentesting";
import { ArgusHero, type SkeletonNav } from "@/components/argus/ArgusHero";
import { FeatureRow, FeatureRows } from "@/components/argus/FeatureRow";
import { useSeo } from "@/localization/useSeo";
import { SERVICE_AREA_SERVED } from "@/config/services";

/*
 * Collaborative retesting.
 *
 * The page follows one finding from "we shipped a fix" to a recorded verdict.
 * It opens on the queue those requests are made from, explains the agentic
 * engine behind it, and walks the workflow on the home page's service rows.
 */

/**
 * The captured sidebar, with every nav item masked except Findings, so the
 * hero shows the one screen this page is about. Percentages of the export, so
 * they hold at any rendered width; see `SkeletonNav`.
 */
const SKELETON_NAV: SkeletonNav = {
  sidebar: 14.8,
  rows: [
    { top: 22.5, height: 1.5 },
    { top: 31.5, height: 1.7 },
    { top: 36.3, height: 1.3 },
    { top: 40.6, height: 1.5 },
    { top: 49.8, height: 1.7 },
    { top: 54.4, height: 1.4 },
    { top: 63.7, height: 1.8 },
  ],
};

const PATH = "/argus/collaborative-retesting";
const KEY = "argusPages.retest";

const FAQ_ENTRIES = ["who", "fail", "cost"] as const;

/** The two things the hero screenshot is showing, named over it. */
const HERO_WIDGETS = [
  {
    key: "request",
    icon: RotateCcw,
    tone: "border-indigo/25 bg-indigo/10 text-indigo",
    // Clear of the logo, the project card and the readable Findings row.
    at: "top-[31%] -left-8",
  },
  {
    key: "verdict",
    icon: Check,
    tone: "border-success/40 bg-success/10 text-success",
    at: "-bottom-6 left-12",
  },
] as const;

export function CollaborativeRetestingPage() {
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
      name: t("pages.argusRetest.heading"),
      serviceType: "Remediation verification",
      areaServed: SERVICE_AREA_SERVED,
    }),
    [t],
  );

  useSeo({
    title: t("pages.argusRetest.title"),
    description: t("pages.argusRetest.description"),
    path: PATH,
    service: serviceSchema,
    faq,
  });

  return (
    <div data-testid="argus-retest" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.2) 0%, transparent 68%)",
        }}
      />

      <ArgusHero
        base={KEY}
        image={{
          src: "/assets/dashboard-argus-6.png",
          width: 1438,
          height: 906,
        }}
        widgets={HERO_WIDGETS}
        skeletonNav={SKELETON_NAV}
        data-testid="argus-retest-hero"
      />

      <AgenticPentesting data-testid="argus-retest-agentic" />

      {/* The workflow, on the home page's service rows. */}
      <FeatureRows data-testid="argus-retest-rows">
        <FeatureRow
          data-testid="argus-retest-request"
          title={t(`${KEY}.request.title`)}
          body={t(`${KEY}.request.p1`)}
          framed
          visual={
            <img
              src="/assets/dashboard-argus-10.png"
              alt={t(`${KEY}.shots.request`)}
              width={675}
              height={454}
              loading="lazy"
              className="block h-auto w-full"
            />
          }
        />

        <FeatureRow
          data-testid="argus-retest-thread"
          imageFirst
          title={t(`${KEY}.thread.title`)}
          body={t(`${KEY}.thread.p1`)}
          framed
          visual={
            <img
              src="/assets/dashboard-argus-11.png"
              alt={t(`${KEY}.shots.thread`)}
              width={893}
              height={641}
              loading="lazy"
              className="block h-auto w-full"
            />
          }
        />
      </FeatureRows>

      <SectionShell
        className="bg-transparent"
        data-testid="argus-retest-faq"
        innerClassName="py-14 lg:py-20"
      >
        <ServiceFaq base={`${KEY}.faq`} entries={FAQ_ENTRIES} />
      </SectionShell>

      <ClosingCta />
    </div>
  );
}
