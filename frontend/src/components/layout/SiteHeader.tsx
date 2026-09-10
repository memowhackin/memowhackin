import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { LogoLockup } from "@/components/common/Logo";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { HeaderDropdown } from "@/components/layout/HeaderDropdown";
import { NAV_ITEMS, type NavExternal, type NavRoute } from "@/config/nav";
import { env } from "@/config/env";
import { site } from "@/config/site";

/** Only "/" is matched exactly; every other route stays active on its children. */
function activeOptionsFor(to: string) {
  return to === "/" ? { exact: true } : undefined;
}

/*
 * A plain nav entry — one that is not a dropdown — in either bar.
 *
 * Split out of the two `NAV_ITEMS.map` calls below because a router link and an
 * outbound one differ by more than an attribute: only the router link has
 * active styling, and only it can take a typed `to`. Deciding that inside the
 * map would mean a second ternary nested in the first.
 */
const desktopNavLinkClass =
  "decoration-lavender relative inline-flex items-center py-2 text-sm whitespace-nowrap underline-offset-8 transition-colors hover:underline xl:text-base pointer-coarse:min-h-11";

function DesktopNavLink({ item }: { item: NavRoute | NavExternal }) {
  const { t } = useTranslation();

  /*
   * Same tab, deliberately, even though the login link below opens a new one.
   * The knowledge base is our own site rather than a separate application, so
   * following it is a navigation like any other in this bar — a new tab there
   * reads as the site losing track of where you were.
   */
  if (item.kind === "external") {
    return (
      <a
        href={item.href}
        data-testid={`nav-${item.key}`}
        className={clsx(desktopNavLinkClass, "hover:text-lavender text-white")}
      >
        {t(item.labelKey)}
      </a>
    );
  }

  return (
    <Link
      to={item.to}
      activeOptions={activeOptionsFor(item.to)}
      data-testid={`nav-${item.key}`}
      className={desktopNavLinkClass}
      activeProps={{ className: "text-lavender" }}
      inactiveProps={{ className: "hover:text-lavender text-white" }}
    >
      {t(item.labelKey)}
    </Link>
  );
}

const mobileNavLinkClass =
  "hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center rounded-lg px-3 py-2.5 transition-colors";

