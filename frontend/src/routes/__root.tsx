import {
  createRootRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CookieConsent } from "@/components/common/CookieConsent";
import { trackPageView } from "@/config/analytics";

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

  /*
   * One page view per settled navigation, including the first.
   *
   * GA's own page view is switched off in `analytics.ts`, because it fires when
   * the script loads and never again — in a single-page app that counts the
   * landing page and nothing a visitor does afterwards. Reporting from here
   * instead means the router decides what a page view is.
   *
   * `trackPageView` is a no-op until a measurement id is configured and consent
   * has been granted, so this runs on every navigation and sends nothing at all
   * for a visitor who refused.
   */
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

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
      {/*
        Outside the `cms` guard: the CMS is ours and carries no marketing
        chrome, but consent is about what runs in a browser, not about which
        part of the site is being looked at.
      */}
      <CookieConsent />
    </div>
  );
}
