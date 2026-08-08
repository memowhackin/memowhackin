import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { LogoMark } from "@/components/common/Logo";
import { sectionIds } from "@/config/site";

/**
 * Partner marks under the lead paragraph. Heights are the Figma heights, so the
 * marks keep their drawn proportions instead of being forced to one size.
 */
const partners = [
  { key: "trendMicro", name: "Trend Micro", src: "/assets/logo-trendmicro.svg", width: 81, height: 17 },
  { key: "checkPoint", name: "Check Point", src: "/assets/logo-checkpoint.svg", width: 143, height: 21 },
  { key: "algotech", name: "Algotech", src: "/assets/logo-algotech.svg", width: 109, height: 25 },
  { key: "fortinet", name: "Fortinet", src: "/assets/logo-fortinet.svg", width: 112, height: 13 },
] as const;

/**
 * Capability tags floating over the constellation, placed as percentages of the
 * graphic's own box so they track it as it scales.
 */
const tags = [
  { key: "apiTesting", label: "platform.tags.apiTesting", position: "left-[53.9%] top-[22.3%]" },
  { key: "pentesting", label: "platform.tags.pentesting", position: "left-[15.2%] top-[66.3%]" },
  { key: "credentials", label: "platform.tags.credentials", position: "left-[67.8%] top-[58.7%]" },
] as const;

/**
 * The proof section. The frame does not use the 1440px content column here: the
 * constellation is anchored to the very left edge of the 1920px canvas (0→776)
 * and the copy runs from 776 to 1784, so the columns are expressed as
 * percentages of the canvas rather than as a centred grid.
 */
export function PlatformShowcase() {
  const { t } = useTranslation();

  return (
    <section
      id={sectionIds.about}
      data-testid="platform-showcase"
      className="bg-ink-deep relative w-full overflow-hidden"
    >
      {/* Constellation: 0 → 776 of the 1920 canvas, centred on the section. */}
      <div className="relative mx-auto w-full max-w-sm px-6 pt-16 sm:px-10 lg:absolute lg:top-1/2 lg:left-0 lg:mx-0 lg:w-[40.4%] lg:max-w-none lg:px-0 lg:pt-0 lg:-translate-y-1/2">
        <div className="relative aspect-[776/1086]">
          <img
            src="/assets/constellation.webp"
            alt=""
            width={1552}
            height={2172}
            loading="lazy"
            aria-hidden="true"
            className="size-full object-cover mix-blend-screen"
          />

          {/* The brand mark sitting at the centre of the graph. */}
          <span
            className="bg-indigo-deep/90 ring-lavender/40 absolute top-[47.9%] left-[33.8%] flex aspect-square w-[19.3%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_0_4rem_1rem_rgba(65,57,148,0.55)] ring-1 backdrop-blur-sm"
            aria-hidden="true"
          >
            <LogoMark className="text-lavender w-[45%]" />
          </span>

          {tags.map((tag) => (
            <span
              key={tag.key}
              data-testid={`platform-tag-${tag.key}`}
              className={clsx(
                "bg-lavender text-ink-deep absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md px-2.5 py-1.5 text-xs leading-none font-medium shadow-lg sm:text-sm",
                tag.position,
              )}
            >
              <span
                className="bg-ink-deep size-1.5 rounded-xs"
                aria-hidden="true"
              />
              {t(tag.label)}
            </span>
          ))}
        </div>
      </div>

      {/* Copy column: 776 → 1784 of the canvas, i.e. 52.5% starting at 40.4%. */}
      <div className="flex flex-col gap-12 px-6 py-16 sm:px-10 sm:py-24 lg:ml-[40.4%] lg:w-[52.5%] lg:gap-32 lg:px-0 lg:py-36 xl:gap-44 xl:py-44">
        <p className="text-2xl leading-[1.4] tracking-[-0.03em] text-pretty sm:text-3xl lg:text-[2.5rem]">
          <span className="text-mist">{t("platform.leadStrong")}</span>{" "}
          <span className="text-mist/45">{t("platform.leadMuted")}</span>
        </p>

        <div className="flex flex-col gap-8">
          <p className="text-lavender max-w-sm text-base leading-[1.4] sm:text-lg">
            {t("platform.poweredBy")}
          </p>

          <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
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
    </section>
  );
}
