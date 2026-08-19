import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ScannerPanel } from "@/components/scanner/ScannerPanel";
import { useSeo } from "@/localization/useSeo";
import {
  ScannerError,
  scannerAvailable,
  startScan,
  type ScanKind,
} from "@/config/scanner";

export const Route = createFileRoute("/security-scan/")({
  component: SecurityScanPage,
});

/*
 * The scanner's landing state.
 *
 * Deliberately a short page: an eyebrow, a heading, one paragraph and the
 * panel. Everything else a marketing page would carry — the case studies, the
 * logos, the second call to action — competes with the one thing a visitor
 * came here to do, and the panel is strong enough to carry the fold on its own.
 *
 * A website scan navigates to its result page as soon as the id exists, so the
 * scan survives a refresh and can be linked. An email scan navigates nowhere:
 * it has no id to navigate to by design, and the page turns into the same
 * neutral acknowledgement whatever the address was.
 */
function SecurityScanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [mailed, setMailed] = useState(false);
  const [available, setAvailable] = useState(true);
  const acknowledgementRef = useRef<HTMLDivElement>(null);

  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: panelRef, className: panelReveal } = useReveal<HTMLDivElement>({
    delay: 120,
  });

  useSeo({
    title: t("pages.securityScan.title"),
    description: t("pages.securityScan.description"),
    path: "/security-scan",
  });

  useEffect(() => {
    let active = true;
    void scannerAvailable().then((value) => {
      if (active) setAvailable(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const describe = useCallback(
    (cause: unknown): string => {
      if (cause instanceof ScannerError) {
        if (cause.code === "invalid_subject" && cause.reason !== undefined) {
          return t(`scanner.errors.${cause.reason}`, {
            defaultValue: t("scanner.errors.invalid_domain"),
          });
        }
        return t(`scanner.errors.${cause.code}`, {
          defaultValue: t("scanner.errors.network"),
        });
      }
      return t("scanner.errors.network");
    },
    [t],
  );

  function handleSubmit(input: {
    kind: ScanKind;
    subject: string;
    marketingConsent: boolean;
  }) {
    if (busy) return;
    setBusy(true);
    setError(undefined);

    startScan(input)
      .then((scan) => {
        if (scan === undefined) {
          // The email flow. There is no id and never will be one here.
          setMailed(true);
          // Move focus to the acknowledgement, or a keyboard user is left on
          // a submit button whose form has just been replaced.
          requestAnimationFrame(() => acknowledgementRef.current?.focus());
          return;
        }
        void navigate({
          to: "/security-scan/results/$scanId",
          params: { scanId: scan.id },
        });
      })
      .catch((cause: unknown) => {
        setError(describe(cause));
      })
      .finally(() => {
        setBusy(false);
      });
  }

  return (
    <div data-testid="security-scan" className="bg-ink relative">
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
        data-testid="security-scan-hero"
        innerClassName="flex flex-col gap-10 pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24"
      >
        <div
          ref={heroRef}
          className={`flex max-w-3xl flex-col gap-5 ${heroReveal}`}
        >
          <p className="eyebrow text-lavender">{t("scanner.eyebrow")}</p>
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t("scanner.heading")}
          </h1>
          <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
            {t("scanner.intro")}
          </p>
        </div>

        <div ref={panelRef} className={`max-w-3xl ${panelReveal}`}>
          {mailed ? (
            <div
              ref={acknowledgementRef}
              tabIndex={-1}
              role="status"
              data-testid="scanner-mail-sent"
              className="border-indigo-deep bg-ink-deep rounded-2xl border p-6 outline-none sm:p-8"
            >
              <h2 className="font-display text-mist text-xl font-normal sm:text-2xl">
                {t("scanner.mailed.title")}
              </h2>
              {/*
                Worded so that it says the same thing for an address with
                exposure, an address without, and an address that does not
                exist. Any difference here would answer the question the
                report is supposed to answer only to its owner.
              */}
              <p className="text-mist/75 mt-3 max-w-prose text-base leading-relaxed text-pretty">
                {t("scanner.mailed.body")}
              </p>
              <p className="text-mist/55 mt-3 max-w-prose text-sm leading-relaxed text-pretty">
                {t("scanner.mailed.note")}
              </p>
            </div>
          ) : (
            <ScannerPanel
              onSubmit={handleSubmit}
              busy={busy}
              available={available}
              {...(error === undefined ? {} : { error })}
            />
          )}
        </div>
      </SectionShell>

      <ClosingCta />
    </div>
  );
}