function MobileNavLink({
  item,
  onNavigate,
}: {
  item: NavRoute | NavExternal;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();

  if (item.kind === "external") {
    return (
      <a
        href={item.href}
        onClick={onNavigate}
        data-testid={`mobile-nav-${item.key}`}
        className={clsx(mobileNavLinkClass, "text-mist")}
      >
        {t(item.labelKey)}
      </a>
    );
  }

  return (
    <Link
      to={item.to}
      activeOptions={activeOptionsFor(item.to)}
      onClick={onNavigate}
      data-testid={`mobile-nav-${item.key}`}
      className={mobileNavLinkClass}
      activeProps={{ className: "bg-indigo-deep/30 text-lavender" }}
      inactiveProps={{ className: "text-mist" }}
    >
      {t(item.labelKey)}
    </Link>
  );
}

export function SiteHeader() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  /** Which nav group is expanded in the mobile panel; one at a time. */
  const [openGroup, setOpenGroup] = useState<string | null>(null);
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
    // Reopening starts from the short menu rather than wherever it was left.
    setOpenGroup(null);
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
      setOpenGroup(null);
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
   * The nav appears at lg (64rem) and is deliberately tighter there — smaller
   * type, narrower gaps, less bar padding — because at full spacing the seven
   * items plus the switcher, login and demo button measure about 73rem and can
   * only "fit" a 64rem viewport by shrinking under their own text and painting
   * over each other. The compact tier buys the room honestly; from xl it
   * relaxes back to the roomy version.
   */
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
        /*
         * The backdrop blur is transitioned alongside the background colour.
         * On `transition-colors` alone the ground faded in over 200ms while
         * the blur switched on in one frame at the 8px mark, which read as a
         * flicker at the top of every scroll. Both vendor spellings, because
         * Safari still transitions the prefixed property.
         */
        "sticky top-0 z-50 w-full transition-[background-color,-webkit-backdrop-filter,backdrop-filter] duration-200",
        scrolled || menuOpen
          ? "bg-ink-deep/80 backdrop-blur-sm"
          : "bg-transparent",
      )}
    >
      <div ref={barRef}>
        {/* Announcement strip — the gradient bar across the top of the frame. */}
        {/*
          A router `Link` to the scanner on this site, not an `<a href>` to the
          scanner app. Two things follow from that, and both are the point:

          The language comes out right on its own. Every `Link` is written
          without a language prefix and the router adds the one this build was
          compiled for (see `basepath` in `main.tsx`), so the Dutch build sends
          the reader to `/nl/security-scan` and the English build to
          `/security-scan`. Writing the path by hand here, or reaching for
          `window.location`, is what would strand a Dutch visitor on the English
          page.

          And it stays in the tab. The strip used to open the external scanner
          app in a second window; the exposure check now lives on this site, and
          a page of this site opening in a new tab is not a thing the site does.
        */}
        <Link
          to="/security-scan"
          data-testid="announcement-bar"
          onClick={closeMenu}
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
        </Link>

        <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-10 sm:py-4 lg:gap-5 lg:px-5 xl:gap-6 xl:px-10 2xl:px-6">
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
            className="hidden items-center gap-3 lg:flex xl:gap-5 2xl:gap-7"
          >
            {NAV_ITEMS.map((item) =>
              item.kind === "dropdown" ? (
                <HeaderDropdown key={item.key} dropdown={item} />
              ) : (
                <DesktopNavLink key={item.key} item={item} />
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-2.5 xl:gap-5">
            {!env.noTranslations && (
              <div
                className={clsx(
                  "hidden lg:block",
                  // Globe alone until there is room for the code beside it.
                  "[&_[data-language-label]]:hidden",
                  "xl:[&_[data-language-label]]:inline",
                )}
              >
                <LanguageSwitcher data-testid="language-switcher" />
              </div>
            )}

            <a
              href={site.loginUrl}
              target="_blank"
              rel="noreferrer noopener"
              data-testid="header-login"
              className="hover:text-lavender hidden items-center text-sm whitespace-nowrap text-white transition-colors lg:inline-flex xl:text-base pointer-coarse:min-h-11"
            >
              {t("nav.login")}
            </a>

            <div className="hidden sm:block">
              {/*
                A router link rather than `BrandButton`: booking a demo is a
                page of this site now, and an internal destination has to go
                through the router or the Dutch build walks out of its own
                `/nl` prefix. The look comes from the shared class list.

                `text-nowrap`, not `whitespace-nowrap`: the button's base
                classes set `text-balance`, and both are `text-wrap`
                longhands — an inherited white-space rule loses to it, so the
                label broke across two lines once the bar got tight.
              */}
              <Link
                to="/demo"
                data-testid="header-book-demo"
                className={brandButtonClass({
                  variant: "sweep",
                  size: "sm",
                  className: "text-nowrap",
                })}
              >
                {t("nav.bookDemo")}
              </Link>
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
              className="border-indigo-deep rounded-selector text-mist hover:border-lavender/60 hover:text-lavender active:bg-indigo-deep/60 inline-flex size-11 shrink-0 items-center justify-center border transition-colors lg:hidden"
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
          {NAV_ITEMS.map((item) =>
            item.kind !== "dropdown" ? (
              <MobileNavLink
                key={item.key}
                item={item}
                onNavigate={closeMenu}
              />
            ) : (
              /*
                Expandable, rather than every leaf listed at once. Spelled out
                in full the panel ran 745px on an 844px phone — thirteen rows,
                with the demo button and the language control below the fold, so
                the primary action needed a scroll to reach. Collapsed, the menu
                fits on the smallest screen we support.
              */
              <div key={item.key} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => {
                    setOpenGroup((current) =>
                      current === item.key ? null : item.key,
                    );
                  }}
                  aria-expanded={openGroup === item.key}
                  aria-controls={`mobile-group-${item.key}`}
                  data-testid={`mobile-nav-${item.key}`}
                  className={clsx(
                    "hover:bg-indigo-deep/40 hover:text-lavender active:bg-indigo-deep/60 flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    openGroup === item.key ? "text-lavender" : "text-mist",
                  )}
                >
                  {t(item.labelKey)}
                  <ChevronDown
                    className={clsx(
                      "size-4 shrink-0 transition-transform duration-200",
                      openGroup === item.key && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>

                {/*
                  Animated by grid rows for the same reason the panel itself is:
                  no measured height that can disagree with the content.
                */}
                <div
                  id={`mobile-group-${item.key}`}
                  inert={openGroup !== item.key}
                  className={clsx(
                    "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
                    openGroup === item.key
                      ? "grid-rows-[minmax(0,1fr)]"
                      : "grid-rows-[minmax(0,0fr)]",
                  )}
                >
                  <div className="border-indigo-deep/60 ml-6 flex min-h-0 flex-col border-l pl-2">
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
                            inactiveProps={{ className: "text-mist/85" }}
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
                </div>
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
              <Link
                to="/demo"
                onClick={closeMenu}
                data-testid="mobile-book-demo"
                className={brandButtonClass({ variant: "sweep", size: "sm" })}
              >
                {t("nav.bookDemo")}
              </Link>
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
