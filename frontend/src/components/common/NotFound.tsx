import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { brandButtonClass } from "@/components/common/brandButtonClass";

/**
 * Default component for unmatched routes.
 *
 * It renders inside the site layout, so it has to look like the rest of the
 * page rather than like a framework default: the same display face, the same
 * content column, and the call-to-action the landing sections use.
 */
export function NotFound() {
  const { t } = useTranslation();

  return (
    <div
      className="mx-auto flex w-full max-w-[90rem] flex-col items-center gap-6 px-6 py-24 text-center sm:px-10 sm:py-32 lg:px-16"
      data-testid="not-found"
    >
      <p className="font-display eyebrow text-lavender">404</p>

      <h1 className="font-display text-section text-mist max-w-2xl font-normal text-balance">
        {t("error.notFound")}
      </h1>

      <Link
        to="/"
        data-testid="not-found-home"
        className={brandButtonClass({ className: "mt-2" })}
      >
        {t("error.backHome")}
      </Link>
    </div>
  );
}
