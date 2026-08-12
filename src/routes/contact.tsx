import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { LatticeDivider } from "@/components/common/LatticeDivider";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { useSeo } from "@/localization/useSeo";
import { site } from "@/config/site";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

/** The services a visitor can ask about, in the order the site sells them. */
const SERVICES = ["webApp", "api", "awareness", "other"] as const;

/** A text field's value. FormData can also carry files; this form never does. */
function fieldValue(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

/** The field dress every input on the site's forms wears (see the sample-report modal). */
const inputClass =
  "border-lavender/25 bg-indigo-deep/40 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:ring-2";

/**
 * Contact: the about page's hero voice over the same glow, then the form
 * beside a short aside. There is no data layer on this site, so a valid
 * submit composes the message into the visitor's own mail client, addressed
 * to the team — nothing is posted anywhere, and the visitor keeps a copy in
 * their sent mail.
 */
function ContactPage() {
  const { t } = useTranslation();
  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();

  useSeo({
    title: t("pages.contact.title"),
    description: t("pages.contact.description"),
    path: "/contact",
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = fieldValue(data, "name");
    const email = fieldValue(data, "email");
    const company = fieldValue(data, "company");
    const serviceKey = fieldValue(data, "service");
    const note = fieldValue(data, "note");

    const service = t(`contactPage.form.services.${serviceKey}`);
    const subject = `${service} - ${company.length > 0 ? company : name}`;
    const body = [
      `${t("contactPage.form.name")}: ${name}`,
      `${t("contactPage.form.email")}: ${email}`,
      company.length > 0 ? `${t("contactPage.form.company")}: ${company}` : "",
      "",
      note,
    ]
      .filter((line, index) => line.length > 0 || index === 3)
      .join("\n");

    window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div data-testid="contact-page">
      {/* The same opening the about page makes: one statement over the glow. */}
      <SectionShell
        data-testid="contact-hero"
        className="bg-ink-deep"
        innerClassName="flex flex-col items-center gap-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-24"
        backdrop={
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] opacity-40 blur-3xl"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(55% 80% at 50% 0%, #413994 0%, transparent 70%)",
            }}
          />
        }
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-center gap-6", heroReveal)}
        >
          <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-pretty sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            {t("contactPage.heroTitle")}
          </h1>

          <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
            {t("contactPage.heroBody")}
          </p>
        </div>
      </SectionShell>

      {/*
        The lattice carries the hero's ground into the form's, exactly as it
        does on the about page — one surface, with the brand pattern owning
        the transition instead of a colour seam.
      */}
      <LatticeDivider data-testid="contact-lattice" />

      <SectionShell
        data-testid="contact-form-section"
        className="bg-ink"
        innerClassName="grid gap-14 pt-4 pb-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20 lg:pt-8 lg:pb-24"
      >
        {/* The direct route, and what a message here actually starts. */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="eyebrow text-lavender">
              {t("contactPage.aside.directTitle")}
            </h2>
            <p className="text-mist/70 text-base leading-relaxed">
              {t("contactPage.aside.directBody")}
            </p>
            <a
              href={`mailto:${site.contactEmail}`}
              data-testid="contact-direct-email"
              className="font-display text-lavender hover:text-lavender-soft w-fit text-xl break-all transition-colors sm:text-2xl"
            >
              {site.contactEmail}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="eyebrow text-lavender">
              {t("contactPage.aside.responseTitle")}
            </h2>
            <p className="text-mist/70 max-w-sm text-base leading-relaxed text-pretty">
              {t("contactPage.aside.responseBody")}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          data-testid="contact-form"
          className="flex flex-col gap-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-name"
                className="text-mist/80 text-sm font-medium"
              >
                {t("contactPage.form.name")}
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder={t("contactPage.form.namePlaceholder")}
                className={inputClass}
                data-testid="contact-name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-email"
                className="text-mist/80 text-sm font-medium"
              >
                {t("contactPage.form.email")}
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder={t("contactPage.form.emailPlaceholder")}
                className={inputClass}
                data-testid="contact-email"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-company"
                className="text-mist/80 text-sm font-medium"
              >
                {t("contactPage.form.company")}
              </label>
              <input
                id="contact-company"
                name="company"
                type="text"
                autoComplete="organization"
                placeholder={t("contactPage.form.companyPlaceholder")}
                className={inputClass}
                data-testid="contact-company"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-service"
                className="text-mist/80 text-sm font-medium"
              >
                {t("contactPage.form.service")}
              </label>
              {/*
                A native select under the site's field dress. `appearance-none`
                drops the platform arrow so the one drawn here matches the
                lavender line the rest of the form speaks; the wrapper exists
                only to position that arrow.
              */}
              <div className="relative">
                <select
                  id="contact-service"
                  name="service"
                  required
                  defaultValue=""
                  className={clsx(inputClass, "appearance-none pr-11")}
                  data-testid="contact-service"
                >
                  <option value="" disabled>
                    {t("contactPage.form.servicePlaceholder")}
                  </option>
                  {SERVICES.map((service) => (
                    <option key={service} value={service}>
                      {t(`contactPage.form.services.${service}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="text-lavender/70 pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contact-note"
              className="text-mist/80 text-sm font-medium"
            >
              {t("contactPage.form.note")}
            </label>
            <textarea
              id="contact-note"
              name="note"
              required
              rows={6}
              placeholder={t("contactPage.form.notePlaceholder")}
              className={clsx(inputClass, "resize-y")}
              data-testid="contact-note"
            />
          </div>

          <div className="mt-1 flex flex-col gap-3">
            <button
              type="submit"
              data-testid="contact-submit"
              className={brandButtonClass({ className: "w-full sm:w-fit" })}
            >
              {t("contactPage.form.submit")}
            </button>

            <p className="text-mist/45 text-sm leading-relaxed">
              {t("contactPage.form.mailHint")}
            </p>
          </div>
        </form>
      </SectionShell>
    </div>
  );
}
