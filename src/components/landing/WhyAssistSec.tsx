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
      className={clsx(
        "flex flex-col items-center gap-6 text-center lg:px-6",
        index > 0 && "lg:border-lavender/40 lg:border-l",
        revealClassName,
      )}
    >
      <div className="relative flex w-full items-center justify-center">
        {/* Upper rail, threaded through the icon circles. */}
        <span
          className="bg-lavender/40 absolute inset-x-0 top-1/2 hidden h-px lg:block"
          aria-hidden="true"
        />
        <img
          src={pillar.icon}
          alt=""
          width={156}
          height={156}
          loading="lazy"
          aria-hidden="true"
          className="bg-ink-deep relative size-[clamp(6rem,13vw,9.5rem)] rounded-full"
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
    >
      {/*
        Dark type on the lavender top of the gradient: the muted light grey the
        frame uses sits at roughly 1.6:1 against it, which is unreadable.
      */}
      <h2 className="font-display text-ink-deep/85 text-center text-sm tracking-[0.4em] uppercase sm:text-xl sm:tracking-[0.5em] lg:text-[1.875rem]">
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
