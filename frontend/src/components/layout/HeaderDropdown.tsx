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
        <span className="text-mist/45 text-xs leading-snug">
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
          "pointer-coarse:min-h-11 inline-flex items-center gap-1 py-2 text-base whitespace-nowrap transition-colors",
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
          "absolute top-full left-0 z-50 pt-2.5 transition duration-200 ease-out motion-reduce:transition-none",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div
          className={clsx(
            "border-indigo-deep bg-ink-deep/95 rounded-2xl border shadow-[0_1.75rem_3.5rem_-1rem_rgba(0,0,0,0.85)] backdrop-blur-md",
            mega
              ? "flex w-[42rem] max-w-[calc(100vw-2rem)] gap-2 p-2"
              : "w-[19rem] p-2",
          )}
        >
          {mega && (
            <div className="border-indigo-deep/70 bg-indigo-deep/25 flex w-48 shrink-0 flex-col justify-between rounded-xl border p-5">
              <div className="flex flex-col gap-3">
                <LogoMark className="text-lavender h-6 w-auto" />
                <p className="font-display text-mist text-lg leading-none font-normal">
                  {t(dropdown.labelKey)}
                </p>
                {dropdown.taglineKey && (
                  <p className="text-mist/55 text-sm leading-relaxed text-pretty">
                    {t(dropdown.taglineKey)}
                  </p>
                )}
              </div>
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
