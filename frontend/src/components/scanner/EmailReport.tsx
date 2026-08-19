import { Suspense, lazy, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { SectionShell } from "@/components/common/SectionShell";
import { useMediaQuery } from "@/components/common/useMediaQuery";
import { buildGraph } from "@/components/scanner/graphModel";
import type { RiskBand, ScanState } from "@/config/scanner";

/*
 * The private personal report, shown only after a mailed link is redeemed.
 *
 * The graph is code-split: it is the heaviest thing on the page and nobody
 * sees it until they have opened a report, so it must not sit in the bundle
 * every visitor downloads.
 *
 * Below the `lg` breakpoint the graph is not rendered at all. A dense node
 * diagram on a phone is a worse way to read this than a list — panning a graph
 * with a thumb to find a label is not an accessible alternative, it is a
 * puzzle — so small screens get the same information as records, in order,
 * with the same provenance and the same recommended actions. Neither view is
 * a degraded version of the other.
 */

const ExposureGraph = lazy(async () => {
  const module = await import("@/components/scanner/ExposureGraph");
  return { default: module.ExposureGraph };
});

function BandHeader({ band, count }: { band: RiskBand; count: number }) {
  const { t } = useTranslation();

  return (
    <div className="border-indigo-deep bg-ink-deep rounded-2xl border p-6 sm:p-8">
      <p className="eyebrow text-lavender">{t("scanner.report.bandLabel")}</p>
      <h2 className="font-display text-mist mt-3 text-2xl font-normal text-balance sm:text-3xl">
        {t(`scanner.emailBands.${band}.title`)}
      </h2>
      <p className="text-mist/75 mt-3 max-w-prose text-base leading-relaxed text-pretty">
        {t(`scanner.emailBands.${band}.body`, { count })}
      </p>
    </div>
  );
}

export function EmailReport({ scan }: { scan: ScanState }) {
  const { t } = useTranslation();
  const result = scan.emailResult;
  // The graph only earns its space where there is space; see the note above.
  const wideEnough = useMediaQuery("(min-width: 1024px)");

  const graph = useMemo(() => {
    if (result === undefined) return undefined;
    return buildGraph(result.records, {
      subject: t("scanner.graph.subject"),
      password: t("scanner.graph.passwordIndicator"),
      phone: (suffix: string) => t("scanner.graph.phoneIndicator", { suffix }),
      network: (country: string) =>
        t("scanner.graph.networkIndicator", { country }),
      stealer: t("scanner.graph.stealerAction"),
      action: t("scanner.graph.passwordAction"),
      dataType: (type: string) =>
        t(`scanner.dataTypes.${type}`, { defaultValue: type }),
      relation: {
        appearsIn: t("scanner.graph.relations.appearsIn"),
        exposed: t("scanner.graph.relations.exposed"),
        indicates: t("scanner.graph.relations.indicates"),
        recommends: t("scanner.graph.relations.recommends"),
      },
      provenance: {
        report: t("scanner.graph.provenanceReport"),
        source: (name: string) => t("scanner.graph.provenanceSource", { name }),
      },
      explanation: {
        subject: t("scanner.graph.explain.subject"),
        source: t("scanner.graph.explain.source"),
        stealer: t("scanner.graph.explain.stealer"),
        password: t("scanner.graph.explain.password"),
        phone: t("scanner.graph.explain.phone"),
        network: t("scanner.graph.explain.network"),
        category: t("scanner.graph.explain.category"),
      },
    });
  }, [result, t]);

  if (result === undefined) return null;
  const band = scan.riskBand ?? "low";

  return (
    <>
      <SectionShell
        data-testid="email-report"
        className="bg-transparent"
        innerClassName="flex flex-col gap-8 pb-12 lg:gap-10"
      >
        <BandHeader band={band} count={result.records.length} />

        {result.records.length === 0 ? (
          <div
            data-testid="email-no-exposure"
            className="border-indigo-deep bg-ink-deep rounded-2xl border p-6 sm:p-8"
          >
            <h2 className="font-display text-mist text-xl font-normal sm:text-2xl">
              {t("scanner.report.emailEmptyTitle")}
            </h2>
            <p className="text-mist/75 mt-3 max-w-prose text-base leading-relaxed text-pretty">
              {t("scanner.report.emailEmptyBody")}
            </p>
          </div>
        ) : (
          <>
            <section className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-mist text-xl font-normal sm:text-2xl">
                  {t("scanner.graph.title")}
                </h2>
                <p className="text-mist/65 max-w-2xl text-base leading-relaxed text-pretty">
                  {t("scanner.graph.intro")}
                </p>
              </div>

              {wideEnough && graph !== undefined ? (
                <Suspense
                  fallback={
                    <p className="text-mist/50 text-sm">
                      {t("scanner.graph.loading")}
                    </p>
                  }
                >
                  <ExposureGraph model={graph} />
                </Suspense>
              ) : (
                <ul
                  data-testid="email-record-list"
                  className="flex flex-col gap-4"
                >
                  {result.records.map((record, index) => (
                    <li
                      key={`${record.source}-${String(index)}`}
                      data-testid={`email-record-${String(index)}`}
                      className="border-indigo-deep bg-ink-deep flex flex-col gap-3 rounded-2xl border p-5"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-mist text-base font-normal">
                          {record.source}
                        </h3>
                        {record.occurredAt !== undefined && (
                          <span className="text-mist/50 text-xs tabular-nums">
                            {record.occurredAt}
                          </span>
                        )}
                      </div>

                      <ul className="flex flex-wrap gap-2">
                        {record.dataTypes.map((type) => (
                          <li
                            key={type}
                            className="border-indigo-deep text-mist/70 rounded-md border px-2 py-1 text-xs"
                          >
                            {t(`scanner.dataTypes.${type}`, {
                              defaultValue: type,
                            })}
                          </li>
                        ))}
                      </ul>

                      <dl className="flex flex-col gap-1.5 text-sm">
                        {record.passwordExposed && (
                          <div className="flex gap-2">
                            <dt className="text-mist/50">
                              {t("scanner.graph.kinds.password_indicator")}
                            </dt>
                            <dd className="text-mist/80">
                              {t("scanner.graph.passwordIndicator")}
                            </dd>
                          </div>
                        )}
                        {record.phoneSuffix !== undefined && (
                          <div className="flex gap-2">
                            <dt className="text-mist/50">
                              {t("scanner.graph.kinds.phone_indicator")}
                            </dt>
                            <dd className="text-mist/80">
                              {t("scanner.graph.phoneIndicator", {
                                suffix: record.phoneSuffix,
                              })}
                            </dd>
                          </div>
                        )}
                        {record.countryCode !== undefined && (
                          <div className="flex gap-2">
                            <dt className="text-mist/50">
                              {t("scanner.graph.kinds.network_indicator")}
                            </dt>
                            <dd className="text-mist/80">
                              {t("scanner.graph.networkIndicator", {
                                country: record.countryCode,
                              })}
                            </dd>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <dt className="text-mist/50">
                            {t("scanner.graph.confidence")}
                          </dt>
                          <dd className="text-mist/80">
                            {t(`scanner.confidence.${record.confidence}.label`)}
                          </dd>
                        </div>
                      </dl>

                      {record.stealerLog && (
                        <p className="border-indigo-deep text-mist/80 border-t pt-3 text-sm leading-relaxed text-pretty">
                          {t("scanner.graph.stealerAction")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="border-indigo-deep rounded-2xl border p-6 sm:p-8">
              <h2 className="font-display text-mist text-xl font-normal sm:text-2xl">
                {t("scanner.report.actionsTitle")}
              </h2>
              <ul className="mt-4 flex flex-col gap-3">
                {["passwords", "mfa", "monitor"].map((action) => (
                  <li
                    key={action}
                    className="text-mist/75 border-indigo-deep/60 border-t pt-3 text-sm leading-relaxed text-pretty"
                  >
                    {t(`scanner.actions.${action}`)}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="border-indigo-deep rounded-2xl border p-6 sm:p-8">
          <h2 className="font-display text-mist text-xl font-normal sm:text-2xl">
            {t("scanner.report.limitsTitle")}
          </h2>
          <p className="text-mist/70 mt-3 max-w-prose text-base leading-relaxed text-pretty">
            {t("scanner.limits.known_sources_only")}
          </p>
        </div>
      </SectionShell>

      <SectionShell
        data-testid="email-cta"
        className="bg-transparent"
        innerClassName="pb-16 lg:pb-24"
      >
        <div className="border-indigo-deep bg-ink-deep flex flex-col gap-5 rounded-2xl border p-6 sm:p-8 lg:p-10">
          <h2 className="font-display text-mist max-w-2xl text-xl leading-tight font-normal text-balance sm:text-2xl">
            {t("scanner.cta.email.title")}
          </h2>
          <p className="text-mist/75 max-w-prose text-base leading-relaxed text-pretty">
            {t("scanner.cta.email.body")}
          </p>
          {/*
            Sharing this report with a specialist is an explicit act: the link
            goes to contact and carries nothing. Nothing on this page is sent
            anywhere without the reader deciding to send it.
          */}
          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/contact"
              data-testid="email-cta-review"
              className={brandButtonClass({ className: "justify-center" })}
            >
              {t("scanner.cta.email.primary")}
            </Link>
            <Link
              to="/contact"
              data-testid="email-cta-org"
              className={brandButtonClass({
                variant: "ghost",
                className: "justify-center",
              })}
            >
              {t("scanner.cta.email.secondary")}
            </Link>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
