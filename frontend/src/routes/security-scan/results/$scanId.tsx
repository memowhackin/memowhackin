import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import { ScanProgress } from "@/components/scanner/ScanProgress";
import { WebsiteReport } from "@/components/scanner/WebsiteReport";
import { useSeo } from "@/localization/useSeo";
import {
  ScannerError,
  isTerminal,
  readScan,
  type ScanState,
} from "@/config/scanner";

export const Route = createFileRoute("/security-scan/results/$scanId")({
  component: ScanResultsPage,
});

/*
 * A website scan, live and then finished.
 *
 * The id is in the path, which is safe because it is an opaque random uuid
 * that reveals nothing about the subject — the domain itself is never in a
 * URL, a response body or this page's markup. The result is `noindex` so a
 * shared link cannot become a search result, and the API sends `no-store` so
 * it cannot be cached by anything between here and the server.
 *
 * Polling rather than a socket: a scan takes seconds, the payload is small,
 * and one endpoint that also works after a refresh is worth more here than
 * shaving a round trip. Backing off as it goes keeps a stalled scan from
 * hammering the API for as long as the tab is open.
 */
const FIRST_DELAY = 1200;
const MAX_DELAY = 6000;

function ScanResultsPage() {
  const { scanId } = Route.useParams();
  const { t } = useTranslation();

  const [scan, setScan] = useState<ScanState | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useSeo({
    title: t("pages.securityScanResult.title"),
    description: t("pages.securityScanResult.description"),
    path: `/security-scan/results/${scanId}`,
    // A private result must never be indexed, and the server sends the same
    // instruction as a header for the crawlers that never run this code.
    noindex: true,
  });

  useEffect(() => {
    let active = true;
    let delay = FIRST_DELAY;

    async function tick() {
      try {
        const next = await readScan(scanId);
        if (!active) return;

        setScan(next);
        setError(undefined);

        if (isTerminal(next.status)) return;

        delay = Math.min(delay * 1.4, MAX_DELAY);
        timer.current = setTimeout(() => void tick(), delay);
      } catch (cause: unknown) {
        if (!active) return;

        if (cause instanceof ScannerError) {
          if (cause.code === "expired") {
            setError(t("scanner.errors.expired"));
            return;
          }
          if (cause.code === "not_found") {
            setError(t("scanner.errors.not_found"));
            return;
          }
          /*
           * A network blip is recoverable and must not end the scan: the run
           * continues on the server whether or not this tab can reach it, so
           * the poll keeps trying rather than showing a dead end.
           */
          setError(t("scanner.errors.network_retrying"));
          delay = Math.min(delay * 1.6, MAX_DELAY);
          timer.current = setTimeout(() => void tick(), delay);
          return;
        }
        setError(t("scanner.errors.network"));
      }
    }

    void tick();

    return () => {
      active = false;
      if (timer.current !== undefined) clearTimeout(timer.current);
    };
  }, [scanId, t]);

  const status = scan?.status;
  const failed =
    status === "failed" || status === "rate_limited" || status === "expired";

  return (
    <div data-testid="scan-results" className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.2) 0%, transparent 68%)",
        }}
      />

      <SectionShell
        className="bg-transparent"
        data-testid="scan-results-header"
        innerClassName="flex flex-col gap-6 pt-12 pb-10 sm:pt-16 lg:pt-20"
      >
        <Link
          to="/security-scan"
          data-testid="scan-results-back"
          className="text-lavender hover:text-lavender-soft inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("scanner.report.back")}
        </Link>

        {/*
          No eyebrow and no page title here. The verdict below is the
          headline, and an "Exposure assessment / Your website scan" pair
          stacked directly above "Issues worth acting on" was the same
          sentence said three times.
        */}
      </SectionShell>

      {error !== undefined && (
        <SectionShell
          className="bg-transparent"
          data-testid="scan-results-error"
          innerClassName="pb-12"
        >
          <p
            role="alert"
            className="border-ember/40 bg-ember/10 text-ember rounded-lg border px-4 py-3 text-sm leading-relaxed"
          >
            {error}
          </p>
        </SectionShell>
      )}

      {scan === undefined && error === undefined && (
        <SectionShell
          className="bg-transparent"
          data-testid="scan-results-loading"
          innerClassName="pb-16"
        >
          <p className="text-mist/60 text-base">
            {t("scanner.progress.queued")}
          </p>
        </SectionShell>
      )}

      {scan !== undefined && !isTerminal(scan.status) && (
        <SectionShell
          className="bg-transparent"
          data-testid="scan-results-progress"
          innerClassName="pb-16 lg:pb-24"
        >
          <ScanProgress />
        </SectionShell>
      )}

      {scan !== undefined && failed && (
        <SectionShell
          className="bg-transparent"
          data-testid="scan-failed"
          innerClassName="pb-16 lg:pb-24"
        >
          <div className="border-indigo-deep bg-ink-deep rounded-2xl border p-6 sm:p-8">
            <h2 className="font-display text-mist text-xl font-normal sm:text-2xl">
              {t(`scanner.failure.${scan.status}.title`)}
            </h2>
            {/*
              The distinction the brief asks for, and it matters: this says the
              scan could not finish. It does not say nothing was found, because
              we do not know that.
            */}
            <p className="text-mist/75 mt-3 max-w-prose text-base leading-relaxed text-pretty">
              {scan.failureCode === null
                ? t(`scanner.failure.${scan.status}.body`)
                : t(`scanner.failureCodes.${scan.failureCode}`, {
                    defaultValue: t(`scanner.failure.${scan.status}.body`),
                  })}
            </p>
            <Link
              to="/security-scan"
              className="text-lavender hover:text-lavender-soft mt-5 inline-flex items-center gap-2 text-base font-medium transition-colors"
            >
              {t("scanner.report.tryAgain")}
            </Link>
          </div>
        </SectionShell>
      )}

      {scan?.status === "complete" && <WebsiteReport scan={scan} />}
    </div>
  );
}
