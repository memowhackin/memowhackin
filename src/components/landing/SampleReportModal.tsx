import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { brandButtonClass } from "@/components/common/brandButtonClass";

interface SampleReportModalProps {
  open: boolean;
  onClose: () => void;
}

interface Field {
  key: "email" | "company" | "phone";
  type: "email" | "text" | "tel";
  autoComplete: string;
}

/*
 * Three fields, all required. The types are what earns the mobile keyboards and
 * the browser's own autofill and validation — `email` gets the address check for
 * free, `tel` the numeric pad.
 */
const FIELDS: readonly Field[] = [
  { key: "email", type: "email", autoComplete: "email" },
  { key: "company", type: "text", autoComplete: "organization" },
  { key: "phone", type: "tel", autoComplete: "tel" },
];

const inputClass =
  "border-lavender/25 bg-indigo-deep/40 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:ring-2";

/**
 * The "Request sample report" dialog: a card styled after the blog teasers —
 * the logo pattern across the top, the same dark panel and lavender edge —
 * carrying a short form. There is no data layer on this site, so a valid submit
 * is confirmed in place rather than posted anywhere; wiring it to an endpoint is
 * a one-line change in `handleSubmit`.
 */
export function SampleReportModal({ open, onClose }: SampleReportModalProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const fieldId = useId();
  const [submitted, setSubmitted] = useState(false);

  // Reset on the way out — every close path runs through here — so the next
  // open starts on the form rather than a stale confirmation, with no effect
  // reaching in to do it.
  function handleClose() {
    setSubmitted(false);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      labelledBy={titleId}
      closeLabel={t("benefits.modal.close")}
      data-testid="sample-report-modal"
    >
      {/* The logo pattern band the blog cards open on. */}
      <img
        src="/assets/blog-pattern.webp"
        alt=""
        width={488}
        height={84}
        aria-hidden="true"
        className="h-20 w-full object-cover sm:h-24"
      />

      <div className="flex flex-col gap-6 p-6 sm:p-8">
        {submitted ? (
          <div
            className="flex flex-col items-center gap-4 py-6 text-center"
            data-testid="sample-report-success"
          >
            <CheckCircle2
              className="text-lavender size-12"
              aria-hidden="true"
            />
            <h2
              id={titleId}
              className="font-display text-mist text-2xl font-normal"
            >
              {t("benefits.modal.successTitle")}
            </h2>
            <p className="text-mist/75 max-w-sm text-base leading-relaxed text-pretty">
              {t("benefits.modal.successBody")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h2
                id={titleId}
                className="font-display text-mist text-2xl font-normal text-balance"
              >
                {t("benefits.modal.title")}
              </h2>
              <p className="text-mist/70 text-base leading-relaxed text-pretty">
                {t("benefits.modal.description")}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              data-testid="sample-report-form"
              noValidate={false}
            >
              {FIELDS.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`${fieldId}-${field.key}`}
                    className="text-mist/80 text-sm font-medium"
                  >
                    {t(`benefits.modal.${field.key}`)}
                  </label>
                  <input
                    id={`${fieldId}-${field.key}`}
                    name={field.key}
                    type={field.type}
                    required
                    autoComplete={field.autoComplete}
                    placeholder={t(`benefits.modal.${field.key}Placeholder`)}
                    className={inputClass}
                    data-testid={`sample-report-${field.key}`}
                  />
                </div>
              ))}

              <button
                type="submit"
                data-testid="sample-report-submit"
                className={brandButtonClass({ className: "mt-1 w-full" })}
              >
                {t("benefits.modal.submit")}
              </button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
