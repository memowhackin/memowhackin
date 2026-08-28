import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { RuleNode } from "@/components/common/RuleNode";
import { SectionBadge } from "@/components/common/SectionBadge";
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
          className="text-mist hover:text-lavender group inline-flex w-fit items-center gap-2 py-1 text-base font-medium transition-colors pointer-coarse:min-h-11"
        >
          {t("services.exploreMore")}
          <ArrowUpRight
            className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
           * The screenshot keeps its own 720×586 and is never cropped. It was
           * being forced into three ratios on the way up — 4/3, then 16/10,
           * then 16/9 — and `object-cover` paid for each of them out of the
           * bottom of the picture: at `lg` that is the last 31% of it, which is
           * where these panels keep their axis labels. The first card was
           * cutting "Persistence" in half.
           *
           * Nothing needs the rows to be a fixed height — the grid centres the
           * copy against whatever the picture comes to — so there is nothing to
           * buy with the crop.
           */
          className="block h-auto w-full"
        />
      </div>
    </li>
  );
}

/**
 * Service rows drawn on the hairline grid from the design: mono title, copy and
 * link on one side, the portal screenshot on the other.
 *
 * The frame pins the title to the top of a 33.5rem cell and the copy and link
 * to its foot. Reproduced literally that leaves a hole down the middle of every
 * row at real text lengths, so the block is kept together and set against the
 * screenshot instead — a deliberate departure.
 */
export function Services() {
  const { t } = useTranslation();

  return (
    <SectionShell
      id={sectionIds.services}
      data-testid="services"
      /*
        Pulled up over the skyline's foot. The photograph's last rows are the
        dark water, which is the same tone this section opens on, so lifting the
        ink section into them closes the blank gap without a seam — the water is
        simply covered by the background it was blending into anyway.
      */
      className="bg-ink -mt-12 sm:-mt-16 lg:-mt-24"
      /*
        The top padding is deliberately shorter than the foot. Every other
        section on the page opens on its own background, so its lead-in is the
        whole gap above it — but this one opens under the skyline, whose last
        rows are the dark water and read as blank space themselves. Matching the
        two ends left a hole between the sections.

        So the lead-in here is nearly nothing — 2rem against the foot's 7rem —
        and the air above the badge is the photograph's, not the section's. The
        badge is what has to land close to the skyline; the first hairline rule
        below it is still a full `gap-14` further down, so the rows themselves
        keep their room.
      */
      innerClassName="flex flex-col items-center gap-10 pt-4 pb-16 sm:pt-6 sm:pb-24 lg:gap-14 lg:pt-8 lg:pb-28"
    >
      {/*
        The badge is the section's heading, not decoration: without it the three
        service titles were `h3`s hanging under the skyline's `h2`, so anyone
        moving by headings met a level with nothing above it.
      */}
      <SectionBadge data-testid="services-badge">
        {t("services.badge")}
      </SectionBadge>

      <ul className="relative flex w-full flex-col">
        {services.map((service) => (
          <ServiceRow key={service.key} service={service} />
        ))}
      </ul>
    </SectionShell>
  );
}
