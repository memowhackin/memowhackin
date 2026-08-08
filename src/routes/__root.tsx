import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { t, i18n } = useTranslation();

  // Keep <html lang>, the title and the meta description in sync so screen
  // readers and search engines pick the right language.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = `${t("app.title")} — ${t("hero.title")}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t("app.description"));
  }, [i18n.language, t]);

  return (
    <div className="bg-ink text-mist flex min-h-screen flex-col">
      <a
        href="#main"
        data-testid="skip-to-content"
        className="bg-lavender text-ink-deep rounded-field sr-only font-medium focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2"
      >
        {t("nav.skipToContent")}
      </a>

      <SiteHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
