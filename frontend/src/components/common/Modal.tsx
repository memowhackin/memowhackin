import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog, for `aria-labelledby`. */
  labelledBy: string;
  /** Accessible label for the close button. */
  closeLabel: string;
  children: ReactNode;
  "data-testid"?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * How long the panel takes to leave, matching its `duration-300`. The exit is
 * ended by the panel's own `transitionend`; this only backs that up.
 */
const EXIT_MS = 300;

/**
 * A centred dialog over a frosted backdrop, portalled to `document.body` so it
 * escapes the section stacking contexts and the header's own layer.
 *
 * It does the things a modal has to do to be usable rather than just look like
 * one: the page behind it stops scrolling while it is up, Escape and a click on
 * the backdrop close it, focus moves into the panel on open and is trapped
 * there, and the element that opened it gets focus back on close. Both the
 * backdrop and the panel ease in and out; reduced-motion readers get the end
 * state at once.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  closeLabel,
  children,
  "data-testid": testId,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  /*
   * True from the moment the dialog is asked to close until its exit has
   * played. Rendering nothing the instant `open` fell was why the exit
   * transition below never once ran: the panel and its frosted backdrop
   * simply vanished. The dialog now stays in the tree, inert, until the
   * panel's opacity has finished going.
   */
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const enter = requestAnimationFrame(() => {
      setShown(true);

      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Keep Tab and Shift+Tab from leaving the panel by wrapping at the ends.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(enter);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      setShown(false);
      setLeaving(true);
      opener?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!leaving) return;

    const panel = panelRef.current;
    const settle = () => {
      setLeaving(false);
    };

    /*
     * The exit ends when the panel's opacity does. A timer backs the event up:
     * under reduced motion the transition is switched off and never ends, and
     * a dialog that has already snapped away should not linger in the tree.
     */
    const fallback = window.setTimeout(settle, EXIT_MS + 50);
    function onTransitionEnd(event: TransitionEvent) {
      if (event.target !== panel || event.propertyName !== "opacity") return;

      settle();
    }

    panel?.addEventListener("transitionend", onTransitionEnd);
    return () => {
      window.clearTimeout(fallback);
      panel?.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [leaving]);

  /*
   * `shown` is in the condition for the one render between the close and the
   * cleanup that reacts to it: `open` has already fallen there, `leaving` is
   * not yet set, and without it the dialog unmounts on that render and then
   * remounts for its exit, which is a flash rather than a fade.
   */
  if (!open && !shown && !leaving) return null;

  return createPortal(
    <div
      className={clsx(
        "bg-ink-deep/70 fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none sm:p-6",
        shown ? "opacity-100" : "opacity-0",
      )}
      // Out of the page while it leaves: nothing in a dialog on its way out
      // should take a click or a Tab stop.
      inert={!open}
      // A press that starts on the backdrop itself dismisses; one that starts
      // inside the panel and drags out does not.
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-testid={testId}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={clsx(
          "border-indigo-deep bg-ink-deep relative my-auto w-full max-w-md overflow-hidden rounded-2xl border shadow-[0_2rem_5rem_-1rem_rgba(0,0,0,0.8)] transition duration-300 ease-out motion-reduce:transition-none",
          shown
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          data-testid="modal-close"
          className="text-mist hover:text-lavender absolute top-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        {children}
      </div>
    </div>,
    document.body,
  );
}
