import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LogoMark } from "@/components/common/Logo";
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
    position: "left-[53.9%] top-[22.3%]",
  },
  {
    key: "pentesting",
    label: "platform.tags.pentesting",
    position: "left-[18%] top-[66.3%]",
  },
  {
    key: "credentials",
    label: "platform.tags.credentials",
    position: "left-[64%] top-[58.7%]",
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

  return (
    <section
      id={sectionIds.about}
      data-testid="platform-showcase"
      className="bg-ink-deep relative w-full overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-[120rem] items-center gap-10 pt-14 pb-16 sm:gap-14 sm:pt-20 sm:pb-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10 lg:py-20 xl:gap-16">
        <div className="mx-auto w-full max-w-sm px-6 sm:max-w-md sm:px-10 lg:mx-0 lg:max-w-none lg:px-0">
          {/*
            The export is drawn portrait. Left to its own ratio on a wide
            column it grew to over 45rem and set the height of the whole
            section, leaving the copy beside it floating in about as much empty
            space again — so its height is capped and the cover crop takes the
            middle of the graph.
          */}
          <div className="relative aspect-[776/1086] max-h-[34rem] lg:max-h-[30rem] xl:max-h-[34rem]">
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
                maskImage:
                  "radial-gradient(58% 55% at 42% 50%, #000 25%, transparent 100%)",
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
                  "bg-lavender text-ink-deep absolute inline-flex max-w-[70%] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md px-2.5 py-1.5 text-xs leading-none font-medium shadow-lg sm:text-sm",
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

        <div className="flex flex-col gap-10 px-6 sm:gap-12 sm:px-10 lg:px-0 lg:pr-10 xl:pr-16 2xl:pr-24">
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
