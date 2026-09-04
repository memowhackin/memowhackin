import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Check } from "lucide-react";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { submitInquiry } from "@/config/inquiries";
import { SITE_LOCALE } from "@/config/locale";
import { useSeo } from "@/localization/useSeo";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
});

/*
 * Book a demo: the claim and the form on the left, what the demo shows on the
 * right over the product itself.
 *
 * Same doctrine as the contact page: a valid submit posts to the backend,
 * which stores the request before it attempts to mail it, so a success here
 * means the request is durably held rather than merely sent.
 */

const SEE_ITEMS = ["live", "agents", "after"] as const;

/** A text field's value. FormData can also carry files; this form never does. */
function fieldValue(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

/** The field dress every input on the site's forms wears (see the contact page). */
const inputClass =
  "border-lavender/25 bg-ink/60 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-lg border px-4 py-2.5 text-base outline-none transition-colors focus:ring-2";

/** A labelled form field, so the grid below reads as fields rather than markup. */
function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-mist/80 text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function DemoPage() {
  const { t } = useTranslation();
  const { ref: copyRef, className: copyReveal } = useReveal<HTMLDivElement>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );
  const { ref: sideRef, className: sideReveal } = useReveal<HTMLDivElement>({
    delay: 120,
  });

  useSeo({
    title: t("pages.demo.title"),
    description: t("pages.demo.description"),
    path: "/demo",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const firstName = fieldValue(data, "firstName");
    const lastName = fieldValue(data, "lastName");
    setStatus("sending");

    try {
      await submitInquiry({
        kind: "demo",
        name: `${firstName} ${lastName}`.trim(),
        email: fieldValue(data, "email"),
        subject: fieldValue(data, "jobTitle"),
        phone: fieldValue(data, "phone"),
        consent: data.get("consent") === "on",
        locale: SITE_LOCALE,
        website: fieldValue(data, "website"),
      });
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div data-testid="demo-page" className="bg-ink relative">
      {/* The tinted glow every page below the home page opens on. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(55% 100% at 50% 0%, rgba(96,70,202,0.22) 0%, transparent 70%)",
        }}
      />

      <SectionShell
        data-testid="demo-content"
        className="bg-transparent"
        innerClassName="grid grid-cols-1 items-start gap-12 pt-12 pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pt-20 lg:pb-24"
      >
        {/* The ask and the form. */}
        <div ref={copyRef} className={clsx("flex flex-col gap-8", copyReveal)}>
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
              {t("demoPage.heroTitle")}
              <span aria-hidden="true" className="text-lavender">
                .
              </span>
            </h1>

            <p className="text-mist/80 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              {t("demoPage.heroBody")}
            </p>
          </div>

          <div className="border-indigo-deep bg-ink-deep/50 rounded-2xl border p-5 sm:p-7">
            <form
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
              data-testid="demo-form"
              className="flex flex-col gap-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="demo-first-name"
                  label={t("demoPage.form.firstName")}
                >
                  <input
                    id="demo-first-name"
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    placeholder={t("demoPage.form.firstNamePlaceholder")}
                    className={inputClass}
                    data-testid="demo-first-name"
                  />
                </Field>

                <Field id="demo-last-name" label={t("demoPage.form.lastName")}>
                  <input
                    id="demo-last-name"
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    placeholder={t("demoPage.form.lastNamePlaceholder")}
                    className={inputClass}
                    data-testid="demo-last-name"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="demo-email" label={t("demoPage.form.email")}>
                  <input
                    id="demo-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="work email"
                    placeholder={t("demoPage.form.emailPlaceholder")}
                    className={inputClass}
                    data-testid="demo-email"
                  />
                </Field>

                <Field id="demo-job-title" label={t("demoPage.form.jobTitle")}>
                  <input
                    id="demo-job-title"
                    name="jobTitle"
                    type="text"
                    autoComplete="organization-title"
                    placeholder={t("demoPage.form.jobTitlePlaceholder")}
                    className={inputClass}
                    data-testid="demo-job-title"
                  />
                </Field>
              </div>

              <Field id="demo-phone" label={t("demoPage.form.phone")}>
                <input
                  id="demo-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder={t("demoPage.form.phonePlaceholder")}
                  className={inputClass}
                  data-testid="demo-phone"
                />
              </Field>

              {/*
                Optional on purpose: the demo is the ask, the updates are not.
                A native checkbox with the brand accent, so the browser's own
                keyboard and screen-reader behaviour stay intact.
              */}
              <label
                htmlFor="demo-consent"
                className="text-mist/70 flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
              >
                <input
                  id="demo-consent"
                  name="consent"
                  type="checkbox"
                  className="accent-lavender mt-0.5 size-4 shrink-0"
                  data-testid="demo-consent"
                />
                {/* No privacy-policy link while that page is withdrawn; the
                    sentence stands on its own until the page returns. */}
                <span>{t("demoPage.form.consent")}</span>
              </label>

              {/* The honeypot: off-screen, unlabelled, never focusable. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="sr-only"
              />

              <button
                type="submit"
                disabled={status === "sending"}
                data-testid="demo-submit"
                className={brandButtonClass({
                  className:
                    "mt-1 w-full disabled:pointer-events-none disabled:opacity-60",
                })}
              >
                {t(
                  status === "sending"
                    ? "demoPage.form.sending"
                    : "demoPage.form.submit",
                )}
              </button>

              {status !== "idle" && status !== "sending" && (
                <p
                  role="status"
                  data-testid="demo-status"
                  className={
                    status === "sent"
                      ? "text-success text-sm"
                      : "text-ember text-sm"
                  }
                >
                  {t(
                    status === "sent"
                      ? "demoPage.form.sent"
                      : "demoPage.form.failed",
                  )}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* What the walkthrough shows, over the product itself. */}
        <div ref={sideRef} className={clsx("flex flex-col gap-8", sideReveal)}>
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-mist text-2xl font-normal sm:text-3xl">
              {t("demoPage.see.title")}
            </h2>

            <ul className="flex flex-col gap-3.5">
              {SEE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="text-lavender mt-1 size-4 shrink-0"
                  />
                  <span className="text-mist/80 text-base leading-relaxed text-pretty">
                    {t(`demoPage.see.items.${item}`)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-indigo-deep/70 bg-ink-deep overflow-hidden rounded-2xl border shadow-2xl">
            <img
              src="/assets/dashboard-1.png"
              alt={t("demoPage.shotAlt")}
              width={1919}
              height={1040}
              loading="lazy"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
