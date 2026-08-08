import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/** Default error boundary for routes. */
export function RouteError({ error }: ErrorComponentProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-12 text-center"
      data-testid="route-error"
    >
      <h1 className="text-2xl font-semibold">{t("error.title")}</h1>
      <p className="max-w-md text-sm opacity-70">{error.message}</p>
      <Link to="/" className="btn btn-primary">
        {t("error.backHome")}
      </Link>
    </div>
  );
}
