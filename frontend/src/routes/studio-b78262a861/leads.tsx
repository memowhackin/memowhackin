import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, LogOut, Mail } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";
import { useSeo } from "@/localization/useSeo";
import { ApiError, listLeads, logout, type AdminLead } from "@/config/cms";

export const Route = createFileRoute("/studio-b78262a861/leads")({
  component: LeadsAdmin,
});

/*
 * The leads captured by the exposure scanner's unlock gate.
 *
 * A read-only table: who asked to see a full report, where they work, and how
 * to reach them, newest first. The same session and 401-redirect handling as
 * the blog dashboard, so an expired login lands on the login screen rather than
 * an empty table.
 */
function LeadsAdmin() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: t("admin.leads.title"),
    description: t("admin.leads.title"),
    path: "/studio-b78262a861/leads",
    noindex: true,
  });

  useEffect(() => {
    let active = true;
    listLeads()
      .then((rows) => {
        if (active) setLeads(rows);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof ApiError && cause.status === 401) {
          void navigate({ to: "/studio-b78262a861/login" });
          return;
        }
        setError(t("admin.leads.error"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [navigate, t]);

  function formatted(iso: string): string {
    const when = new Date(iso);
    if (Number.isNaN(when.getTime())) return iso;
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(when);
  }

  return (
    <div data-testid="leads-admin" className="bg-ink min-h-screen">
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
              data-testid="leads-back"
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
            {t("admin.leads.title")}
          </h1>
          <p className="text-mist/55 text-sm">
            {t("admin.leads.subheading", { count: leads.length })}
          </p>
        </div>

        {error !== null && (
          <p role="alert" className="text-ember text-sm">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-mist/55 text-sm">{t("admin.leads.loading")}</p>
        ) : leads.length === 0 ? (
          <p className="text-mist/55 text-sm">{t("admin.leads.empty")}</p>
        ) : (
          <div className="border-indigo-deep overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-indigo-deep text-mist/50 border-b">
                  {(
                    ["name", "company", "position", "email", "date"] as const
                  ).map((column) => (
                    <th key={column} className="px-4 py-3 font-medium">
                      {t(`admin.leads.columns.${column}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    data-testid="leads-row"
                    className="border-indigo-deep/60 hover:bg-mist/[0.03] border-b last:border-0"
                  >
                    <td className="text-mist px-4 py-3">{lead.name}</td>
                    <td className="text-mist px-4 py-3">{lead.company}</td>
                    <td className="text-mist/75 px-4 py-3">{lead.position}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-lavender hover:text-lavender-soft inline-flex items-center gap-1.5 font-mono text-xs transition-colors"
                      >
                        <Mail className="size-3.5" aria-hidden="true" />
                        {lead.email}
                      </a>
                    </td>
                    <td className="text-mist/55 px-4 py-3 font-mono text-xs whitespace-nowrap tabular-nums">
                      {formatted(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
