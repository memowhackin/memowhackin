import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/** Default component for unmatched routes. */
export function NotFound() {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-12 text-center"
      data-testid="not-found"
    >
      <h1 className="text-4xl font-bold">404</h1>
      <p className="opacity-70">{t("error.notFound")}</p>
      <Link to="/" className="btn btn-primary">
        {t("error.backHome")}
      </Link>
    </div>
  );
}
