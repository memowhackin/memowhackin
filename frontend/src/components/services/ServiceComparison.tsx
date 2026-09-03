import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Check, Minus } from "lucide-react";
import { LogoLockup } from "@/components/common/Logo";
import { useReveal } from "@/components/common/useReveal";
import type { ServiceDefinition } from "@/config/services";

/*
 * The comparison sits in a panel of its own: a rounded container washed with
 * the brand purple at low strength, and our column raised out of it as a dark
 * pillar under the logo. The old version was rows on bare hairlines, which
 * made the one section whose job is "these two are not the same" look like
 * every other list on the page.
 *
 * The wash is mixed from the same indigo ramp the mark is drawn with, kept
 * translucent so the page's ink still reads through it — a filled purple block
 * at full strength would fight the light band treatments elsewhere.
 */
const PANEL_WASH = {
  background:
    "linear-gradient(155deg, color-mix(in oklab, var(--color-indigo-bright) 17%, transparent) 0%, color-mix(in oklab, var(--color-indigo) 11%, transparent) 55%, color-mix(in oklab, var(--color-indigo-deep) 16%, transparent) 100%)",
} as const;

/*
 * The dark pillar our column stands on, shared by its header and cells. Border
 * colours are set per side, because a cell that also carries a softer top
 * separator would otherwise have that colour bleed into the pillar's edges —
 * two all-side colour utilities on one element resolve by stylesheet order,
 * not by intent.
 */
const PILLAR = "border-x-lavender/20 bg-ink-deep/70 border-x";

/**
 * What the engagement gives you that a conventional one does not.
 *
 * Still a real `<table>`, not a grid of divs dressed as one: this is tabular
 * data — two values compared across the same aspects — and the markup that
 * says so is also the markup a screen reader can navigate cell by cell. The
 * row headers carry `scope`, so "Retesting" is announced with every cell in
 * its row rather than leaving the reader to count columns.
 *
 * `border-separate` rather than collapse, because the pillar's corners are
 * rounded and collapsed borders cannot round. Row separation is carried by
 * soft per-cell top borders.
 *
 * Below `sm` it scrolls sideways inside the panel rather than folding into
 * stacked blocks. Restyling table elements to `block` strips the semantics
 * back out in several screen readers, and losing them to save a horizontal
 * swipe is a bad trade here.
 */
export function ServiceComparison({ service }: { service: ServiceDefinition }) {
  const { t } = useTranslation();
  const { ref, className } = useReveal<HTMLDivElement>();

  const key = (suffix: string) =>
    `servicePages.${service.key}.comparison.${suffix}`;
  const lastRow = service.comparison.length - 1;

  return (
    <div ref={ref} className={clsx("flex flex-col gap-8", className)}>
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
          {t(key("title"))}
        </h2>
        <p className="text-mist/80 max-w-2xl text-base leading-relaxed text-pretty">
          {t(key("intro"))}
        </p>
      </div>

      <div
        className="border-indigo-bright/25 rounded-3xl border p-4 sm:p-6 lg:p-8"
        style={PANEL_WASH}
      >
        {/* The table keeps a floor width so its columns never crush; narrower
            than that and this wrapper takes over and scrolls. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
            <caption className="sr-only">{t(key("caption"))}</caption>

            <thead>
              <tr>
                <th
                  scope="col"
                  className="text-mist/55 w-[22%] pr-5 pb-2 align-bottom text-sm font-medium"
                >
                  {t(key("columns.aspect"))}
                </th>

                {/*
                  Our column opens on the mark itself rather than the name in
                  text. The lockup carries its own accessible name ("AssistSec"
                  via the svg's aria-label), so nothing is lost to a reader who
                  cannot see it.
                */}
                <th
                  scope="col"
                  className={clsx(
                    "border-t-lavender/20 w-[39%] rounded-t-2xl border-t px-5 py-4 align-bottom",
                    PILLAR,
                  )}
                >
                  <LogoLockup className="text-mist h-5 w-auto" />
                </th>

                <th
                  scope="col"
                  className="text-mist/60 w-[39%] px-5 pb-2 align-bottom text-base font-medium"
                >
                  {t(key("columns.theirs"))}
                </th>
              </tr>
            </thead>

            <tbody>
              {service.comparison.map((row, index) => (
                <tr key={row} data-testid={`service-comparison-${row}`}>
                  <th
                    scope="row"
                    className="border-indigo-bright/15 text-mist border-t py-5 pr-5 align-top text-base font-medium text-pretty"
                  >
                    {t(key(`rows.${row}.aspect`))}
                  </th>

                  {/*
                    The pillar runs unbroken from the logo to the panel's foot:
                    its own separators are a shade softer than the outer rows',
                    so the column reads as one object with entries rather than
                    as a striped strip.
                  */}
                  <td
                    className={clsx(
                      "px-5 py-5 align-top",
                      PILLAR,
                      index > 0 && "border-t-lavender/10 border-t",
                      index === lastRow &&
                        "border-b-lavender/20 rounded-b-2xl border-b",
                    )}
                  >
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

                  <td className="border-indigo-bright/15 border-t px-5 py-5 align-top">
                    <span className="flex items-start gap-3">
                      <Minus
                        aria-hidden="true"
                        className="text-mist/45 mt-0.5 size-5 shrink-0"
                      />
                      <span className="text-mist/70 text-base leading-relaxed text-pretty">
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
    </div>
  );
}
