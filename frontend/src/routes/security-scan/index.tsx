import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { LogoMark } from "@/components/common/Logo";
import { GlassPanel } from "@/components/scanner/GlassPanel";
import { ScannerChecks } from "@/components/scanner/ScannerChecks";
import { ScannerPanel } from "@/components/scanner/ScannerPanel";
import { useSeo } from "@/localization/useSeo";
import { ScannerError, scannerAvailable, startScan } from "@/config/scanner";

export const Route = createFileRoute("/security-scan/")({
  component: SecurityScanPage,
});

/*
 * The scanner's landing state.
 *
 * The fold is a heading, one paragraph and the console, and nothing else: no
 * eyebrow, no logo wall, no second call to action. Everything a marketing page
 * would normally stack above the form competes with the one thing a visitor
 * came here to do, and the console is strong enough to carry the fold alone.
 *
 * What follows the fold is not more marketing. It is four sections naming the
 * specific checks the scan performs, because the question a visitor actually
 * has before typing their domain into a stranger's form is what will be done
 * to it.
 *
 * The scan navigates to its result page as soon as the id exists, so it
 * survives a refresh and can be linked.
 */
function SecurityScanPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [available, setAvailable] = useState(true);

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

  function handleSubmit(input: { subject: string }) {
    if (busy) return;
    setBusy(true);
    setError(undefined);

    startScan({
      kind: "website",
      subject: input.subject,
      marketingConsent: false,
    })
      .then((scan) => {
        // A website scan always has an id to navigate to; the earlier
        // id-less email path is gone with the email feature.
        if (scan === undefined) return;
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
      <SectionShell
        className="bg-transparent"
        data-testid="security-scan-hero"
        innerClassName="flex flex-col gap-10 pt-12 pb-20 sm:pt-16 lg:gap-14 lg:pt-20 lg:pb-28"
      >
        {/*
          No eyebrow. The heading carries the page on its own, and a label
          above it saying the same thing in smaller type was the third time
          the fold introduced itself.
        */}
        <div
          ref={heroRef}
          className={`flex max-w-3xl flex-col gap-5 ${heroReveal}`}
        >
          <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t("scanner.heading")}
          </h1>
          <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
            {t("scanner.intro")}
          </p>
        </div>

        {/*
          The console, in the same frosted shell the figures below use. See
          `GlassPanel` for why the edge is a band rather than a line and why
          the surface inside it is a single flat colour.
        */}
        <div ref={panelRef} className={`w-full ${panelReveal}`}>
          {/*
            `overflow-hidden` on the inner surface is what keeps the watermark
            a watermark: the mark is nudged past the top-right corner and the
            container clips whatever crosses its own rounded edge, so about a
            quarter of it is cut and nothing of it ever shows outside the panel.
            It sits behind the form (the content wrapper below is positioned and
            paints over it) and is `aria-hidden`, so it is decoration only.
          */}
          <GlassPanel innerClassName="relative overflow-hidden p-6 sm:p-9 lg:p-11">
            <LogoMark
              aria-hidden="true"
              className="text-lavender/[0.12] pointer-events-none absolute -top-5 -right-5 w-24 sm:w-28"
            />
            <div className="relative">
              <ScannerPanel
                onSubmit={handleSubmit}
                busy={busy}
                available={available}
                {...(error === undefined ? {} : { error })}
              />
            </div>
          </GlassPanel>
        </div>
      </SectionShell>

      <ScannerChecks />

      <ClosingCta />
    </div>
  );
}
