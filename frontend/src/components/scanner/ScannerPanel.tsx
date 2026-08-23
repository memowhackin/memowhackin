import { useId, useRef, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { validate } from "@/components/scanner/validate";

/*
 * The scanner's input, and the centrepiece of the landing state.
 *
 * One website field and a run button, sharing a single enclosure so the pair
 * reads as one control you type into and run rather than a field with a
 * detached button beside it. The mode switch is gone: the scanner does
 * websites only, so a two-tab control for one option was chrome that asked a
 * question with a single answer.
 *
 * The label stays visible above the field, because a placeholder disappears
 * the moment someone starts typing, which is exactly when they want to check
 * what was being asked.
 */

interface ScannerPanelProps {
  onSubmit: (input: { subject: string }) => void;
  /** True while a request is in flight; blocks duplicate submissions. */
  busy: boolean;
  /** A server-side error already translated to a message, if any. */
  error?: string;
  /** False when no provider is configured, which disables the form. */
  available: boolean;
}

export function ScannerPanel({
  onSubmit,
  busy,
  error,
  available,
}: ScannerPanelProps) {
  const { t } = useTranslation();
  const baseId = useId();

  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const result = validate("website", value);
  // Held back until submit or blur, so the field does not scold someone for a
  // half-typed domain they are still typing.
  const showError = touched && !result.ok;
  const errorId = `${baseId}-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (busy || !available) return;
    if (!result.ok) {
      inputRef.current?.focus();
      return;
    }

    onSubmit({ subject: value.trim() });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-testid="scanner-form"
      className="flex flex-col gap-5"
    >
      <label htmlFor={`${baseId}-input`} className="text-mist/50 text-sm">
        {t("scanner.fields.website.label")}
      </label>

      {/*
        Field and action share one enclosure. The ring lives on the wrapper and
        answers to `focus-within`, so focusing the input lights the whole
        control; the input itself carries no outline, or there would be two
        focus indicators for one focus.
      */}
      <div
        className={clsx(
          "bg-ink/70 flex flex-col gap-2 rounded-2xl p-2 ring-1 transition-colors sm:flex-row sm:items-center",
          showError
            ? "ring-ember/70"
            : "ring-mist/12 focus-within:ring-lavender/80",
        )}
      >
        <input
          ref={inputRef}
          id={`${baseId}-input`}
          // `url` type would summon a keyboard with a slash key and trigger the
          // browser's own URL validation, which disagrees with ours.
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={!available}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onBlur={() => {
            if (value.trim().length > 0) setTouched(true);
          }}
          placeholder={t("scanner.fields.website.placeholder")}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
          data-testid="scanner-input"
          // Mono, because a domain is a string meant to be read exactly.
          className="text-mist placeholder:text-mist/30 min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-base outline-none disabled:opacity-50 sm:text-lg"
        />

        <button
          type="submit"
          disabled={busy || !available}
          data-testid="scanner-submit"
          className={brandButtonClass({
            className:
              "w-full shrink-0 justify-center rounded-xl disabled:opacity-60 sm:w-fit",
          })}
        >
          {busy ? t("scanner.submitting") : t("scanner.fields.website.action")}
        </button>
      </div>

      {showError && (
        <p
          id={errorId}
          data-testid="scanner-field-error"
          className="text-ember text-sm"
        >
          {t(`scanner.errors.${result.error}`)}
        </p>
      )}

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
  );
}
