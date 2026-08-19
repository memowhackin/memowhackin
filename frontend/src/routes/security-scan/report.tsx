import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import { EmailReport } from "@/components/scanner/EmailReport";
import { useSeo } from "@/localization/useSeo";
import { ScannerError, redeemReport, type ScanState } from "@/config/scanner";

export const Route = createFileRoute("/security-scan/report")({
  component: PrivateReportPage,
});

/*
 * The private personal report, opened from a mailed link.
 *
 * The token arrives in the URL *fragment* — `/security-scan/report#<token>` —
 * which is the only part of a URL a browser never transmits. It is therefore
 * absent from the request line, from access logs, from proxy logs and from the
 * `Referer` header that every subsequent asset request would otherwise carry
 * it in. A query string would have leaked it to all four.
 *
 * It is then removed from the address bar immediately, so the link in browser
 * history is inert. It is single-use server-side regardless, so this is
 * belt-and-braces rather than the control itself.
 */
function PrivateReportPage() {
  const { t } = useTranslation();

  const [scan, setScan] = useState<ScanState | undefined>(undefined);
  const [redeemError, setRedeemError] = useState<string | undefined>(undefined);

  /*
   * The token is read out of the fragment during the first render, so that the
   * "no token" case is an ordinary computed value rather than a setState
   * inside an effect.
   *
   * The read has to stay PURE, and that is not a style preference. React
   * double-invokes lazy initializers in StrictMode precisely to surface impure
   * ones, so clearing the address bar in here — as an earlier version did —
   * meant the second invocation found the hash already gone, returned an empty
   * token, and every report opened as "this link is incomplete". Reading is
   * idempotent; clearing is a side effect and belongs in the effect below.
   */
  const [token] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, ""),
  );

  const [loading, setLoading] = useState(token.length > 0);

  // A missing token is knowable at render time, so it is not state.
  const error =
    token.length === 0 ? t("scanner.errors.missing_token") : redeemError;

  /*
   * The redemption, held as a promise rather than as a "have we started yet"
   * flag.
   *
   * The token is single-use, so it must be spent exactly once however many
   * times this effect runs — and React 19 in StrictMode deliberately runs it
   * setup, cleanup, setup on the same mount. A boolean guard gets the first
   * half of that right and the second half wrong: the second setup skips, the
   * first setup's cleanup has already flipped its own `active` flag, and the
   * result that does arrive is thrown away by a listener nobody is holding.
   * The page then sits on "Opening your report" forever, having already spent
   * the token — the worst of both outcomes.
   *
   * Keeping the promise means the second setup re-attaches to the same
   * in-flight request instead of starting or skipping one.
   */
  const request = useRef<Promise<ScanState> | undefined>(undefined);

  useSeo({
    title: t("pages.securityScanReport.title"),
    description: t("pages.securityScanReport.description"),
    path: "/security-scan/report",
    noindex: true,
  });

  useEffect(() => {
    if (token.length === 0) return;

    if (request.current === undefined) {
      /*
       * Clear the fragment before the request goes out, so a slow network
       * cannot leave a working link sitting in the address bar of an
       * unattended screen, and so the history entry is inert. The token is
       * single-use server-side regardless; this is the belt to that braces.
       */
      window.history.replaceState(null, "", window.location.pathname);
      request.current = redeemReport(token);
    }

    let active = true;
    // Every setState below is inside a promise callback, so none of them runs
    // synchronously during the effect.
    request.current
      .then((result) => {
        if (active) setScan(result);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof ScannerError) {
          setRedeemError(
            t(`scanner.errors.${cause.code}`, {
              defaultValue: t("scanner.errors.report_unavailable"),
            }),
          );
          return;
        }
        setRedeemError(t("scanner.errors.network"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, t]);

  return (
    <div data-testid="private-report" className="bg-ink relative">
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
        data-testid="private-report-header"
        innerClassName="flex flex-col gap-6 pt-12 pb-10 sm:pt-16 lg:pt-20"
      >
        <Link
          to="/security-scan"
          className="text-lavender hover:text-lavender-soft inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("scanner.report.back")}
        </Link>

        <div className="flex max-w-3xl flex-col gap-4">
          <p className="eyebrow text-lavender">
            {t("scanner.report.privateEyebrow")}
          </p>
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl">
            {t("scanner.report.privateTitle")}
          </h1>
          <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
            {t("scanner.report.privateNote")}
          </p>
        </div>
      </SectionShell>

      {loading && (
        <SectionShell
          className="bg-transparent"
          data-testid="private-report-loading"
          innerClassName="pb-16"
        >
          <p aria-live="polite" className="text-mist/60 text-base">
            {t("scanner.report.opening")}
          </p>
        </SectionShell>
      )}

      {error !== undefined && (
        <SectionShell
          className="bg-transparent"
          data-testid="private-report-error"
          innerClassName="pb-16 lg:pb-24"
        >
          <div className="border-indigo-deep bg-ink-deep rounded-2xl border p-6 sm:p-8">
            <h2 className="font-display text-mist text-xl font-normal sm:text-2xl">
              {t("scanner.report.unavailableTitle")}
            </h2>
            <p
              role="alert"
              className="text-mist/75 mt-3 max-w-prose text-base leading-relaxed text-pretty"
            >
              {error}
            </p>
            <Link
              to="/security-scan"
              className="text-lavender hover:text-lavender-soft mt-5 inline-flex items-center gap-2 text-base font-medium transition-colors"
            >
              {t("scanner.report.requestAnother")}
            </Link>
          </div>
        </SectionShell>
      )}

      {scan !== undefined && <EmailReport scan={scan} />}
    </div>
  );
}
