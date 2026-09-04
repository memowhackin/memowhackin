import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ServiceFaq } from "@/components/services/ServiceFaq";
import { AgenticPentesting } from "@/components/argus/AgenticPentesting";
import { ArgusHero } from "@/components/argus/ArgusHero";
import { FeatureRow, FeatureRows } from "@/components/argus/FeatureRow";
import { LightBand } from "@/components/argus/LightBand";
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

const PATH = "/argus/continuous-compliance";
const KEY = "argusPages.compliance";

const FAQ_ENTRIES = ["certify", "standards", "auditor"] as const;

const HERO_POINTS = ["mapped", "dated", "export"] as const;

/** Which of the two columns in the light band a line belongs to. */
const DOES = ["evidence", "trail", "gaps"] as const;
const DOES_NOT = ["certify", "scope", "policy"] as const;

/** What the mapping is, and what it is not. Stated as two lists, not a footnote. */
function ScopeOfTheMapping() {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={clsx("flex flex-col gap-10", className)}>
      <div className="flex max-w-2xl flex-col gap-4">
        <h2 className="font-display text-service text-ink-deep font-normal text-balance">
          {t(`${KEY}.scope.title`)}
        </h2>
        <p className="text-ink-deep/70 text-base leading-relaxed text-pretty sm:text-lg">
          {t(`${KEY}.scope.p1`)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
        <div className="border-ink-deep/10 flex flex-col gap-5 rounded-2xl border bg-white/70 p-6 lg:p-8">
          <h3 className="font-display text-ink-deep text-xl font-normal">
            {t(`${KEY}.scope.does.title`)}
          </h3>
          <ul className="flex flex-col gap-3.5">
            {DOES.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check
                  aria-hidden="true"
                  className="text-success mt-0.5 size-5 shrink-0"
                />
                <span className="text-ink-deep/75 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.scope.does.items.${item}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/*
          The second column is the honest one, and it is given exactly the same
          weight as the first: a compliance page that buries its limits is the
          page most likely to be quoted back at us.
        */}
        <div className="border-ink-deep/10 flex flex-col gap-5 rounded-2xl border bg-white/70 p-6 lg:p-8">
          <h3 className="font-display text-ink-deep text-xl font-normal">
            {t(`${KEY}.scope.doesNot.title`)}
          </h3>
          <ul className="flex flex-col gap-3.5">
            {DOES_NOT.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Minus
                  aria-hidden="true"
                  className="text-ink-deep/35 mt-0.5 size-5 shrink-0"
                />
                <span className="text-ink-deep/75 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.scope.doesNot.items.${item}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

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
        // A 1.68 ratio: the widest export of the four, so it takes the wider
        // column to land at the same visual weight as the others.
        wideImage
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

      <LightBand data-testid="argus-compliance-scope">
        <ScopeOfTheMapping />
      </LightBand>

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
