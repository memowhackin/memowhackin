import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Modal } from "@/components/common/Modal";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { checkCompanyEmail } from "@/components/scanner/companyEmail";

/*
 * The lead gate. Opened when a locked report asks for more than the free
 * preview, it collects who is asking before the rest is revealed.
 *
 * Every field is required, and the email has to be a company address — a free
 * webmail address is exactly the lead this is meant to qualify out. Validation
 * happens here for the answer-without-a-round-trip, and again on the server,
 * which is the one that decides.
 */

export interface Lead {
  name: string;
  company: string;
  position: string;
  email: string;
}

type FieldKey = keyof Lead;

const FIELDS: readonly {
  key: FieldKey;
  type: "text" | "email";
  autoComplete: string;
}[] = [
  { key: "name", type: "text", autoComplete: "name" },
  { key: "company", type: "text", autoComplete: "organization" },
  { key: "position", type: "text", autoComplete: "organization-title" },
  { key: "email", type: "email", autoComplete: "email" },
];

function inputClass(invalid: boolean): string {
  return clsx(
    "bg-ink/60 text-mist placeholder:text-mist/30 w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:ring-2",
    invalid
      ? "border-ember focus:border-ember focus:ring-ember/30"
      : "border-mist/15 focus:border-lavender focus:ring-lavender/25",
  );
}

export function GateModal({
  open,
  onClose,
  onSubmit,
  busy,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (lead: Lead) => void;
  busy: boolean;
  error?: string;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const fid = useId();

  const [values, setValues] = useState<Lead>({
    name: "",
    company: "",
    position: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const next: Partial<Record<FieldKey, string>> = {};
    for (const field of FIELDS) {
      if (values[field.key].trim().length === 0) {
        next[field.key] = t("scanner.gate.required");
      }
    }
    if (next.email === undefined) {
      const verdict = checkCompanyEmail(values.email);
      if (!verdict.ok) {
        next.email =
          verdict.reason === "free"
            ? t("scanner.gate.emailCompany")
            : t("scanner.gate.emailFormat");
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      name: values.name.trim(),
      company: values.company.trim(),
      position: values.position.trim(),
      email: values.email.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      closeLabel={t("scanner.gate.close")}
      data-testid="scan-gate-modal"
    >
      {/* The logo pattern band, the same one the home page's report modal opens on. */}
      <img
        src="/assets/blog-pattern.webp"
        alt=""
        width={488}
        height={84}
        aria-hidden="true"
        className="h-20 w-full object-cover sm:h-24"
      />

      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h2
            id={titleId}
            className="font-display text-mist text-2xl font-normal text-balance"
          >
            {t("scanner.gate.title")}
          </h2>
          <p className="text-mist/70 text-base leading-relaxed text-pretty">
            {t("scanner.gate.body")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={`${fid}-${field.key}`}
                className="text-mist/80 text-sm font-medium"
              >
                {t(`scanner.gate.fields.${field.key}`)}
              </label>
              <input
                id={`${fid}-${field.key}`}
                name={field.key}
                type={field.type}
                autoComplete={field.autoComplete}
                autoCapitalize={field.type === "email" ? "none" : "words"}
                value={values[field.key]}
                onChange={(event) => {
                  const value = event.target.value;
                  setValues((current) => ({ ...current, [field.key]: value }));
                }}
                aria-invalid={errors[field.key] !== undefined}
                data-testid={`scan-gate-${field.key}`}
                className={inputClass(errors[field.key] !== undefined)}
              />
              {errors[field.key] !== undefined && (
                <p
                  data-testid={`scan-gate-${field.key}-error`}
                  className="text-ember text-sm"
                >
                  {errors[field.key]}
                </p>
              )}
            </div>
          ))}

          {error !== undefined && (
            <p role="alert" className="text-ember text-sm leading-relaxed">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            data-testid="scan-gate-submit"
            className={brandButtonClass({
              className: "mt-1 w-full disabled:opacity-60",
            })}
          >
            {busy ? t("scanner.gate.submitting") : t("scanner.gate.submit")}
          </button>
        </form>
      </div>
    </Modal>
  );
}
