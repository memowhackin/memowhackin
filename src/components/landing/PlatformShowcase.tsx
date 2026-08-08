import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LogoMark } from "@/components/common/Logo";
import { useReveal } from "@/components/common/useReveal";
import { sectionIds } from "@/config/site";

/**
 * Partner marks under the lead paragraph. Heights are the Figma heights, so the
 * marks keep their drawn proportions instead of being forced to one size.
 */
const partners = [
  {
    key: "trendMicro",
    name: "Trend Micro",
    src: "/assets/logo-trendmicro.svg",
    width: 81,
    height: 17,
  },
  {
    key: "checkPoint",
    name: "Check Point",
    src: "/assets/logo-checkpoint.svg",
    width: 143,
    height: 21,
  },
  {
    key: "algotech",
    name: "Algotech",
    src: "/assets/logo-algotech.svg",
    width: 109,
    height: 25,
  },
  {
    key: "fortinet",
    name: "Fortinet",
    src: "/assets/logo-fortinet.svg",
    width: 112,
    height: 13,
  },
] as const;

/**
 * Capability tags floating over the constellation, placed as percentages of the
 * graphic's own box so they track it as it scales.
 */
const tags = [
  {
    key: "apiTesting",
    label: "platform.tags.apiTesting",
    position: "left-[52%] top-[26%]",
  },
  {
    key: "pentesting",
    label: "platform.tags.pentesting",
    position: "left-[26%] top-[70%]",
  },
  {
    key: "credentials",
    label: "platform.tags.credentials",
    position: "left-[62%] top-[58%]",
  },
] as const;

/**
 * The proof section: the constellation graphic beside the lead statement.
 *
 * The frame anchors the graphic to the very left edge of the canvas, which the
 * grid below keeps from `lg` up by dropping the left gutter on that column;
 * narrower viewports stack the two and centre the graphic instead.
 */
export function PlatformShowcase() {
  const { t } = useTranslation();
  const { ref: revealRef, className: revealClassName } =
    useReveal<HTMLDivElement>();

  return (
    <section
      id={sectionIds.about}
      data-testid="platform-showcase"
      className="bg-ink-deep relative w-full overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-[120rem] items-center gap-10 pt-14 pb-16 sm:gap-14 sm:pt-20 sm:pb-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-stretch lg:gap-10 lg:py-20 xl:gap-16">
        <div className="mx-auto w-full max-w-sm px-6 sm:max-w-md sm:px-10 lg:relative lg:mx-0 lg:min-h-[26rem] lg:max-w-none lg:px-0">
          {/*
            The export is drawn portrait, and at 1552×2172 its own proportions
            set the height of the whole section — over 45rem on a wide column,
            with the copy beside it then floating in about as much empty space
            again. Taking it out of the flow from `lg` up leaves the row height
            to the copy and lets the cover crop keep the middle of the graph.
          */}
          <div className="relative aspect-[776/1086] max-h-[34rem] lg:absolute lg:inset-0 lg:aspect-auto lg:max-h-none">
            <img
              src="/assets/constellation.webp"
              alt=""
              width={1552}
              height={2172}
              loading="lazy"
              aria-hidden="true"
              className="size-full object-cover mix-blend-screen"
              /*
               * The export is a hard-edged rectangle. Fading it into the
               * background keeps it reading as a graph drifting behind the
               * copy rather than as a pasted-in tile; a token cannot express a
               * two-axis mask, so it is set here.
               */
              style={{
                // Radii of 50% reach exactly the edges of the box, so the
                // screen blend has faded out completely by the time it gets
                // there and leaves no rectangle behind.
                maskImage:
                  "radial-gradient(50% 50% at 50% 50%, #000 15%, transparent 100%)",
              }}
            />

            {/* The brand mark sitting at the centre of the graph. */}
            <span
              className="bg-indigo-deep/90 ring-lavender/40 absolute top-[47.9%] left-[38%] flex aspect-square w-[19.3%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_0_4rem_1rem_rgba(65,57,148,0.55)] ring-1 backdrop-blur-sm"
              aria-hidden="true"
            >
              <LogoMark className="text-lavender w-[45%]" />
            </span>

            {tags.map((tag) => (
              <span
                key={tag.key}
                data-testid={`platform-tag-${tag.key}`}
                className={clsx(
                  // A wrapped capability tag reads as a broken label, so they
                  // stay on one line and sit far enough inside the graphic that
                  // the section's clipped edges never cut one in half.
                  "bg-lavender text-ink-deep absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md px-2.5 py-1.5 text-xs leading-none font-medium whitespace-nowrap shadow-lg sm:text-sm",
                  tag.position,
                )}
              >
                <span
                  className="bg-ink-deep size-1.5 shrink-0 rounded-xs"
                  aria-hidden="true"
                />
                {t(tag.label)}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={revealRef}
          className={clsx(
            "flex flex-col justify-center gap-10 px-6 sm:gap-12 sm:px-10 lg:px-0 lg:pr-10 xl:pr-16 2xl:pr-24",
            revealClassName,
          )}
        >
          {/*
            Capped on both axes. Uncapped it reached 2.5rem over a 57rem
            measure on a wide screen — around 46 characters a line, which is
            past the point where the eye reliably finds the next row. The
            second clause is set back rather than dimmed out: at 45% it read as
            disabled text rather than as the quieter half of the sentence.
          */}
          <p className="max-w-[40rem] text-2xl leading-[1.35] tracking-[-0.02em] text-pretty sm:text-3xl lg:text-[clamp(1.625rem,1.9vw,2rem)]">
            <span className="text-mist">{t("platform.leadStrong")}</span>{" "}
            <span className="text-mist/60">{t("platform.leadMuted")}</span>
          </p>

          <div className="flex flex-col gap-6">
            <p className="text-lavender max-w-sm text-base leading-[1.4] sm:text-lg">
              {t("platform.poweredBy")}
            </p>

            <ul className="flex flex-wrap items-center gap-x-8 gap-y-6 sm:gap-x-10">
              {partners.map((partner) => (
                <li key={partner.key}>
                  <img
                    src={partner.src}
                    alt={t("platform.partnerAlt", { name: partner.name })}
                    width={partner.width}
                    height={partner.height}
                    loading="lazy"
                    className="w-auto"
                    style={{ height: `${(partner.height / 16).toString()}rem` }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
