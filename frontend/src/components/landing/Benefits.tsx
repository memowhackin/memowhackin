import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { ReportStack } from "@/components/common/ReportStack";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { SampleReportModal } from "@/components/landing/SampleReportModal";

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
  const {
    ref: ctaRef,
    className: ctaClassName,
    style: ctaStyle,
  } = useReveal<HTMLDivElement>({ delay: 220 });

  return (
    /*
     * Three cells, placed rather than flowed, because the two layouts want
     * different orders.
     *
     * On a phone the section reads copy, then the report, then the button:
     * the artwork is the evidence the button asks you to act on, so it has to
     * come first. It used to sit last, which left the visitor asked for their
     * details before being shown the thing they were requesting, and put the
     * one tappable control in the middle of the section where a thumb passes
     * it on the way past.
     *
     * From `lg` the button rejoins the copy in the right-hand column, with the
     * artwork spanning both rows on the left. Hence `gap-y-8` at that
     * breakpoint: it is the gap the copy column used to carry internally, so
     * the desktop rhythm is unchanged.
     */
    <SectionShell
      data-testid="benefits"
      className="bg-ink overflow-x-clip"
      innerClassName="grid items-center gap-6 py-16 sm:gap-8 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-x-32 lg:gap-y-8 lg:py-28 xl:gap-x-44"
    >
      <div
        ref={copyRef}
        style={copyStyle}
        className={clsx(
          /*
           * `self-end` here and `self-start` on the button are what keep the
           * two halves of the right-hand column together on desktop. The
           * artwork spans both rows, so those rows have to add up to its
           * height, and the surplus is split evenly between them — left to
           * centre in their own rows the heading rose and the button sank by
           * the same amount, 52px at 1920. Pinned to the inside edges they sit
           * exactly the
           * row gap apart, and because the surplus is split evenly the pair
           * still centres against the artwork, as it did when it was one cell.
           */
          "order-1 flex flex-col gap-8 lg:order-none lg:col-start-2 lg:row-start-1 lg:self-end",
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
      </div>

      {/*
        No scale and no negative margins on a phone any more, which is what
        made the picture collide with the button.

        They were there to "spend the render's transparent canvas margins", but
        the renders have none worth spending: the ink runs to the top and
        bottom edges of the file and stops 1.8% and 3.5% short of the sides. So
        `scale-[1.16]` with `-my-[6%]` was not reclaiming empty canvas, it was
        enlarging the artwork past its own box and dragging it upward — 44px at
        390px wide (24 from half the added height, 20 from the margin), which
        is how a picture that should have cleared the CTA by the grid's 24px
        gap ended up 20px over it instead.

        Left at its natural size the box and the picture are the same object
        again, so the grid's own gap is the spacing you see and there is
        nothing to keep clear of. The desktop scale stays: that column is wide
        and empty, and nothing sits above the artwork there to hit.
      */}
      <div
        ref={stackRef}
        style={stackStyle}
        className={clsx(
          "order-2 mx-auto w-full max-w-[34rem] lg:order-none lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:mx-0 lg:max-w-none lg:scale-[1.04]",
          stackClassName,
        )}
      >
        <ReportStack />
      </div>

      <div
        ref={ctaRef}
        style={ctaStyle}
        className={clsx(
          "order-3 lg:order-none lg:col-start-2 lg:row-start-2 lg:self-start",
          ctaClassName,
        )}
      >
        <button
          type="button"
          onClick={() => {
            setModalOpen(true);
          }}
          data-testid="benefits-sample-report"
          className={brandButtonClass({ className: "w-full sm:w-fit" })}
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
