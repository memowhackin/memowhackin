import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { SectionShell } from "@/components/common/SectionShell";
import { useSeo } from "@/localization/useSeo";
import { login, useSession } from "@/config/cms";

export const Route = createFileRoute("/studio-b78262a861/login")({
  component: BlogLogin,
});

const inputClass =
  "border-lavender/25 bg-indigo-deep/40 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:ring-2";

function BlogLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { status } = useSession();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  useSeo({
    title: t("admin.loginTitle"),
    description: t("pages.blog.description"),
    path: "/studio-b78262a861/login",
    // The sign-in screen has nothing to offer a search engine, and an indexed
    // admin entry point is free reconnaissance.
    noindex: true,
  });

  // Already signed in: the login screen has nothing to offer, go to the desk.
  useEffect(() => {
    if (status === "authed") void navigate({ to: "/studio-b78262a861" });
  }, [status, navigate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    if (typeof email !== "string" || typeof password !== "string") return;

    setBusy(true);
    setError(false);

    // The server decides. This only reflects its answer — there is no local
    // credential check to get past any more.
    login(email, password)
      .then(() => navigate({ to: "/studio-b78262a861" }))
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setBusy(false);
      });
  }

  return (
    <SectionShell
      data-testid="blog-login"
      className="bg-ink-deep"
      innerClassName="flex min-h-[70vh] flex-col items-center justify-center py-20"
      backdrop={
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem] opacity-40 blur-3xl"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(55% 80% at 50% 0%, #413994 0%, transparent 70%)",
          }}
        />
      }
    >
      <div className="border-indigo-deep bg-ink-deep/80 flex w-full max-w-sm flex-col gap-6 rounded-2xl border p-8 shadow-[0_2rem_5rem_-1rem_rgba(0,0,0,0.8)] backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-mist text-2xl font-normal">
            {t("admin.loginHeading")}
          </h1>
          <p className="text-mist/60 text-sm leading-relaxed">
            {t("admin.loginBody")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          data-testid="blog-login-form"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-mist/80 text-sm font-medium"
            >
              {t("admin.email")}
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className={inputClass}
              data-testid="login-username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-mist/80 text-sm font-medium"
            >
              {t("admin.password")}
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              data-testid="login-password"
            />
          </div>

          {error && (
            <p className="text-ember text-sm" data-testid="login-error">
              {t("admin.loginError")}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            data-testid="login-submit"
            className={brandButtonClass({
              className: "mt-1 w-full disabled:opacity-60",
            })}
          >
            {busy ? t("admin.loginPending") : t("admin.loginSubmit")}
          </button>
        </form>
      </div>
    </SectionShell>
  );
}
