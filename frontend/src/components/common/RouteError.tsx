import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { brandButtonClass } from "@/components/common/brandButtonClass";

/**
 * Default error boundary for routes.
 *
 * Retrying comes first: the landing page has no data to reload, so almost
 * anything that lands here is transient — a chunk that failed to arrive — and
 * re-rendering the route is more likely to fix it than a trip back to the top of
 * the site. The raw message is kept, set apart as mono detail rather than as
 * body copy, because it is the only thing anyone can quote in a bug report.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation();

  return (
    <div
      className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 py-24 text-center sm:px-10 sm:py-32 lg:px-16"
      data-testid="route-error"
    >
      <h1 className="font-display text-section text-mist max-w-2xl font-normal text-balance">
        {t("error.title")}
      </h1>

      <p className="text-mist/70 max-w-xl text-base leading-relaxed text-pretty">
        {t("error.body")}
      </p>

      {error.message && (
        <p
          data-testid="route-error-detail"
          className="border-indigo-deep bg-ink-deep text-mist/60 max-w-xl overflow-x-auto rounded-lg border px-4 py-3 font-mono text-xs"
        >
          {error.message}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          data-testid="route-error-retry"
          className={brandButtonClass()}
        >
          {t("error.retry")}
        </button>

        <Link
          to="/"
          data-testid="route-error-home"
          className={brandButtonClass({ variant: "ghost" })}
        >
          {t("error.backHome")}
        </Link>
      </div>
    </div>
  );
}
