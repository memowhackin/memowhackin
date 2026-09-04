import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { BrandButton } from "@/components/common/BrandButton";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { site } from "@/config/site";

/*
 * The opening every ARGUS page shares: the claim on the left, the product on
 * the right, at size.
 *
 * The screenshot is a real capture, not a drawn composition, and it is treated
 * the way a product this visual deserves: a dark rounded frame, a soft glow
 * rising behind its near edge, and more width than its column — it runs past
 * the grid on large screens, which is what makes it read as a working
 * application rather than a thumbnail. Never cropped, never stretched: the
 * frame takes the export's own ratio.
 */

/**
 * Where a hero widget hangs, in the order they are given. Two is the limit on
 * purpose: they annotate the screenshot, and a third starts covering it.
 */
const WIDGET_PLACEMENT = ["-top-5 -left-6", "-bottom-6 left-10"] as const;

interface ArgusHeroProps {
  /** i18n prefix, e.g. `argusPages.monthly`. */
  base: string;
  image: { src: string; width: number; height: number };
  /** Optional check rows under the lede, for the page with facts to pin. */
  points?: readonly string[];
  /**
   * Small cards pinned over the screenshot, each naming one thing the screen
   * behind it does. Keys under `<base>.hero.widgets.<key>.{figure,label}`.
   */
  widgets?: readonly { key: string; icon: LucideIcon; tone: string }[];
  /**
   * Give the screenshot more of the row.
   *
   * These captures are not all the same shape, and the column is one width, so
   * a wide-and-short export lands visibly shorter than a squarer one and reads
   * as the small thing on the page next to a tall column of copy. Widening its
   * share buys back the height. Set it where the export's ratio is past about
   * 1.6 and the copy beside it runs long.
   */
  wideImage?: boolean;
  "data-testid": string;
}

export function ArgusHero({
  base,
  image,
  points,
  widgets,
  wideImage = false,
  "data-testid": testId,
}: ArgusHeroProps) {
  const { t } = useTranslation();
  const { ref: copyRef, className: copyReveal } = useReveal<HTMLDivElement>();
  const { ref: shotRef, className: shotReveal } = useReveal<HTMLDivElement>({
    delay: 120,
  });

  return (
    <SectionShell
      className="overflow-x-clip bg-transparent"
      data-testid={testId}
      innerClassName={clsx(
        "grid grid-cols-1 items-center gap-12 pt-10 pb-16 lg:gap-x-16 lg:pt-16 lg:pb-24",
        wideImage
          ? "lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]"
          : "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]",
      )}
    >
      <div
        ref={copyRef}
        className={clsx("flex flex-col items-start gap-6", copyReveal)}
      >
        <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
          {t(`${base}.hero.heading`)}
        </h1>

        <p className="text-mist/75 max-w-xl text-lg leading-relaxed text-pretty">
          {t(`${base}.hero.lede`)}
        </p>

        {points !== undefined && (
          <ul className="flex flex-col gap-2.5">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <Check
                  aria-hidden="true"
                  className="text-lavender mt-1 size-4 shrink-0"
                />
                <span className="text-mist/80 text-base leading-relaxed text-pretty">
                  {t(`${base}.hero.points.${point}`)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* One action, named for what it asks for. The page has a contact
            link in the header, another in the footer and a whole closing
            section of its own; a second pill beside this one was a choice the
            reader did not need to make to get past the fold. */}
        <BrandButton
          href={site.bookDemoUrl}
          variant="sweep"
          data-testid="page-book-demo"
          className="mt-1 text-nowrap"
        >
          {t("servicePages.labels.requestPentest")}
        </BrandButton>
      </div>

      <div ref={shotRef} className={clsx("relative", shotReveal)}>
        {/*
          The screenshot runs off the right edge of the viewport, the way the
          product shots in the reference designs do: rounded on the side facing
          the copy, cut clean by the screen on the other. The width covers the
          gutter plus whatever margin the centred column leaves at this
          viewport, so the right corner can never surface — from `2xl` the
          gutter is gone and the formula drops it. The section's
          `overflow-x-clip` swallows the excess.
        */}
        <div className="border-indigo-deep/70 bg-ink-deep overflow-hidden rounded-2xl border lg:w-[calc(100%+4rem+max(0px,(100vw-90rem)/2))] lg:rounded-r-none lg:border-r-0 2xl:w-[calc(100%+(100vw-90rem)/2)]">
          <img
            src={image.src}
            alt={t(`${base}.shots.hero`)}
            width={image.width}
            height={image.height}
            fetchPriority="high"
            decoding="async"
            className="block h-auto w-full"
          />
        </div>

        {/*
          The widgets, pinned to the screenshot's left edge where the copy
          column's air is. Withheld below `lg`: on a phone the frame is the
          full width and a card over it would hide the screen it annotates,
          and every widget repeats something the copy already says.
        */}
        {widgets?.map((widget, index) => (
          <div
            key={widget.key}
            aria-hidden="true"
            className={clsx(
              "border-ink-deep/10 absolute hidden items-center gap-3 rounded-xl border bg-white p-3.5 shadow-[0_1rem_2.5rem_-1rem_rgba(13,11,33,0.55)] lg:flex",
              WIDGET_PLACEMENT[index],
            )}
          >
            <span
              className={clsx(
                "grid size-9 shrink-0 place-items-center rounded-full border",
                widget.tone,
              )}
            >
              <widget.icon className="size-4" />
            </span>
            <span className="flex flex-col">
              <span className="text-ink-deep text-sm font-semibold">
                {t(`${base}.hero.widgets.${widget.key}.figure`)}
              </span>
              <span className="text-ink-deep/55 text-xs">
                {t(`${base}.hero.widgets.${widget.key}.label`)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
