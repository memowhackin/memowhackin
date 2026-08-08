import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";
import { SectionShell } from "@/components/common/SectionShell";
import { sectionIds } from "@/config/site";

const services = [
  {
    key: "pentesting",
    image: "/assets/service-pentesting.webp",
    alt: "services.alt.pentesting",
    /** Rows alternate which side the screenshot sits on. */
    imageFirst: false,
  },
  {
    key: "cloud",
    image: "/assets/service-cloud.webp",
    alt: "services.alt.cloud",
    imageFirst: true,
  },
  {
    key: "redTeaming",
    image: "/assets/service-red-teaming.webp",
    alt: "services.alt.redTeaming",
    imageFirst: false,
  },
] as const;

/** The diamond that marks each hairline intersection in the frame. */
function RuleNode({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "bg-lavender absolute size-2 rotate-45 rounded-xs",
        className,
      )}
    />
  );
}

/**
 * Service rows drawn on the hairline grid from the design: mono title top-left,
 * copy and link bottom-left, screenshot bleeding out of the opposite cell.
 */
export function Services() {
  const { t } = useTranslation();

  return (
    <SectionShell
      id={sectionIds.services}
      data-testid="services"
      className="bg-ink"
      innerClassName="flex flex-col items-center gap-12 py-16 sm:py-24 lg:gap-16 lg:py-28"
    >
      <span className="border-indigo-deep bg-ink-deep text-mist rounded-selector inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium">
        <LogoMark className="text-lavender size-4" />
        {t("services.badge")}
        <ChevronRight className="size-4" aria-hidden="true" />
      </span>

      <ul className="relative flex w-full flex-col">
        {services.map((service) => (
          <li
            key={service.key}
            data-testid={`service-${service.key}`}
            className="relative grid lg:grid-cols-2"
          >
            {/*
              The frame rules the grid with unbroken hairlines that pass behind
              the screenshots, so they are drawn as their own layer above the
              cells rather than as cell borders (which the images interrupt).
            */}
            <span
              className="bg-indigo-deep/60 pointer-events-none absolute inset-x-0 top-0 z-10 h-px"
              aria-hidden="true"
            />
            <span
              className="bg-indigo-deep/60 pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px"
              aria-hidden="true"
            />
            <span
              className="bg-indigo-deep/60 pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-px lg:block"
              aria-hidden="true"
            />
            <RuleNode className="top-0 left-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:block" />
            <RuleNode className="bottom-0 left-1/2 z-20 hidden -translate-x-1/2 translate-y-1/2 lg:block" />

            <div
              className={clsx(
                "flex flex-col justify-between gap-10 py-10 lg:min-h-[33.5rem] lg:py-14",
                service.imageFirst ? "lg:order-2 lg:pl-14" : "lg:pr-14",
              )}
            >
              <h3 className="font-display text-service text-mist font-normal">
                {t(`services.${service.key}.title`)}
              </h3>

              <div className="flex flex-col gap-8">
                <p className="text-mist/80 max-w-md text-base leading-6">
                  {t(`services.${service.key}.body`)}
                </p>

                <a
                  href={`#${sectionIds.demonstrate}`}
                  data-testid={`service-${service.key}-explore`}
                  className="text-mist hover:text-lavender inline-flex w-fit items-center gap-2 text-base font-medium transition"
                >
                  {t("services.exploreMore")}
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div
              className={clsx(
                "relative min-h-56 overflow-hidden lg:min-h-0",
                service.imageFirst ? "lg:order-1 lg:pr-14" : "lg:pl-14",
              )}
            >
              <img
                src={service.image}
                alt={t(service.alt)}
                width={720}
                height={586}
                loading="lazy"
                className={clsx(
                  "size-full object-cover",
                  service.imageFirst ? "object-left" : "object-right",
                )}
              />
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
