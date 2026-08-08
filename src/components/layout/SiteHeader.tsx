import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoLockup } from "@/components/common/Logo";
import { BrandButton } from "@/components/common/BrandButton";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { env } from "@/config/env";
import { sectionIds, site } from "@/config/site";

const navItems = [
  { key: "services", target: sectionIds.services, label: "nav.services" },
  { key: "aboutUs", target: sectionIds.about, label: "nav.aboutUs" },
  {
    key: "demonstrate",
    target: sectionIds.demonstrate,
    label: "nav.demonstrate",
  },
  { key: "blog", target: sectionIds.blog, label: "nav.blog" },
] as const;

/**
 * Which landing section is currently under the header, so the matching nav item
 * can be marked. The page is one long document with four anchors, so without
 * this the nav gives no feedback at all about where the reader is.
 */
function useActiveSection(): string | undefined {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const targets = navItems
      .map((item) => document.getElementById(item.target))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }

        // Sections overlap in the viewport while scrolling; the first one in
        // document order that is still on screen is the one being read.
        const current = navItems.find((item) => visible.has(item.target));
        setActive(current?.target);
      },
      // Ignore the band hidden behind the sticky bar, and only count a section
      // once a meaningful slice of it is on screen.
      { rootMargin: "-20% 0px -55% 0px" },
    );

    for (const target of targets) observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);

  return active;
}

