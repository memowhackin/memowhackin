import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { changeLanguage, SUPPORTED_LANGUAGES } from "@/localization/i18n";

interface LanguageSwitcherProps {
  className?: string;
  "data-testid": string;
}

/**
 * Segmented language control. With only two locales a native `<select>` costs a
 * tap to open, renders in the OS chrome (which cannot follow the brand palette)
 * and reads as a form field on a page that has no forms — so the options are
 * laid out side by side instead, styled with the same pill vocabulary as the
 * header call-to-action.
 */
export function LanguageSwitcher({
  className,
  "data-testid": testId,
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("nav.language")}
      data-testid={testId}
      className={clsx(
        "border-indigo-deep bg-ink-deep/60 rounded-selector inline-flex items-center border p-0.5",
        className,
      )}
    >
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = i18n.resolvedLanguage === lng;

        return (
          <button
            key={lng}
            type="button"
            onClick={() => {
              changeLanguage(lng);
            }}
            aria-pressed={active}
            title={t(`nav.languageNames.${lng}`)}
            data-testid={`${testId}-${lng}`}
            className={clsx(
              "rounded-selector pointer-coarse:min-h-11 inline-flex min-h-9 min-w-11 items-center justify-center px-3 text-xs font-medium uppercase transition",
              active
                ? "bg-lavender text-ink-deep"
                : "text-mist/70 hover:text-mist hover:bg-indigo-deep/60",
            )}
          >
            {lng}
          </button>
        );
      })}
    </div>
  );
}
