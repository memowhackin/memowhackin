import {
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { validate } from "@/components/scanner/validate";
import type { ScanKind } from "@/config/scanner";

/*
 * The scanner's input, and the centrepiece of the landing state.
 *
 * Built as a labelled form rather than the usual single-field bar: the thing
 * being asked for is a domain or a personal address, and a control that looks
 * like a newsletter signup gets treated like one. Labels stay visible for the
 * same reason — a placeholder disappears the moment someone starts typing,
 * which is exactly when they want to check what was being asked.
 *
 * The mode switch is a tablist rather than two buttons or a select, because
 * that is what it is: two panels, one visible. Implementing the ARIA pattern
 * properly means arrow keys move between tabs and Tab moves into the field,
 * which is what a keyboard user expects and what a pair of styled buttons
 * silently fails to do.
 */

interface ScannerPanelProps {
  onSubmit: (input: {
    kind: ScanKind;
    subject: string;
    marketingConsent: boolean;
  }) => void;
  /** True while a request is in flight; blocks duplicate submissions. */
  busy: boolean;
  /** A server-side error already translated to a message, if any. */
  error?: string;
  /** False when no provider is configured, which disables the form. */
  available: boolean;
}

const MODES: readonly ScanKind[] = ["website", "email"];

export function ScannerPanel({
  onSubmit,
  busy,
  error,
  available,
}: ScannerPanelProps) {
  const { t } = useTranslation();
  const baseId = useId();

  const [mode, setMode] = useState<ScanKind>("website");
  /*
   * One value per mode, never shared. Typing a domain and switching to the
   * email tab must not carry the domain across: it would be submitted as an
   * address, fail validation, and read as the form losing track of itself.
   */
  const [values, setValues] = useState<Record<ScanKind, string>>({
    website: "",
    email: "",
  });
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Partial<Record<ScanKind, HTMLButtonElement | null>>>(
    {},
  );

  const value = values[mode];
  const result = validate(mode, value);
  // Held back until submit or blur, so the field does not scold someone for a
  // half-typed address they are still typing.
  const showError = touched && !result.ok;
  const messageId = `${baseId}-message`;
  const errorId = `${baseId}-error`;

  function selectMode(next: ScanKind) {
    setMode(next);
    setTouched(false);
    // Focus follows the selection, so the keyboard lands in the field that
    // just appeared rather than back at the top of the page.
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const index = MODES.indexOf(mode);
    let next: ScanKind | undefined;

    switch (event.key) {
      case "ArrowRight":
        next = MODES[(index + 1) % MODES.length];
        break;
      case "ArrowLeft":
        next = MODES[(index - 1 + MODES.length) % MODES.length];
        break;
      case "Home":
        next = MODES[0];
        break;
      case "End":
        next = MODES[MODES.length - 1];
        break;
      default:
        return;
    }

    if (next === undefined) return;
    event.preventDefault();
    setMode(next);
    setTouched(false);
    tabRefs.current[next]?.focus();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (busy || !available) return;
    if (!result.ok) {
      inputRef.current?.focus();
      return;
    }

    onSubmit({ kind: mode, subject: value.trim(), marketingConsent: consent });
  }

  return (
    /*
     * No panel. The field is the page here: an outer bordered box around a
     * bordered tab group around a bordered input was three surfaces deep for
     * one question, and it made the most important control on the site look
     * like a widget embedded in it.
     */
    <div data-testid="scanner-panel" className="flex flex-col gap-8">
      <div
        role="tablist"
        aria-label={t("scanner.modeLabel")}
        data-testid="scanner-tabs"
        className="border-indigo-deep/60 flex w-full max-w-md border-b"
      >
        {MODES.map((entry, index) => {
          const selected = entry === mode;
          return (
            <button
              key={entry}
              ref={(node) => {
                tabRefs.current[entry] = node;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${entry}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${entry}`}
              // Roving tabindex: one stop for the whole group, arrows move
              // within it. Two tab stops here would be the wrong pattern.
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                selectMode(entry);
              }}
              onKeyDown={onTabKeyDown}
              data-testid={`scanner-tab-${entry}`}
              className={clsx(
                "pointer-coarse:min-h-11 focus-visible:outline-lavender relative -mb-px px-1 pb-3 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-4",
                // The indicator is a border on the control itself rather than
                // a filled shape behind it, so the row reads as a set of
                // words with one of them current.
                selected
                  ? "border-lavender text-mist border-b-2 font-medium"
                  : "text-mist/50 hover:text-mist/80 border-b-2 border-transparent",
                index === 0 ? "mr-7" : "",
              )}
            >
              {t(`scanner.tabs.${entry}`)}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        data-testid="scanner-form"
        role="tabpanel"
        id={`${baseId}-panel-${mode}`}
        aria-labelledby={`${baseId}-tab-${mode}`}
        className="mt-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-3">
          <label htmlFor={`${baseId}-input`} className="text-mist/50 text-sm">
            {t(`scanner.fields.${mode}.label`)}
          </label>

          <input
            ref={inputRef}
            id={`${baseId}-input`}
            // `url` would summon a keyboard with a slash key and trigger the
            // browser's own URL validation, which disagrees with ours.
            type={mode === "email" ? "email" : "text"}
            inputMode={mode === "email" ? "email" : "url"}
            autoComplete={mode === "email" ? "email" : "off"}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            disabled={!available}
            value={value}
            onChange={(event) => {
              setValues((current) => ({
                ...current,
                [mode]: event.target.value,
              }));
            }}
            onBlur={() => {
              if (value.trim().length > 0) setTouched(true);
            }}
            placeholder={t(`scanner.fields.${mode}.placeholder`)}
            aria-invalid={showError}
            aria-describedby={
              clsx(showError && errorId, messageId) || undefined
            }
            data-testid="scanner-input"
            /*
             * Underlined rather than boxed, and set at the size of a heading.
             * The thing being asked for is a domain or a personal address, and
             * a small field in a filled rectangle is the shape of a newsletter
             * signup. The rule thickens and lights on focus, which is a
             * clearer focus signal than a ring on a box already outlined.
             */
            className={clsx(
              "text-mist placeholder:text-mist/25 font-display w-full border-b bg-transparent pb-3 text-xl outline-none transition-colors disabled:opacity-50 sm:text-2xl",
              showError
                ? "border-ember focus:border-ember"
                : "border-indigo-deep focus:border-lavender",
            )}
          />

          {showError && (
            <p
              id={errorId}
              data-testid="scanner-field-error"
              className="text-ember text-sm"
            >
              {t(`scanner.errors.${result.error}`)}
            </p>
          )}
        </div>

        {/*
          Marketing permission is a separate, unchecked box, and only on the
          email tab where a message is actually sent. Bundling it into the
          submit would make requesting a report an act of consent to something
          else, which is the pattern this is deliberately not.
        */}
        {mode === "email" && (
          <label className="text-mist/70 flex items-start gap-2.5 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
              }}
              data-testid="scanner-marketing-consent"
              className="accent-lavender mt-0.5 size-4 shrink-0"
            />
            {t("scanner.marketingConsent")}
          </label>
        )}

        <button
          type="submit"
          disabled={busy || !available}
          data-testid="scanner-submit"
          className={brandButtonClass({
            className: "w-full justify-center disabled:opacity-60 sm:w-fit",
          })}
        >
          {busy ? t("scanner.submitting") : t(`scanner.fields.${mode}.action`)}
        </button>

        <p
          id={messageId}
          data-testid="scanner-privacy-note"
          className="text-mist/55 max-w-prose text-sm leading-relaxed text-pretty"
        >
          {t(`scanner.privacy.${mode}`)}
        </p>

        {/*
          Server-side failures are announced rather than only shown: submitting
          moves nothing on screen for a keyboard or screen-reader user, so an
          error that only appears visually is an error they never learn about.
        */}
        {error !== undefined && (
          <p
            role="alert"
            data-testid="scanner-error"
            className="text-ember max-w-prose text-sm leading-relaxed"
          >
            {error}
          </p>
        )}

        {!available && (
          <p
            data-testid="scanner-unavailable"
            className="text-mist/60 max-w-prose text-sm leading-relaxed"
          >
            {t("scanner.unavailable")}
          </p>
        )}
      </form>
    </div>
  );
}
