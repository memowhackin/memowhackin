import { useTranslation } from "react-i18next";
import { BrandButton } from "@/components/common/BrandButton";
import { SectionShell } from "@/components/common/SectionShell";
import { site } from "@/config/site";

const pillars = [
  { key: "scope", icon: "/assets/icon-scope.svg" },
  { key: "experts", icon: "/assets/icon-experts.svg" },
  { key: "insight", icon: "/assets/icon-insight.svg" },
] as const;

/**
 * "Get hacked by AssistSec." — three pillars threaded onto the hairline rails
 * from the design, with the demo call-to-action sitting on the lower rail.
 */
export function WhyAssistSec() {
  const { t } = useTranslation();

  return (
    <SectionShell
      data-testid="why-assistsec"
      className="from-lavender via-indigo to-ink bg-gradient-to-b from-0% via-30% to-70%"
      innerClassName="flex flex-col items-center gap-12 py-16 sm:py-24 lg:gap-20 lg:py-32 xl:py-40"
    >
      <h2 className="font-display text-mist/50 text-center text-base tracking-[0.5em] uppercase sm:text-xl lg:text-[1.875rem] lg:tracking-[0.55em]">
        {t("why.title")}
      </h2>

      <div className="relative w-full">
        {/* Upper rail, threaded through the icon circles. */}
        <div
          className="bg-lavender/40 absolute top-[4.75rem] right-[6%] left-[6%] hidden h-px lg:block"
          aria-hidden="true"
        />

        <ul className="relative grid gap-12 lg:grid-cols-3 lg:gap-0">
          {pillars.map((pillar) => (
            <li
              key={pillar.key}
              data-testid={`why-${pillar.key}`}
              className="relative flex flex-col items-center gap-6 px-4 text-center"
            >
              <img
                src={pillar.icon}
                alt=""
                width={156}
                height={156}
                loading="lazy"
                aria-hidden="true"
                className="bg-ink-deep size-[9.5rem] max-w-full rounded-full"
              />

              <h3 className="font-display text-mist text-xl font-normal sm:text-2xl">
                {t(`why.${pillar.key}.title`)}
              </h3>

              <p className="text-mist/80 max-w-[16rem] text-sm leading-6 text-pretty">
                {t(`why.${pillar.key}.body`)}
              </p>
            </li>
          ))}
        </ul>

        {/* The two drop connectors that link the rails between the pillars. */}
        <div
          className="bg-lavender/40 absolute top-[4.75rem] bottom-0 left-1/3 hidden w-px lg:block"
          aria-hidden="true"
        />
        <div
          className="bg-lavender/40 absolute top-[4.75rem] bottom-0 left-2/3 hidden w-px lg:block"
          aria-hidden="true"
        />
      </div>

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
