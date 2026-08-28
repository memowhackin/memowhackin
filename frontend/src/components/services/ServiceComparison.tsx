import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import { useReveal } from "@/components/common/useReveal";
import type { ServiceDefinition } from "@/config/services";

/**
 * What the engagement gives you that a conventional one does not.
 *
 * A real `<table>`, not a grid of divs dressed as one: this is tabular data —
 * two values compared across seven aspects — and the markup that says so is
 * also the markup a screen reader can navigate cell by cell and a search engine
 * can read as a comparison. The row headers carry `scope`, so "Retesting" is
 * announced with every cell in its row rather than leaving the reader to count
 * columns.
 *
 * Below `sm` it scrolls sideways inside its own container rather than folding
 * into stacked blocks. Restyling table elements to `block` is what strips the
 * semantics back out in several screen readers, and losing them to save a
 * horizontal swipe is a bad trade on the one section of the page whose whole
 * job is a like-for-like comparison.
 */
export function ServiceComparison({ service }: { service: ServiceDefinition }) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();

  const key = (suffix: string) =>
    `servicePages.${service.key}.comparison.${suffix}`;

  return (
    <div ref={ref} className={clsx("flex flex-col gap-8", className)}>
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
          {t(key("title"))}
        </h2>
        <p className="text-mist/70 max-w-2xl text-base leading-relaxed text-pretty">
          {t(key("intro"))}
        </p>
      </div>

      {/* The table keeps a floor width so its columns never crush; narrower
          than that and the container takes over and scrolls. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <caption className="sr-only">{t(key("caption"))}</caption>

          <thead>
            <tr>
              <th
                scope="col"
                className="text-mist/50 w-[22%] pb-4 text-sm font-medium"
              >
                {t(key("columns.aspect"))}
              </th>

              <th
                scope="col"
                className="text-mist w-[39%] px-5 pb-4 text-base font-medium"
              >
                {/*
                  The accent over our own column: the same hairline the other
                  column gets, in the brand's lavender rather than the muted
                  indigo. That contrast is the one piece of emphasis the whole
                  table takes, so the eye lands here first without anything
                  being shouted.

                  Deliberately not the `brand-rule` utility, which is the ramp
                  the sections are divided with: it opens on `ink-deep`, so on
                  this background its first third is the page colour and the
                  accent would fade in from nothing. Same trap `brand-sweep-y`
                  documents for the buttons.
                */}
                <span
                  aria-hidden="true"
                  className="bg-lavender mb-4 block h-px"
                />
                {t(key("columns.ours"))}
              </th>

              <th
                scope="col"
                className="text-mist/50 w-[39%] px-5 pb-4 text-base font-medium"
              >
                <span
                  aria-hidden="true"
                  className="bg-indigo-deep/60 mb-4 block h-px"
                />
                {t(key("columns.theirs"))}
              </th>
            </tr>
          </thead>

          <tbody>
            {service.comparison.map((row) => (
              <tr
                key={row}
                data-testid={`service-comparison-${row}`}
                className="border-indigo-deep/60 border-t"
              >
                <th
                  scope="row"
                  className="text-mist py-5 pr-5 align-top text-base font-medium text-pretty"
                >
                  {t(key(`rows.${row}.aspect`))}
                </th>

                {/*
                  Our column carries a wash for its whole height rather than a
                  border around it. A boxed column would be a card again, and
                  the point of the wash is only to keep the eye in one place
                  while it reads down.
                */}
                <td className="bg-indigo-deep/20 px-5 py-5 align-top">
                  <span className="flex items-start gap-3">
                    <Check
                      aria-hidden="true"
                      className="text-lavender mt-0.5 size-5 shrink-0"
                    />
                    <span className="text-mist text-base leading-relaxed text-pretty">
                      {t(key(`rows.${row}.ours`))}
                    </span>
                  </span>
                </td>

                <td className="px-5 py-5 align-top">
                  <span className="flex items-start gap-3">
                    <Minus
                      aria-hidden="true"
                      className="text-mist/30 mt-0.5 size-5 shrink-0"
                    />
                    <span className="text-mist/55 text-base leading-relaxed text-pretty">
                      {t(key(`rows.${row}.theirs`))}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
