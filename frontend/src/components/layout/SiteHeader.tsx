import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ArrowRight, Menu, X } from "lucide-react";
import { LogoLockup } from "@/components/common/Logo";
import { BrandButton } from "@/components/common/BrandButton";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { HeaderDropdown } from "@/components/layout/HeaderDropdown";
import { NAV_ITEMS } from "@/config/nav";
import { env } from "@/config/env";
import { site } from "@/config/site";

/** Only "/" is matched exactly; every other route stays active on its children. */
function activeOptionsFor(to: string) {
  return to === "/" ? { exact: true } : undefined;
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

  const closeMenu = () => {
    setMenuOpen(false);
  };

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

  /*
   * A viewport that grows past the full-nav breakpoint reveals the whole nav;
   * the panel left open underneath it would then duplicate every link.
   *
   * The full nav needs xl (80rem), not lg: seven items plus the language
   * switcher, login and the demo button measure ~75rem, so at lg widths the
   * row could only "fit" by letting items shrink under their own text and
   * paint over each other. Below xl the burger is the honest layout.
   */
  useEffect(() => {
    const query = window.matchMedia("(min-width: 80rem)");

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
    let frame = 0;

    function onScroll() {
      if (frame !== 0) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 8);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);

      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={clsx(
        "sticky top-0 z-50 w-full transition-colors duration-200",
        scrolled || menuOpen
          ? "bg-ink-deep/80 backdrop-blur-sm"
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
          className="brand-sweep flex w-full items-center justify-center gap-2 px-4 py-2 text-center transition-[filter] hover:brightness-110 pointer-coarse:min-h-11"
        >
          <span className="bg-lavender text-ink-deep rounded-selector hidden shrink-0 px-3 py-0.5 text-xs font-semibold sm:inline">
            {t("announcement.badge")}
          </span>
          {/*
            On a phone the Dutch line wraps to two rows, and a separate arrow
            beside a two-row block floats detached at the strip's edge. Inlining
            it after the last word keeps the pair together at any wrap; from
            `sm` the text is one truncated line and the standalone arrow reads
            better against it.
          */}
          <span className="min-w-0 text-xs leading-snug tracking-[0.02em] text-balance text-white sm:truncate sm:text-sm sm:leading-normal">
            {t("announcement.text")}
            <ArrowRight
              className="ml-1.5 inline size-3.5 shrink-0 align-[-0.1875rem] sm:hidden"
              aria-hidden="true"
            />
          </span>
          <ArrowRight
            className="hidden size-4 shrink-0 text-white sm:block"
            aria-hidden="true"
          />
        </a>

        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-10 sm:py-4 xl:px-10 2xl:px-6">
          <Link
            to="/"
            data-testid="header-logo"
            aria-label={t("app.title")}
            className="inline-flex shrink-0 items-center py-2 pointer-coarse:min-h-11"
            onClick={closeMenu}
          >
            <LogoLockup className="text-mist h-5 w-auto sm:h-6" />
          </Link>

          <nav
            aria-label={t("nav.primary")}
            className="hidden items-center gap-5 xl:flex 2xl:gap-7"
          >
            {NAV_ITEMS.map((item) =>
              item.kind === "dropdown" ? (
                <HeaderDropdown key={item.key} dropdown={item} />
              ) : (
                <Link
                  key={item.key}
                  to={item.to}
                  activeOptions={activeOptionsFor(item.to)}
                  data-testid={`nav-${item.key}`}
                  className="decoration-lavender relative inline-flex items-center py-2 text-base whitespace-nowrap underline-offset-8 transition-colors hover:underline pointer-coarse:min-h-11"
                  activeProps={{ className: "text-lavender" }}
                  inactiveProps={{
                    className: "hover:text-lavender text-white",
                  }}
                >
                  {t(item.labelKey)}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 xl:gap-5">
            {!env.noTranslations && (
              <div className="hidden xl:block">
                <LanguageSwitcher data-testid="language-switcher" />
              </div>
            )}

            <a
              href={site.loginUrl}
              target="_blank"
              rel="noreferrer noopener"
              data-testid="header-login"
              className="hover:text-lavender hidden items-center text-base whitespace-nowrap text-white transition-colors xl:inline-flex pointer-coarse:min-h-11"
            >
              {t("nav.login")}
            </a>

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
              className="border-indigo-deep rounded-selector text-mist hover:border-lavender/60 hover:text-lavender active:bg-indigo-deep/60 inline-flex size-11 shrink-0 items-center justify-center border transition-colors xl:hidden"
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
        disagree with the content it is holding. `inert` takes the collapsed
        panel out of the page — a clipped zero-height row still hands every link
        inside it to the Tab order otherwise.
      */}
      <div
        id="mobile-menu"
        data-testid="mobile-menu"
        inert={!menuOpen}
        className={clsx(
          "bg-ink-deep grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out xl:hidden",
          menuOpen
            ? "border-indigo-deep/60 grid-rows-[minmax(0,1fr)] border-t"
            : "grid-rows-[minmax(0,0fr)]",
        )}
      >
        <nav
          aria-label={t("nav.primary")}
          className="flex max-h-[calc(100dvh-var(--header-height))] min-h-0 flex-col gap-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-10"
        >
          {NAV_ITEMS.map((item) =>
            item.kind === "route" ? (
              <Link
                key={item.key}
                to={item.to}
                activeOptions={activeOptionsFor(item.to)}
                onClick={closeMenu}
                data-testid={`mobile-nav-${item.key}`}
                className="hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center rounded-lg px-3 py-2.5 transition-colors"
                activeProps={{ className: "bg-indigo-deep/30 text-lavender" }}
                inactiveProps={{ className: "text-mist" }}
              >
                {t(item.labelKey)}
              </Link>
            ) : (
              <div key={item.key} className="mt-1 flex flex-col">
                <p className="eyebrow text-mist/45 px-3 pt-3 pb-1">
                  {t(item.labelKey)}
                </p>
                {item.groups
                  .flatMap((group) => group.items)
                  .map((leaf) => {
                    const Icon = leaf.icon;

                    return (
                      <Link
                        key={leaf.key}
                        to={leaf.to}
                        onClick={closeMenu}
                        data-testid={`mobile-nav-${item.key}-${leaf.key}`}
                        className="hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
                        activeProps={{
                          className: "bg-indigo-deep/30 text-lavender",
                        }}
                        inactiveProps={{ className: "text-mist" }}
                      >
                        <Icon
                          className="text-lavender size-4 shrink-0"
                          aria-hidden="true"
                        />
                        {t(leaf.labelKey)}
                      </Link>
                    );
                  })}
              </div>
            ),
          )}

          <a
            href={site.loginUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="mobile-login"
            className="text-mist hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 mt-1 flex min-h-11 items-center rounded-lg px-3 py-2.5 transition-colors"
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
