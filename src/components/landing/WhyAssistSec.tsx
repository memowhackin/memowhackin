import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { site } from "@/config/site";

const pillars = [
  { key: "scope", icon: "/assets/icon-scope.svg" },
  { key: "experts", icon: "/assets/icon-experts.svg" },
  { key: "insight", icon: "/assets/icon-insight.svg" },
] as const;

/** One pillar. Split out so each can hold its own reveal state. */
function Pillar({
  pillar,
  index,
}: {
  pillar: (typeof pillars)[number];
  index: number;
}) {
  const { t } = useTranslation();
  const {
    ref: revealRef,
    className: revealClassName,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay: index * 120 });

  return (
    <li
      ref={revealRef}
      style={revealStyle}
      data-testid={`why-${pillar.key}`}
      /*
       * No horizontal padding on the cell. The upper rail is drawn per cell as
       * `inset-x-0`, so any padding here becomes a gap in the line where one
       * pillar meets the next; the copy is held in by its own `max-w` instead.
       */
      className={clsx(
        "flex flex-col items-center gap-6 text-center",
        revealClassName,
      )}
    >
      <div className="relative flex w-full items-center justify-center">
        {/* Upper rail, threaded through the icon circles. */}
        <span
          className="bg-lavender/40 absolute inset-x-0 top-1/2 hidden h-px lg:block"
          aria-hidden="true"
        />

        {/*
          Where the rail meets the next pillar it turns and drops, with the
          diamond the frame puts on the junction. Solid dividers running the
          full height of the cell were standing in for this.
        */}
        {index > 0 && (
          <>
            <span
              className="bg-lavender/40 absolute top-1/2 left-0 hidden h-[13rem] w-px lg:block"
              aria-hidden="true"
            />
            <span
              className="bg-lavender/70 absolute top-1/2 left-0 hidden size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xs lg:block"
              aria-hidden="true"
            />
          </>
        )}

        {/*
          Translucent with a ring, as drawn — an opaque `ink-deep` disc punched
          a hole in the gradient behind it.
        */}
        <img
          src={pillar.icon}
          alt=""
          width={156}
          height={156}
          loading="lazy"
          aria-hidden="true"
          className="ring-lavender-soft/25 relative size-[clamp(6rem,13vw,9.5rem)] rounded-full bg-white/8 ring-1 backdrop-blur-sm"
        />
      </div>

      <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
        {t(`why.${pillar.key}.title`)}
      </h3>

      <p className="text-mist/80 max-w-[18rem] text-sm leading-6 text-pretty">
        {t(`why.${pillar.key}.body`)}
      </p>
    </li>
  );
}

/**
 * "Get hacked by AssistSec." — three pillars threaded onto the hairline rails
 * from the design, with the demo call-to-action sitting on the lower rail.
 *
 * Each pillar draws its own segment of the upper rail across its own cell, so
 * the line stays centred on the icons however the icon size scales.
 */
export function WhyAssistSec() {
  const { t } = useTranslation();

  return (
    <SectionShell
      data-testid="why-assistsec"
      className="from-lavender via-indigo to-ink bg-gradient-to-b from-0% via-35% to-90%"
      innerClassName="flex flex-col items-center gap-12 py-16 sm:py-20 lg:gap-16 lg:py-24"
      /*
       * The heading sits at the top of the section, which is where the gradient
       * is at its lightest, and light type on it measured 2.4:1 on a phone —
       * unreadable, and the reason an earlier pass flipped the heading to dark
       * and lost the design with it. This is the least the section can be
       * darkened to carry it: a wash that is nothing at the very top edge (so
       * the join with the stripe band above stays seamless), strongest across
       * the heading, and gone again before the first pillar.
       */
      backdrop={
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,11,33,0) 0%, rgba(13,11,33,0.34) 30%, rgba(13,11,33,0.3) 55%, rgba(13,11,33,0) 100%)",
          }}
        />
      }
    >
      {/*
        The frame sets this in a pale lavender on the lavender sky, which no one
        can read. It stays light — it is meant to be a quiet line of light
        sitting in the gradient, not a dark heading stamped on it — and clears
        the contrast threshold through the wash above instead. The smallest step
        is 24px so the whole range is large text at every width rather than only
        on the desktop.
      */}
      <h2 className="font-display text-lavender-soft text-center text-2xl tracking-[0.25em] uppercase sm:text-[1.75rem] sm:tracking-[0.4em] lg:text-[1.875rem] lg:tracking-[0.5em]">
        {t("why.title")}
      </h2>

      <ul className="grid w-full gap-12 lg:grid-cols-3 lg:gap-0">
        {pillars.map((pillar, index) => (
          <Pillar key={pillar.key} pillar={pillar} index={index} />
        ))}
      </ul>

      <div className="relative flex w-full justify-center">
        {/* Lower rail the call-to-action sits on. */}
        <div
          className="bg-lavender/40 absolute top-1/2 right-[6%] left-[6%] hidden h-px lg:block"
          aria-hidden="true"
        />

        <BrandButton
          href={site.bookDemoUrl}
          size="sm"
          data-testid="why-book-demo"
          className="relative"
        >
          {t("why.cta")}
        </BrandButton>
      </div>
    </SectionShell>
  );
}
