import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";
import type { NavDropdown, NavLeaf } from "@/config/nav";

interface HeaderDropdownProps {
  dropdown: NavDropdown;
  /** Called when a destination is chosen, so the header can settle its state. */
  onNavigate?: () => void;
}

/** One destination row: title over a one-line description, with a lead icon. */
function DropdownItem({
  item,
  dropdownKey,
  onSelect,
}: {
  item: NavLeaf;
  dropdownKey: string;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      onClick={onSelect}
      data-testid={`nav-${dropdownKey}-${item.key}`}
      className="hover:bg-lavender/[0.06] group/item flex items-start gap-3 rounded-lg p-3 transition-colors"
      activeProps={{ className: "bg-lavender/[0.1]" }}
    >
      <Icon
        className="text-lavender/55 group-hover/item:text-lavender mt-px size-[1.15rem] shrink-0 transition-colors"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-mist group-hover/item:text-lavender text-sm leading-tight font-medium transition-colors">
          {t(item.labelKey)}
        </span>
        {/* 65%, not 45%. At 45 this line measured 4.0:1 against the card,
            under the 4.5:1 floor for text this size; 65 puts it at 7.3:1. */}
        <span className="text-mist/65 text-xs leading-snug">
          {t(item.descKey)}
        </span>
      </span>
    </Link>
  );
}

/**
 * A desktop nav dropdown. `list` is a single column of rows; `mega` pairs a
 * branded intro rail with a two-up grid of the same rows — the shape a real
 * product mega-menu takes, in the site's dark, lavender-edged card style.
 *
 * It opens on hover (mouse only, so a tap's synthetic hover cannot fight the
 * tap), on click, and on keyboard activation; it closes on mouse-out, Escape —
 * which returns focus to the trigger — an outside press, and focus tabbing out
 * of the group. The panel sits under a transparent `pt-2.5` bridge rather than a
 * margin gap, so the pointer never leaves the group crossing from the trigger to
 * the panel. Closed, the panel is `invisible`, which also drops its links from
 * the tab order.
 */
export function HeaderDropdown({ dropdown, onNavigate }: HeaderDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const mega = dropdown.layout === "mega";
  const items = dropdown.groups.flatMap((group) => group.items);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        containerRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen(true);
        }}
        data-testid={`nav-${dropdown.key}`}
        className={clsx(
          "pointer-coarse:min-h-11 xl:text-base inline-flex items-center gap-1 py-2 text-sm whitespace-nowrap transition-colors",
          open ? "text-lavender" : "hover:text-lavender text-white",
        )}
      >
        {t(dropdown.labelKey)}
        <ChevronDown
          className={clsx("size-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      <div
        id={menuId}
        aria-label={t(dropdown.labelKey)}
        className={clsx(
          // Transparent bridge keeps the pointer inside the group between the
          // trigger and the card.
          //
          // The three properties are listed by hand because `visibility` is
          // the one that matters and Tailwind's stock `transition` leaves it
          // out. Without it `invisible` lands on the first frame of the close
          // and the 200ms fade below never shows; in the list, visibility
          // holds `visible` until the fade has finished and only then hides.
          "absolute top-full left-0 z-50 pt-2.5 transition-[opacity,translate,visibility] duration-200 ease-out motion-reduce:transition-none",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div
          className={clsx(
            "border-indigo-deep bg-ink-deep/95 rounded-2xl border shadow-[0_1.75rem_3.5rem_-1rem_rgba(0,0,0,0.85)] backdrop-blur-md",
            mega
              ? "flex w-[34rem] max-w-[calc(100vw-2rem)] gap-2 p-2 xl:w-[42rem]"
              : "w-[19rem] p-2",
          )}
        >
          {mega && (
            /*
             * The product's own panel, set apart from the list of pages beside
             * it: a dashed lavender edge rather than the solid indigo the rest
             * of the card uses, so it reads as a plate laid on the menu rather
             * than another cell of it. The dashes are the footer's, which is
             * where this site already spells a soft boundary.
             */
            <div className="border-lavender/25 relative flex w-48 shrink-0 flex-col overflow-hidden rounded-xl border border-dashed p-5">
              <div className="flex flex-col gap-3.5">
                <span className="border-lavender/30 bg-lavender/10 grid size-10 place-items-center rounded-lg border">
                  <LogoMark className="text-lavender w-5" />
                </span>

                {/* The product name in the spacing the ARGUS pages give it:
                    display face, wide tracking, upper case. */}
                <p className="font-display text-mist text-sm font-light tracking-[0.4em] uppercase">
                  {t(dropdown.labelKey)}
                </p>

                {/* Set at the weight the menu items beside it use rather than
                    the muted one a caption would take: this is the sentence
                    that says what the product is, and it was the dimmest text
                    in the card. */}
                {dropdown.taglineKey && (
                  <p className="text-mist/85 text-sm leading-relaxed text-pretty">
                    {t(dropdown.taglineKey)}
                  </p>
                )}
              </div>

              {/*
                A run of the brand's diamond, fading out along the foot. The
                mark the whole site is drawn from, used as an ornament rather
                than a stock icon: it closes the plate without adding a second
                thing to read.
              */}
              <span
                aria-hidden="true"
                className="mt-auto flex items-center gap-1.5 pt-5"
              >
                {[1, 0.7, 0.45, 0.25, 0.12].map((strength) => (
                  <span
                    key={strength}
                    className="bg-lavender size-1.5 rotate-45 rounded-xs"
                    style={{ opacity: strength }}
                  />
                ))}
              </span>
            </div>
          )}

          <div
            className={clsx(
              "min-w-0 flex-1",
              mega
                ? "grid grid-cols-2 content-start gap-0.5"
                : "flex flex-col gap-0.5",
            )}
          >
            {items.map((item) => (
              <DropdownItem
                key={item.key}
                item={item}
                dropdownKey={dropdown.key}
                onSelect={close}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
