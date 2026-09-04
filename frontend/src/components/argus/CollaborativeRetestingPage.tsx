import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Check, RotateCcw } from "lucide-react";
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
 * Collaborative retesting.
 *
 * The page follows one finding from "we shipped a fix" to a recorded verdict.
 * It opens on the queue those requests are made from, explains the agentic
 * engine behind it, walks the workflow on the home page's service rows, and
 * closes the argument on the two outcomes a retest can record.
 */

const PATH = "/argus/collaborative-retesting";
const KEY = "argusPages.retest";

const FAQ_ENTRIES = ["who", "fail", "cost"] as const;

/** The two things the hero screenshot is showing, named over it. */
const HERO_WIDGETS = [
  {
    key: "request",
    icon: RotateCcw,
    tone: "border-indigo/25 bg-indigo/10 text-indigo",
  },
  {
    key: "verdict",
    icon: Check,
    tone: "border-success/40 bg-success/10 text-success",
  },
] as const;

export function CollaborativeRetestingPage() {
  const { t } = useTranslation();
  const { ref: outcomeRef, className: outcomeReveal } =
    useReveal<HTMLDivElement>();

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

      {/* Resolved versus still reproducible — the page's light passage. */}
      <LightBand data-testid="argus-retest-outcomes">
        <div
          ref={outcomeRef}
          className={clsx("flex flex-col gap-10", outcomeReveal)}
        >
          <div className="flex max-w-2xl flex-col gap-4">
            <h2 className="font-display text-service text-ink-deep font-normal text-balance">
              {t(`${KEY}.outcomes.title`)}
            </h2>
            <p className="text-ink-deep/70 text-base leading-relaxed text-pretty sm:text-lg">
              {t(`${KEY}.outcomes.p1`)}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {(["resolved", "reproducible"] as const).map((outcome) => (
              <div
                key={outcome}
                data-testid={`argus-outcome-${outcome}`}
                className="border-ink-deep/10 flex flex-col gap-3 rounded-2xl border bg-white/60 p-6"
              >
                <span
                  className={clsx(
                    "flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide uppercase",
                    outcome === "resolved"
                      ? "border-success/40 bg-success/10 text-ink-deep"
                      : "border-warning/50 bg-warning/15 text-ink-deep",
                  )}
                >
                  {outcome === "resolved" ? (
                    <Check aria-hidden="true" className="size-3.5" />
                  ) : (
                    <RotateCcw aria-hidden="true" className="size-3.5" />
                  )}
                  {t(`${KEY}.outcomes.${outcome}.title`)}
                </span>
                <p className="text-ink-deep/75 text-base leading-relaxed text-pretty">
                  {t(`${KEY}.outcomes.${outcome}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </LightBand>

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
