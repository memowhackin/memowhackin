import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  localizedPath,
  stripBasePath,
  SUPPORTED_LANGUAGES,
  SITE_LOCALE,
  type SupportedLanguage,
} from "@/config/locale";

interface LanguageSwitcherProps {
  className?: string;
  "data-testid": string;
}

/**
 * `resolvedLanguage` is a plain string — it can carry a region ("en-GB") or be
 * absent before init settles. Matching it against the supported tuple narrows it
 * without a cast and gives the control something to render either way.
 */
function resolveLanguage(value: string | undefined): SupportedLanguage {
  return SUPPORTED_LANGUAGES.find((lng) => lng === value) ?? "en";
}

/**
 * Language selector: a pill trigger carrying a globe and the active locale code,
 * opening a small listbox of the full language names.
 *
 * It is a listbox rather than a native `<select>` because the open list has to
 * follow the brand palette — a native one paints in OS chrome, which on this
 * dark page arrives as a white rectangle. The trigger stays code-only so it
 * costs the same width in the nav bar at every viewport.
 */
export function LanguageSwitcher({
  className,
  "data-testid": testId,
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  // Which option the keyboard is on. Focus roves within the list; the choice is
  // only committed on Enter, Space or a click, so arrowing through the options
  // does not reload the page copy under the reader.
  const [activeIndex, setActiveIndex] = useState(0);
  // The switcher sits in the header bar on desktop but at the foot of the
  // mobile panel, where there is no room underneath it — so the list flips.
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // The build's language is the truth here, not i18next's runtime state: this
  // bundle only ever renders one language.
  const current = resolveLanguage(i18n.resolvedLanguage ?? SITE_LOCALE);
  const listId = `${testId}-list`;

  function close(focusTrigger: boolean) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function openList() {
    setActiveIndex(Math.max(SUPPORTED_LANGUAGES.indexOf(current), 0));
    setOpen(true);
  }

  /*
   * Each language is its own build at its own URL, so switching navigates to
   * the same page in that language rather than re-rendering this one. A full
   * load is correct — it fetches that language's bundle — and it means the
   * address bar, the prerendered HTML and the copy on screen never disagree.
   */
  function select(lng: SupportedLanguage) {
    close(false);
    if (lng === current) return;

    const { pathname, search, hash } = window.location;
    const target = localizedPath(lng, stripBasePath(pathname));
    window.location.assign(`${target}${search}${hash}`);
  }

  /*
   * Measured before paint, so the list never shows in the wrong place for a
   * frame. Its own height is read off the element rather than assumed, so a
   * third locale needs no change here.
   */
  useLayoutEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;

    const rect = trigger.getBoundingClientRect();
    const height = list.offsetHeight;

    setDropUp(
      rect.bottom + height > window.innerHeight && rect.top - height > 0,
    );
  }, [open]);

  // Focus follows the roving index, so the keyboard lands on the current choice
  // when the list opens rather than behind the panel that just appeared.
  useEffect(() => {
    if (!open) return;

    const option = listRef.current?.children.item(activeIndex);
    if (option instanceof HTMLElement) option.focus();
  }, [open, activeIndex]);

  // A press outside dismisses it, matching every other overlay on the page.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;

      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function onListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const last = SUPPORTED_LANGUAGES.length - 1;

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => (index === last ? 0 : index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => (index === 0 ? last : index - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      className={clsx("relative inline-block", className)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) close(false);
          else openList();
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" || open) return;

          event.preventDefault();
          openList();
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${t("nav.language")}: ${t(`nav.languageNames.${current}`)}`}
        data-testid={`${testId}-trigger`}
        className={clsx(
          "rounded-selector pointer-coarse:min-h-11 inline-flex min-h-9 items-center gap-1.5 border px-3 text-xs font-medium uppercase transition-colors",
          open
            ? "border-lavender/60 bg-indigo-deep/60 text-mist"
            : "border-indigo-deep bg-ink-deep/60 text-mist/80 hover:border-lavender/60 hover:text-mist",
        )}
      >
        <Globe className="size-4 shrink-0" aria-hidden="true" />
        {current}
        <ChevronDown
          className={clsx(
            "size-3.5 shrink-0 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={t("nav.language")}
          onKeyDown={onListKeyDown}
          data-testid={`${testId}-list`}
          className={clsx(
            "border-indigo-deep bg-ink-deep rounded-box absolute end-0 z-50 flex w-max min-w-full flex-col gap-0.5 border p-1 shadow-lg",
            dropUp ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {SUPPORTED_LANGUAGES.map((lng, index) => {
            const active = lng === current;

            return (
              <button
                key={lng}
                type="button"
                role="option"
                aria-selected={active}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => {
                  select(lng);
                }}
                data-testid={`${testId}-${lng}`}
                className={clsx(
                  "rounded-selector pointer-coarse:min-h-11 flex min-h-9 items-center gap-2 px-3 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "bg-indigo-deep/60 text-lavender"
                    : "text-mist/80 hover:bg-indigo-deep/40 hover:text-mist",
                )}
              >
                <Check
                  className={clsx("size-4 shrink-0", !active && "opacity-0")}
                  aria-hidden="true"
                />
                {t(`nav.languageNames.${lng}`)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
