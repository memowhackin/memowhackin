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
  widgets?: readonly {
    key: string;
    icon: LucideIcon;
    tone: string;
    /**
     * Where the card hangs, as position utilities. Per widget rather than one
     * shared table: these annotate a capture whose left column carries the
     * logo, the project card and the one nav row left readable, and which
     * bands are free to cover differs from page to page.
     */
    at: string;
  }[];
  /**
   * Mask rows of the captured sidebar so only the page being described stays
   * readable, and draw a loading skeleton over each masked row.
   *
   * The captures are flat PNGs, so this is an overlay rather than an edit: the
   * sidebar in every export is exactly `ink-deep`, which is why a patch in that
   * colour is invisible against it. Positions are percentages of the image, so
   * they hold at every width the frame is rendered at.
   */
  skeletonNav?: SkeletonNav;
  "data-testid": string;
}

/**
 * Every hero frame takes this ratio, whatever the export's own shape.
 *
 * The captures come in different ratios, and the column is one width, so left
 * to their own shapes the four pages opened at four visibly different sizes.
 * The frame now fixes the shape and `object-cover`, anchored to the top-left
 * corner, absorbs the difference: the sidebar and header — the parts the
 * skeleton work and the page name live in — always survive, and what gives is
 * the far right or the bottom, which is where a dashboard trails off anyway.
 */
const FRAME_RATIO = 1.6;

export interface SkeletonNav {
  /** Sidebar width, as a percentage of the image's width. */
  sidebar: number;
  /** Each row to mask: top edge and height, as percentages of the height. */
  rows: readonly { top: number; height: number }[];
}

/** The masked rows, drawn as a nav that has not loaded yet. */
function SkeletonSidebar({ sidebar, rows }: SkeletonNav) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {rows.map((row, index) => (
        <div
          key={row.top}
          className="bg-ink-deep absolute flex items-center"
          /*
           * A little taller than the row it covers: the detected band is the
           * ink itself, and a patch flush to it leaves the odd antialiased
           * pixel of the original showing at the edges.
           */
          style={{
            top: `${(row.top - 0.7).toString()}%`,
            height: `${(row.height + 1.4).toString()}%`,
            left: `${(sidebar * 0.03).toString()}%`,
            width: `${(sidebar * 0.94).toString()}%`,
          }}
        >
          <span className="flex h-[45%] w-full items-center gap-[6%]">
            <span className="bg-mist/12 aspect-square h-full rounded-[0.2rem] motion-safe:animate-pulse" />
            {/* Widths vary so the column reads as content, not as a pattern. */}
            <span
              className="bg-mist/10 h-[70%] rounded-full motion-safe:animate-pulse"
              style={{ width: `${(52 + ((index * 13) % 30)).toString()}%` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function ArgusHero({
  base,
  image,
  points,
  widgets,
  skeletonNav,
  "data-testid": testId,
}: ArgusHeroProps) {
  const { t } = useTranslation();
  const { ref: copyRef, className: copyReveal } = useReveal<HTMLDivElement>();
  const { ref: shotRef, className: shotReveal } = useReveal<HTMLDivElement>({
    delay: 120,
  });

  /*
   * The skeleton positions are measured as percentages of the export, but the
   * masks are drawn on the frame, whose shape is fixed. Cover-fitting the
   * image stretches one axis of that mapping — which one depends on whether
   * the export is wider or squarer than the frame — so the measured values are
   * rescaled here rather than re-measured on every page.
   */
  const imgRatio = image.width / image.height;
  const hScale = Math.max(1, imgRatio / FRAME_RATIO);
  const vScale = Math.max(1, FRAME_RATIO / imgRatio);
  const scaledNav =
    skeletonNav === undefined
      ? undefined
      : {
          sidebar: skeletonNav.sidebar * hScale,
          rows: skeletonNav.rows.map((row) => ({
            top: row.top * vScale,
            height: row.height * vScale,
          })),
        };

  return (
    <SectionShell
      className="overflow-x-clip bg-transparent"
      data-testid={testId}
      innerClassName="grid grid-cols-1 items-center gap-12 pt-10 pb-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-x-16 lg:pt-16 lg:pb-24"
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
        <div className="border-indigo-deep/70 bg-ink-deep relative aspect-8/5 overflow-hidden rounded-2xl border lg:w-[calc(100%+4rem+max(0px,(100vw-90rem)/2))] lg:rounded-r-none lg:border-r-0 2xl:w-[calc(100%+(100vw-90rem)/2)]">
          <img
            src={image.src}
            alt={t(`${base}.shots.hero`)}
            width={image.width}
            height={image.height}
            fetchPriority="high"
            decoding="async"
            className="block h-full w-full object-cover object-left-top"
          />

          {scaledNav !== undefined && <SkeletonSidebar {...scaledNav} />}
        </div>

        {/*
          The widgets, pinned to the screenshot's left edge where the copy
          column's air is. Withheld below `lg`: on a phone the frame is the
          full width and a card over it would hide the screen it annotates,
          and every widget repeats something the copy already says.
        */}
        {widgets?.map((widget) => (
          <div
            key={widget.key}
            aria-hidden="true"
            className={clsx(
              "border-ink-deep/10 absolute hidden items-center gap-3 rounded-xl border bg-white p-3.5 shadow-[0_1rem_2.5rem_-1rem_rgba(13,11,33,0.55)] lg:flex",
              widget.at,
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
