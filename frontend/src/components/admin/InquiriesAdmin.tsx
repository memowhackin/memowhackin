import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, LogOut, Mail } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";
import { useSeo } from "@/localization/useSeo";
import {
  ApiError,
  listInquiries,
  logout,
  type AdminInquiry,
  type InquiryKind,
} from "@/config/cms";

/*
 * Contact and demo requests, as a read-only screen.
 *
 * One component for both, because they are the same row read two ways: the
 * contact form carries a service and a message, the demo form a job title and
 * a phone number, and everything else about them is identical. Two copies of
 * this table is how the two would drift.
 *
 * Every row is expandable rather than truncated, because the message is the
 * point of a contact request and a table that clips it would send the reader
 * to their mailbox to find out what was actually asked.
 */

/** A message that never left as mail is the one thing this screen must flag. */
function DeliveryState({ inquiry }: { inquiry: AdminInquiry }) {
  const { t } = useTranslation();

  if (inquiry.deliveredAt !== null) {
    return (
      <span className="text-mist/45 font-mono text-xs whitespace-nowrap">
        {t("admin.inquiries.delivered")}
      </span>
    );
  }

  return (
    <span className="border-warning/30 bg-warning/10 text-warning inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[0.65rem] font-medium tracking-wide whitespace-nowrap uppercase">
      <Clock className="size-3" aria-hidden="true" />
      {t("admin.inquiries.notDelivered")}
    </span>
  );
}

export function InquiriesAdmin({ kind }: { kind: InquiryKind }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rows, setRows] = useState<AdminInquiry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const path =
    kind === "demo"
      ? "/studio-b78262a861/demo-inquiries"
      : "/studio-b78262a861/contact-inquiries";

  useSeo({
    title: t(`admin.inquiries.${kind}.title`),
    description: t(`admin.inquiries.${kind}.title`),
    path,
    noindex: true,
  });

  useEffect(() => {
    let active = true;

    // No `setLoading(true)` here: `kind` is fixed by the route that renders
    // this, so the effect runs once and the initial state is already `true`.
    // Setting it synchronously would only buy a cascading render.
    listInquiries(kind)
      .then((found) => {
        if (active) setRows(found);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof ApiError && cause.status === 401) {
          void navigate({ to: "/studio-b78262a861/login" });
          return;
        }
        setError(t("admin.inquiries.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [kind, navigate, t]);

  function formatted(iso: string): string {
    const when = new Date(iso);
    if (Number.isNaN(when.getTime())) return iso;
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(when);
  }

  return (
    <div
      data-testid={`${kind}-inquiries-admin`}
      className="bg-ink min-h-screen"
    >
      <header className="border-indigo-deep bg-ink-deep/90 sticky top-0 z-20 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <LogoMark className="text-lavender h-6 w-auto" />
            <span className="font-display text-mist text-sm font-medium tracking-wide">
              {t("admin.loginHeading")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/studio-b78262a861"
              data-testid="inquiries-back"
              className="border-indigo-deep text-mist hover:border-lavender/50 hover:text-lavender inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("admin.leads.back")}
            </Link>
            <button
              type="button"
              onClick={() => {
                void logout().then(() =>
                  navigate({ to: "/studio-b78262a861/login" }),
                );
              }}
              data-testid="admin-logout"
              className="bg-lavender text-ink-deep hover:bg-lavender-soft inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("admin.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[80rem] flex-col gap-8 px-4 py-8 sm:px-8 lg:py-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-mist text-2xl font-normal sm:text-3xl">
            {t(`admin.inquiries.${kind}.title`)}
          </h1>
          <p className="text-mist/55 text-sm">
            {t("admin.inquiries.subheading", { count: rows.length })}
          </p>
        </div>

        {error !== null && (
          <p role="alert" className="text-ember text-sm">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-mist/55 text-sm">{t("admin.inquiries.loading")}</p>
        )}

        {!loading && error === null && rows.length === 0 && (
          <p className="text-mist/55 text-sm">{t("admin.inquiries.empty")}</p>
        )}

        {!loading && rows.length > 0 && (
          <ul className="flex flex-col gap-3">
            {rows.map((inquiry) => (
              <li
                key={inquiry.id}
                data-testid="inquiry-row"
                className="border-indigo-deep bg-ink-deep/40 flex flex-col gap-3 rounded-xl border p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-mist text-base font-medium">
                      {inquiry.name}
                      {inquiry.company !== null && (
                        <span className="text-mist/50 font-normal">
                          {" "}
                          {inquiry.company}
                        </span>
                      )}
                    </span>

                    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="text-lavender hover:text-lavender-soft inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
                      >
                        <Mail className="size-3.5" aria-hidden="true" />
                        {inquiry.email}
                      </a>

                      {inquiry.phone !== null && (
                        <span className="text-mist/60 font-mono text-xs">
                          {inquiry.phone}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-mist/55 font-mono text-xs whitespace-nowrap tabular-nums">
                      {formatted(inquiry.createdAt)}
                    </span>
                    <DeliveryState inquiry={inquiry} />
                  </div>
                </div>

                {/* The service asked about, or the job title on a demo. */}
                {inquiry.subject !== null && (
                  <span className="border-lavender/25 bg-lavender/5 text-lavender w-fit rounded-md border px-2 py-0.5 text-xs">
                    {inquiry.subject}
                  </span>
                )}

                {inquiry.message !== null && (
                  <p className="border-indigo-deep/60 text-mist/80 border-t pt-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {inquiry.message}
                  </p>
                )}

                <span className="text-mist/35 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.65rem]">
                  <span>{inquiry.locale}</span>
                  <span>
                    {t(
                      inquiry.consent
                        ? "admin.inquiries.consentYes"
                        : "admin.inquiries.consentNo",
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
