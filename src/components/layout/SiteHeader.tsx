import { useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoLockup } from "@/components/common/Logo";
import { BrandButton } from "@/components/common/BrandButton";
import {
  changeLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@/localization/i18n";
import { env } from "@/config/env";
import { sectionIds, site } from "@/config/site";

const navItems = [
  { key: "services", href: `#${sectionIds.services}`, label: "nav.services" },
  { key: "aboutUs", href: `#${sectionIds.about}`, label: "nav.aboutUs" },
  {
    key: "demonstrate",
    href: `#${sectionIds.demonstrate}`,
    label: "nav.demonstrate",
  },
  { key: "blog", href: `#${sectionIds.blog}`, label: "nav.blog" },
] as const;

export function SiteHeader() {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-ink-deep/80 sticky top-0 z-50 w-full backdrop-blur-md">
      {/* Announcement strip — the 32px gradient bar across the top of the frame. */}
      <a
        href={site.scannerBaseUrl}
        target="_blank"
        rel="noreferrer noopener"
        data-testid="announcement-bar"
        className="brand-sweep flex w-full items-center justify-center gap-2 px-4 py-1 text-center transition hover:brightness-110"
      >
        <span className="bg-lavender text-ink-deep rounded-selector px-4 py-1 text-xs font-semibold">
          {t("announcement.badge")}
        </span>
        <span className="truncate text-xs tracking-[0.02em] text-white sm:text-sm">
          {t("announcement.text")}
        </span>
        <ArrowRight className="size-5 shrink-0 text-white" aria-hidden="true" />
      </a>

      <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-16 2xl:px-0">
        <a
          href="#top"
          data-testid="header-logo"
          aria-label={t("app.title")}
          className="inline-flex items-center py-2"
        >
          <LogoLockup className="text-mist h-5 w-auto" />
        </a>

        <nav
          aria-label={t("nav.primary")}
          className="hidden items-center gap-10 lg:flex"
        >
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              data-testid={`nav-${item.key}`}
              className="hover:text-lavender text-base text-white transition"
            >
              {t(item.label)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          {!env.noTranslations && (
            <select
              className="border-indigo-deep bg-ink-deep rounded-selector text-mist focus-visible:outline-lavender border px-3 py-1.5 text-sm focus-visible:outline-2"
              value={i18n.language}
              onChange={(e) =>
                changeLanguage(e.target.value as SupportedLanguage)
              }
              aria-label={t("nav.language")}
              data-testid="language-switcher"
            >
              {SUPPORTED_LANGUAGES.map((lng) => (
                <option key={lng} value={lng}>
                  {lng.toUpperCase()}
                </option>
              ))}
            </select>
          )}

          <a
            href={site.loginUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="header-login"
            className="hover:text-lavender text-base text-white transition"
          >
            {t("nav.login")}
          </a>

          <BrandButton
            href={site.bookDemoUrl}
            variant="sweep"
            size="sm"
            data-testid="header-book-demo"
          >
            {t("nav.bookDemo")}
          </BrandButton>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          data-testid="mobile-menu-toggle"
          className="border-indigo-deep rounded-selector text-mist border p-2 lg:hidden"
        >
          {menuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-menu"
        data-testid="mobile-menu"
        className={clsx(
          "border-indigo-deep/60 bg-ink-deep border-t lg:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav
          aria-label={t("nav.primary")}
          className="flex flex-col gap-1 px-6 py-4"
        >
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              data-testid={`mobile-nav-${item.key}`}
              className="text-mist hover:bg-indigo-deep/40 rounded-lg px-3 py-2 transition"
            >
              {t(item.label)}
            </a>
          ))}

          <a
            href={site.loginUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="mobile-login"
            className="text-mist hover:bg-indigo-deep/40 rounded-lg px-3 py-2 transition"
          >
            {t("nav.login")}
          </a>

          <div className="mt-2 flex items-center gap-3 px-3">
            <BrandButton
              href={site.bookDemoUrl}
              variant="sweep"
              size="sm"
              data-testid="mobile-book-demo"
            >
              {t("nav.bookDemo")}
            </BrandButton>

            {!env.noTranslations && (
              <select
                className="border-indigo-deep bg-ink-deep rounded-selector text-mist border px-3 py-1.5 text-sm"
                value={i18n.language}
                onChange={(e) =>
                  changeLanguage(e.target.value as SupportedLanguage)
                }
                aria-label={t("nav.language")}
                data-testid="mobile-language-switcher"
              >
                {SUPPORTED_LANGUAGES.map((lng) => (
                  <option key={lng} value={lng}>
                    {lng.toUpperCase()}
                  </option>
                ))}
              </select>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
