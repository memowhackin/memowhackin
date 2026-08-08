import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
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

/** One service row. Split out so each can hold its own reveal state. */
function ServiceRow({ service }: { service: (typeof services)[number] }) {
  const { t } = useTranslation();
  const { ref: revealRef, className: revealClassName } =
    useReveal<HTMLLIElement>();

  return (
    <li
      ref={revealRef}
      data-testid={`service-${service.key}`}
      className={clsx(
        "relative grid items-center gap-8 py-10 sm:gap-10 lg:grid-cols-2 lg:gap-0 lg:py-14",
        revealClassName,
      )}
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
          "flex flex-col gap-5 sm:gap-6",
          service.imageFirst
            ? "lg:order-2 lg:pl-10 xl:pl-14"
            : "lg:pr-10 xl:pr-14",
        )}
      >
        <h3 className="font-display text-service text-mist font-normal text-balance">
          {t(`services.${service.key}.title`)}
        </h3>

        <p className="text-mist/80 max-w-prose text-base leading-relaxed text-pretty">
          {t(`services.${service.key}.body`)}
        </p>

        <a
          href={`#${sectionIds.demonstrate}`}
          data-testid={`service-${service.key}-explore`}
          className="text-mist hover:text-lavender group inline-flex w-fit items-center gap-2 py-1 text-base font-medium transition"
        >
          {t("services.exploreMore")}
          <ArrowUpRight
            className="size-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </div>

      <div
        className={clsx(
          "border-indigo-deep/70 bg-ink-deep relative overflow-hidden rounded-xl border",
          service.imageFirst
            ? "lg:order-1 lg:mr-10 xl:mr-14"
            : "lg:ml-10 xl:ml-14",
        )}
      >
        <img
          src={service.image}
          alt={t(service.alt)}
          width={720}
          height={586}
          loading="lazy"
          /*
           * These are product screenshots: anchoring the crop to the top
           * left keeps the panel heading and the chart in frame at every
           * width, where a centred crop showed an unreadable slice.
           */
          className="aspect-[4/3] w-full object-cover object-left-top sm:aspect-[16/10] lg:aspect-[16/9]"
        />
      </div>
    </li>
  );
}

/**
 * Service rows drawn on the hairline grid from the design: mono title, copy and
 * link on one side, the portal screenshot on the other.
 *
 * The frame stretches the copy over a tall cell with the title pinned to the
 * top and the link to the bottom; at real text lengths that leaves a hole in
 * the middle of every row, so the block is kept together and centred against
 * the screenshot instead.
 */
export function Services() {
  const { t } = useTranslation();

  return (
    <SectionShell
      id={sectionIds.services}
      data-testid="services"
      className="bg-ink"
      innerClassName="flex flex-col items-center gap-10 py-16 sm:py-24 lg:gap-14 lg:py-28"
    >
      <span className="border-indigo-deep bg-ink-deep text-mist rounded-selector inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium">
        <LogoMark className="text-lavender size-4" />
        {t("services.badge")}
        <ChevronRight className="size-4" aria-hidden="true" />
      </span>

      <ul className="relative flex w-full flex-col">
        {services.map((service) => (
          <ServiceRow key={service.key} service={service} />
        ))}
      </ul>
    </SectionShell>
  );
}
