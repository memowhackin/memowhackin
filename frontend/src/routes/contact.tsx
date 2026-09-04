import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { LatticeDivider } from "@/components/common/LatticeDivider";
import { SectionShell } from "@/components/common/SectionShell";
import { SelectField } from "@/components/common/SelectField";
import { useReveal } from "@/components/common/useReveal";
import { submitInquiry } from "@/config/inquiries";
import { SITE_LOCALE } from "@/config/locale";
import { useSeo } from "@/localization/useSeo";
import { site } from "@/config/site";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

/**
 * The services a visitor can ask about, in the order the site sells them. The
 * two pentests are asked for the way they are bought: as a one-off engagement
 * or as the monthly subscription that follows one.
 */
const SERVICES = [
  "webAppOnce",
  "webAppMonthly",
  "apiOnce",
  "apiMonthly",
  "awareness",
  "other",
] as const;

/** A text field's value. FormData can also carry files; this form never does. */
function fieldValue(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

/** The field dress every input on the site's forms wears (see the sample-report modal). */
const inputClass =
  "border-lavender/25 bg-ink/60 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-lg border px-4 py-2.5 text-base outline-none transition-colors focus:ring-2";

/**
 * The look every row of the channel list shares, link or mail address alike.
 * One definition, because four rows that drift apart read as four widgets.
 */
const rowClass =
  "group border-indigo-deep/60 flex items-center justify-between gap-4 border-t py-4";

/**
 * One of the ways to reach us that is not the form: a whole row of the list as
 * the link, title over one quiet line, the arrow naming it an action.
 *
 * A ruled row rather than a card, which is how this site sets everything that
 * is a list (the coverage grid, the FAQ, the process rail). Cards here were
 * tried and read as bulk: three boxes stretched to fill the form panel's
 * height, each mostly padding. A row is exactly as tall as what it says.
 *
 * Internal destinations come as `to` and go through the router, which is what
 * keeps the Dutch build inside its own `/nl` prefix; the demo comes as `href`
 * because it lives on the scanner app, and external app links open in a new
 * tab everywhere else on this site.
 */
function ChannelRow({
  to,
  href,
  channel,
  "data-testid": testId,
}: {
  to?: "/security-scan" | "/knowledge-base";
  href?: string;
  channel: string;
  "data-testid": string;
}) {
  const { t } = useTranslation();

  const inner = (
    <>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-mist group-hover:text-lavender-soft text-base font-medium transition-colors">
          {t(`contactPage.channels.${channel}.title`)}
        </span>
        <span className="text-mist/70 text-sm leading-relaxed text-pretty">
          {t(`contactPage.channels.${channel}.body`)}
        </span>
      </span>

      <ArrowRight
        aria-hidden="true"
        className="text-lavender size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
      />
    </>
  );

  if (to !== undefined) {
    return (
      <Link to={to} data-testid={testId} className={rowClass}>
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      data-testid={testId}
      className={rowClass}
    >
      {inner}
    </a>
  );
}

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

/**
 * Contact: the about page's hero voice over the same glow, then the form in
 * its own panel with the other ways in as a ruled list beside it, the direct
 * address closing that list.
 *
 * A valid submit posts to the backend, which stores the inquiry before it
 * attempts to mail it. That order is what makes the success state honest: by
 * the time this form says we have the message, a row exists, whatever the mail
 * provider happens to be doing.
 */
function ContactPage() {
  const { t } = useTranslation();
  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: formRef, className: formReveal } = useReveal<HTMLDivElement>();
  const { ref: channelsRef, className: channelsReveal } =
    useReveal<HTMLDivElement>({ delay: 120 });
  const [service, setService] = useState("");
  const [serviceError, setServiceError] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">(
    "idle",
  );

  useSeo({
    title: t("pages.contact.title"),
    description: t("pages.contact.description"),
    path: "/contact",
  });

  const serviceOptions = useMemo(
    () =>
      SERVICES.map((key) => ({
        value: key,
        label: t(`contactPage.form.services.${key}`),
      })),
    [t],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // The custom select is not a native required control, so it is checked here
    // once the browser has cleared the native required fields around it.
    if (service.length === 0) {
      setServiceError(true);
      document.getElementById("contact-service")?.focus();
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");

    try {
      await submitInquiry({
        kind: "contact",
        name: fieldValue(data, "name"),
        email: fieldValue(data, "email"),
        company: fieldValue(data, "company"),
        subject: t(`contactPage.form.services.${service}`),
        message: fieldValue(data, "note"),
        locale: SITE_LOCALE,
        website: fieldValue(data, "website"),
      });
      setStatus("sent");
      form.reset();
      setService("");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div data-testid="contact-page">
      {/* The same opening the about page makes: one statement over the glow. */}
      <SectionShell
        data-testid="contact-hero"
        className="bg-ink-deep"
        innerClassName="flex flex-col items-center gap-10 pt-12 sm:pt-16 lg:pt-20 pb-14 sm:pb-16 lg:gap-12"
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
          className={clsx(
            "flex flex-col items-center gap-6 text-center",
            heroReveal,
          )}
        >
          <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-pretty sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            {t("contactPage.heroTitle")}
          </h1>

          <p className="text-mist/85 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
            {t("contactPage.heroBody")}
          </p>
        </div>
      </SectionShell>

      {/*
        The lattice carries the hero's ground into the form's, exactly as it
        does on the about page: one surface, with the brand pattern owning the
        transition instead of a colour seam.
      */}
      <LatticeDivider data-testid="contact-lattice" />

      <SectionShell
        data-testid="contact-form-section"
        className="bg-ink"
        innerClassName="pt-4 pb-14 lg:pt-8 lg:pb-24"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
          {/*
            The form in a panel of its own rather than loose on the page: the
            one box the layout keeps, because a form is the one thing here that
            wants a surface to belong to. Everything beside and below it sets
            straight onto the page.
          */}
          <div
            ref={formRef}
            className={clsx(
              "border-indigo-deep bg-ink-deep/50 rounded-2xl border p-5 sm:p-7",
              formReveal,
            )}
          >
            <form
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
              data-testid="contact-form"
              className="flex flex-col gap-4"
            >
              <h2 className="font-display text-mist text-lg font-normal sm:text-xl">
                {t("contactPage.form.title")}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="contact-name" label={t("contactPage.form.name")}>
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
                </Field>

                <Field id="contact-email" label={t("contactPage.form.email")}>
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
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="contact-company"
                  label={t("contactPage.form.company")}
                >
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    placeholder={t("contactPage.form.companyPlaceholder")}
                    className={inputClass}
                    data-testid="contact-company"
                  />
                </Field>

                <Field
                  id="contact-service"
                  label={t("contactPage.form.service")}
                >
                  {/*
                    A themed listbox rather than a native select: its dropdown
                    wears the site's own dark panel instead of the browser's
                    white sheet.
                  */}
                  <SelectField
                    id="contact-service"
                    value={service}
                    onChange={(next) => {
                      setService(next);
                      setServiceError(false);
                    }}
                    options={serviceOptions}
                    placeholder={t("contactPage.form.servicePlaceholder")}
                    invalid={serviceError}
                    data-testid="contact-service"
                  />
                  {serviceError && (
                    <p
                      className="text-ember text-sm"
                      data-testid="contact-service-error"
                    >
                      {t("contactPage.form.serviceError")}
                    </p>
                  )}
                </Field>
              </div>

              <Field id="contact-note" label={t("contactPage.form.note")}>
                <textarea
                  id="contact-note"
                  name="note"
                  required
                  rows={5}
                  placeholder={t("contactPage.form.notePlaceholder")}
                  className={clsx(inputClass, "resize-y")}
                  data-testid="contact-note"
                />
              </Field>

              {/* The honeypot: off-screen, unlabelled, never focusable. A bot
                  filling every input it finds is dropped server-side. */}
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
                data-testid="contact-submit"
                className={brandButtonClass({
                  className:
                    "mt-1 w-full sm:w-fit disabled:pointer-events-none disabled:opacity-60",
                })}
              >
                {t(
                  status === "sending"
                    ? "contactPage.form.sending"
                    : "contactPage.form.submit",
                )}
              </button>

              {status !== "idle" && status !== "sending" && (
                <p
                  role="status"
                  data-testid="contact-status"
                  className={
                    status === "sent"
                      ? "text-success text-sm"
                      : "text-ember text-sm"
                  }
                >
                  {t(
                    status === "sent"
                      ? "contactPage.form.sent"
                      : "contactPage.form.failed",
                  )}
                </p>
              )}
            </form>
          </div>

          {/*
            The other ways in, as a ruled list beside the form rather than a
            second column of boxes. Each row is a whole-surface link to
            something this site already offers, and the direct address closes
            the list: the one channel that works without anything else on this
            page, in the accent so it is the line a skimmer leaves with.

            `self-start` on purpose: a list takes the height its rows need, and
            stretching it to the panel's foot is the bulk this layout is rid of.
          */}
          <div
            ref={channelsRef}
            className={clsx(
              "border-indigo-deep/60 flex flex-col border-b lg:self-start",
              channelsReveal,
            )}
          >
            <ChannelRow
              href={site.bookDemoUrl}
              channel="demo"
              data-testid="contact-channel-demo"
            />
            <ChannelRow
              to="/security-scan"
              channel="scan"
              data-testid="contact-channel-scan"
            />
            <ChannelRow
              to="/knowledge-base"
              channel="knowledge"
              data-testid="contact-channel-knowledge"
            />

            <a
              href={`mailto:${site.contactEmail}`}
              data-testid="contact-direct-email"
              className={rowClass}
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-mist group-hover:text-lavender-soft text-base font-medium transition-colors">
                  {t("contactPage.channels.direct.title")}
                </span>
                <span className="text-lavender text-sm leading-relaxed break-all">
                  {site.contactEmail}
                </span>
              </span>

              <ArrowRight
                aria-hidden="true"
                className="text-lavender size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
