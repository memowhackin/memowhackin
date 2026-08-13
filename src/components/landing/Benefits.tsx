import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { SampleReportModal } from "@/components/landing/SampleReportModal";

/**
 * The artwork's intrinsic size. Set on both layers so the grid reserves the
 * row before the first spread decodes — without it the copy column snaps
 * upward as the section scrolls in.
 */
const spreadWidth = 1500;
const spreadHeight = 1300;

/**
 * The deliverable as a still life: the sample report open at the executive
 * summary, and behind it — dimmed, tilted, half-hidden — the technical
 * appendix. The back spread's "Appendix A" strip peeks above the front page
 * with its finding title cropped mid-line, which is the point: the section
 * shows that more exists without ever showing it. There is deliberately no
 * way to page through here; the only path to the rest is the CTA.
 */
function ReportStack() {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-none relative aspect-[1500/1300] w-full select-none">
      {/* Reading-light glow anchoring the paper on the ink background. */}
      <div
        aria-hidden="true"
        className="absolute top-[2%] left-[8%] size-[86%] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-indigo-bright)_52%,transparent),color-mix(in_oklab,var(--color-indigo)_24%,transparent)_55%,transparent_80%)] opacity-60"
      />

      {/*
        The appendix, in shadow. The clip removes the render's own standing
        cover (every spread ships with one; two covers would read as a bug),
        and the up-right offset floats the surviving page's top strip above
        the front spread.
      */}
      <img
        src="/assets/report/hero-4.webp"
        srcSet="/assets/report/hero-4.webp 1x, /assets/report/hero-4@2x.webp 2x"
        width={spreadWidth}
        height={spreadHeight}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="motion-safe:animate-report-sway absolute inset-0 size-full translate-x-[5%] -translate-y-[13%] scale-[0.985] rotate-[1.5deg] object-contain brightness-[0.82] [clip-path:inset(0_0_20%_16%)]"
      />

      <img
        src="/assets/report/hero-1.webp"
        srcSet="/assets/report/hero-1.webp 1x, /assets/report/hero-1@2x.webp 2x"
        width={spreadWidth}
        height={spreadHeight}
        alt={t("benefits.reportAlt")}
        loading="lazy"
        className="absolute inset-0 size-full object-contain"
      />
    </div>
  );
}

/** Report still life on the left, benefit copy and sample-report CTA on the right. */
export function Benefits() {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    ref: stackRef,
    className: stackClassName,
    style: stackStyle,
  } = useReveal<HTMLDivElement>();
  const {
    ref: copyRef,
    className: copyClassName,
    style: copyStyle,
  } = useReveal<HTMLDivElement>({ delay: 120 });

  return (
    <SectionShell
      data-testid="benefits"
      className="bg-ink overflow-x-clip"
      innerClassName="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-28 xl:gap-24"
    >
      {/*
        Stacked, the heading introduces the artwork rather than follows it.
        The gentle scale-up spends the render's transparent canvas margins so
        the book fills its column instead of floating in it.
      */}
      <div
        ref={stackRef}
        style={stackStyle}
        className={clsx(
          "order-2 mx-auto w-full max-w-[34rem] scale-[1.04] lg:order-none lg:mx-0 lg:max-w-none",
          stackClassName,
        )}
      >
        <ReportStack />
      </div>

      <div
        ref={copyRef}
        style={copyStyle}
        className={clsx(
          "order-1 flex flex-col gap-8 lg:order-none",
          copyClassName,
        )}
      >
        <h2 className="font-display text-section text-mist font-normal text-balance">
          {t("benefits.title")}
        </h2>

        <div className="text-mist/80 flex flex-col gap-5 text-base leading-relaxed text-pretty">
          <p>{t("benefits.reportIntro")}</p>
          <p>{t("benefits.reportBody")}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalOpen(true);
          }}
          data-testid="benefits-sample-report"
          className={brandButtonClass({ className: "w-fit" })}
        >
          {t("benefits.cta")}
        </button>
      </div>

      <SampleReportModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      />
    </SectionShell>
  );
}
