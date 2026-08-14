import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder: string;
  invalid?: boolean;
  "data-testid": string;
}

/**
 * A form select that wears the site's own field dress and opens into a listbox
 * painted in the brand palette, rather than a native `<select>` whose dropdown
 * arrives in the OS's white chrome on this dark page. The trigger is styled to
 * match the text inputs beside it exactly; the list is a themed panel.
 *
 * It behaves like a listbox — arrow keys rove the options, Enter/Space and click
 * commit, Escape and an outside press dismiss — and reports its value through
 * `onChange` so the form owns it.
 */
export function SelectField({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid = false,
  "data-testid": testId,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const listId = `${id}-list`;
  const selected = options.find((option) => option.value === value);

  function openList() {
    const index = options.findIndex((option) => option.value === value);
    setActiveIndex(index >= 0 ? index : 0);
    setOpen(true);
  }

  function close(focusTrigger: boolean) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function choose(next: string) {
    onChange(next);
    close(true);
  }

  // Focus follows the roving index so the keyboard lands on the current choice.
  useEffect(() => {
    if (!open) return;
    const option = listRef.current?.children.item(activeIndex);
    if (option instanceof HTMLElement) option.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        rootRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function onListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1;
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
    <div ref={rootRef} data-testid={testId} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => {
          if (open) close(false);
          else openList();
        }}
        onKeyDown={(event) => {
          if (open) return;
          if (
            event.key === "ArrowDown" ||
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openList();
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        data-testid={`${testId}-trigger`}
        className={clsx(
          "flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-base outline-none transition-colors focus-visible:ring-2",
          invalid
            ? "border-ember/70 bg-indigo-deep/40 focus-visible:border-ember focus-visible:ring-ember/30"
            : "border-lavender/25 bg-indigo-deep/40 focus-visible:border-lavender focus-visible:ring-lavender/30",
          open && !invalid && "border-lavender",
        )}
      >
        <span
          className={clsx("truncate", selected ? "text-mist" : "text-mist/35")}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={clsx(
            "text-lavender/70 size-4 shrink-0 transition-transform",
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
          aria-label={placeholder}
          onKeyDown={onListKeyDown}
          className="border-indigo-deep bg-ink-deep absolute inset-x-0 top-full z-50 mt-2 flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-lg border p-1 shadow-[0_1rem_2.5rem_-0.5rem_rgba(0,0,0,0.8)]"
        >
          {options.map((option, index) => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => {
                  choose(option.value);
                }}
                data-testid={`${testId}-${option.value}`}
                className={clsx(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm outline-none transition-colors",
                  active
                    ? "bg-indigo-deep/60 text-lavender"
                    : "text-mist/80 hover:bg-indigo-deep/40 hover:text-mist focus-visible:bg-indigo-deep/40",
                )}
              >
                <Check
                  className={clsx("size-4 shrink-0", !active && "opacity-0")}
                  aria-hidden="true"
                />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