export function SiteHeader() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Read during the initial state, as `useMediaQuery` does, so a reload part-way
  // down the page draws the header solid on its first paint.
  const [scrolled, setScrolled] = useState(
    () => typeof window !== "undefined" && window.scrollY > 8,
  );
  const barRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const activeSection = useActiveSection();

  /*
   * The header is sticky, so anchor targets have to clear it. Its height is not
   * a constant — the announcement copy wraps, the nav row grows with the type
   * scale — so it is measured and published as `--header-height`, which the
   * stylesheet turns into `scroll-margin-top`. Only the announcement strip and
   * the nav row are measured: the open mobile menu must not push anchors down.
   */
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height;
      if (height === undefined) return;

      document.documentElement.style.setProperty(
        "--header-height",
        `${(height / 16).toString()}rem`,
      );
    });

    observer.observe(bar);
    return () => {
      observer.disconnect();
    };
  }, []);

  /*
   * Escape closes the menu and a press outside it dismisses it, matching the
   * expectation set by every other dismissible overlay. Escape also hands focus
   * back to the button that opened the panel, which is otherwise lost to the
   * collapsed panel. Both are only bound while the menu is actually open.
   */
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setMenuOpen(false);
      toggleRef.current?.focus();
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && headerRef.current?.contains(target)) return;

      setMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  // A viewport that grows past the mobile breakpoint reveals the full nav; the
  // panel left open underneath it would then duplicate every link.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 64rem)");

    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false);
    }

    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
    };
  }, []);

  /*
   * The frame draws the nav on the hero banner, not on a bar of its own: the
   * announcement strip and the nav row sit inside the banner frame, over the
   * light. A ground of its own here was cutting the top off the backdrop.
   *
   * It only earns one once it has left the hero, where it would otherwise be
   * reading over live copy — hence the scrolled flag rather than dropping the
   * background outright. The open mobile panel counts as scrolled: the panel
   * itself is opaque and a transparent row above it would look detached.
   */
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={clsx(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled || menuOpen
          ? "bg-ink-deep/80 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div ref={barRef}>
        {/* Announcement strip — the gradient bar across the top of the frame. */}
        <a
          href={site.scannerBaseUrl}
          target="_blank"
          rel="noreferrer noopener"
          data-testid="announcement-bar"
          className="brand-sweep flex w-full items-center justify-center gap-2 px-4 py-2 text-center transition hover:brightness-110 pointer-coarse:min-h-11"
        >
          {/*
            The badge is the first thing to go on a narrow viewport: the sentence
            carries the message, and keeping both forced the copy into a
            mid-word ellipsis.
          */}
          <span className="bg-lavender text-ink-deep rounded-selector hidden shrink-0 px-3 py-0.5 text-xs font-semibold sm:inline">
            {t("announcement.badge")}
          </span>
          <span className="min-w-0 text-xs tracking-[0.02em] text-balance text-white sm:truncate sm:text-sm">
            {t("announcement.text")}
          </span>
          <ArrowRight
            className="size-4 shrink-0 text-white"
            aria-hidden="true"
          />
        </a>

        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-10 sm:py-4 lg:px-16 2xl:px-0">
          <a
            href="#top"
            data-testid="header-logo"
            aria-label={t("app.title")}
            className="inline-flex shrink-0 items-center py-2 pointer-coarse:min-h-11"
          >
            <LogoLockup className="text-mist h-5 w-auto sm:h-6" />
          </a>

          <nav
            aria-label={t("nav.primary")}
            className="hidden min-w-0 items-center gap-6 lg:flex xl:gap-10"
          >
            {navItems.map((item) => {
              const current = activeSection === item.target;

              return (
                <a
                  key={item.key}
                  href={`#${item.target}`}
                  aria-current={current ? "true" : undefined}
                  data-testid={`nav-${item.key}`}
                  className={clsx(
                    "decoration-lavender pointer-coarse:min-h-11 relative inline-flex items-center py-2 text-base underline-offset-8 transition hover:underline",
                    current
                      ? "text-lavender"
                      : "hover:text-lavender text-white",
                  )}
                >
                  {t(item.label)}
                </a>
              );
            })}
          </nav>

          <div className="flex min-w-0 items-center gap-2 sm:gap-4 lg:gap-6">
            {!env.noTranslations && (
              // Wrapped rather than hidden through the switcher's own class
              // list: Tailwind emits `hidden` before the display utilities the
              // component sets on itself, so it would lose the cascade.
              <div className="hidden lg:block">
                <LanguageSwitcher data-testid="language-switcher" />
              </div>
            )}

            <a
              href={site.loginUrl}
              target="_blank"
              rel="noreferrer noopener"
              data-testid="header-login"
              className="hover:text-lavender hidden items-center text-base whitespace-nowrap text-white transition lg:inline-flex pointer-coarse:min-h-11"
            >
              {t("nav.login")}
            </a>

            {/*
              The primary action stays reachable from tablet up rather than
              hiding behind the menu button — at that width the bar is mostly
              empty anyway. Below it the bar has only room for the logo and the
              menu button, so the action moves into the panel.
            */}
            <div className="hidden sm:block">
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
              ref={toggleRef}
              type="button"
              onClick={() => {
                setMenuOpen((open) => !open);
              }}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              data-testid="mobile-menu-toggle"
              className="border-indigo-deep rounded-selector text-mist hover:border-lavender/60 hover:text-lavender active:bg-indigo-deep/60 inline-flex size-11 shrink-0 items-center justify-center border transition lg:hidden"
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/*
        The panel expands rather than appearing: a single grid row animated
        between zero and one `fr`, which needs no measured height and so cannot
        disagree with the content it is holding.

        Both tracks are wrapped in `minmax(0, …)`. A bare `0fr` track still takes
        an automatic minimum of min-content, so the collapsed panel kept the full
        height of the menu inside it and never actually closed.

        `inert` is what takes the collapsed panel out of the page: a clipped
        zero-height row still hands every link inside it to the Tab order.
      */}
      <div
        id="mobile-menu"
        data-testid="mobile-menu"
        inert={!menuOpen}
        className={clsx(
          "bg-ink-deep grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out lg:hidden",
          menuOpen
            ? "border-indigo-deep/60 grid-rows-[minmax(0,1fr)] border-t"
            : "grid-rows-[minmax(0,0fr)]",
        )}
      >
        <nav
          aria-label={t("nav.primary")}
          className="flex max-h-[calc(100dvh-var(--header-height))] min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-10"
        >
          {navItems.map((item) => {
            const current = activeSection === item.target;

            return (
              <a
                key={item.key}
                href={`#${item.target}`}
                aria-current={current ? "true" : undefined}
                onClick={() => {
                  setMenuOpen(false);
                }}
                data-testid={`mobile-nav-${item.key}`}
                className={clsx(
                  "hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center rounded-lg px-3 py-2.5 transition",
                  current ? "bg-indigo-deep/30 text-lavender" : "text-mist",
                )}
              >
                {t(item.label)}
              </a>
            );
          })}

          <a
            href={site.loginUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="mobile-login"
            className="text-mist hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center rounded-lg px-3 py-2.5 transition"
          >
            {t("nav.login")}
          </a>

          <div className="border-indigo-deep/60 mt-3 flex flex-wrap items-center justify-between gap-4 border-t px-3 pt-4 pb-2">
            {/* Duplicated from the bar above so the action is in reach once the
                menu covers it; hidden from `sm` up, where the bar shows it. */}
            <div className="sm:hidden">
              <BrandButton
                href={site.bookDemoUrl}
                variant="sweep"
                size="sm"
                data-testid="mobile-book-demo"
              >
                {t("nav.bookDemo")}
              </BrandButton>
            </div>

            {!env.noTranslations && (
              <LanguageSwitcher data-testid="mobile-language-switcher" />
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
