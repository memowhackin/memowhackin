import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createRootRoute({
  component: RootLayout,
});

/*
 * The CMS runs on its own chrome. The marketing header and footer would only
 * read as clutter around a login screen or an editing desk, so the blog admin
 * and its login opt out of them and bring their own shell.
 */
function isCmsRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/studio-b78262a861") ||
    pathname.startsWith("/studio-b78262a861/login")
  );
}

function RootLayout() {
  const { t, i18n } = useTranslation();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const cms = isCmsRoute(pathname);

  // The document language stays a root concern; the title, description and the
  // rest of the SEO surface are per route now, set by `useSeo` in each page.
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="bg-ink text-mist flex min-h-screen flex-col">
      <a
        href="#main"
        data-testid="skip-to-content"
        className="bg-lavender text-ink-deep rounded-field sr-only font-medium focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-3 focus-visible:z-50 focus-visible:px-4 focus-visible:py-2"
      >
        {t("nav.skipToContent")}
      </a>

      {!cms && <SiteHeader />}
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      {!cms && <SiteFooter />}
    </div>
  );
}
