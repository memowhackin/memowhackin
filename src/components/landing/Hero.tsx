import { useTranslation } from "react-i18next";
import { BrandButton } from "@/components/common/BrandButton";
import { site } from "@/config/site";

/**
 * Opening statement: the looping banner video from the Figma frame, the
 * headline block, and the portal screenshot sitting on the full-bleed diamond
 * band that runs behind it.
 */
export function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="top"
      data-testid="hero"
      className="bg-ink-deep relative isolate w-full overflow-hidden"
    >
      {/* Banner video, exported from the Figma file, with the grid overlay on top. */}
      <video
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[70%] w-full object-cover opacity-40"
        src="/assets/hero-banner.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(to right, #292362 1px, transparent 1px), linear-gradient(to bottom, #292362 1px, transparent 1px)",
          backgroundSize: "5rem 5rem",
          maskImage:
            "radial-gradient(80% 60% at 50% 40%, #000 0%, transparent 100%)",
        }}
      />
      {/* Keeps the copy legible over the brightest frames of the video. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #0d0b21b3 0%, #0d0b2166 28%, #0d0b21b3 62%, #0d0b21 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center px-6 pt-14 sm:px-10 sm:pt-20 lg:px-16 lg:pt-28 xl:pt-32 2xl:px-0">
        <div className="flex w-full max-w-[52.5rem] flex-col items-center gap-6 text-center">
          <h1 className="text-hero text-balance text-white">
            {t("hero.title")}
          </h1>

          <p className="max-w-[45rem] text-base leading-[1.6] text-pretty text-white/80 sm:text-lg">
            {t("hero.body")}
          </p>
        </div>

        <BrandButton
          href={site.bookDemoUrl}
          variant="sweep"
          data-testid="hero-book-demo"
          className="mt-10 sm:mt-12 lg:mt-14"
        >
          {t("hero.cta")}
        </BrandButton>
      </div>

      {/* Portal screenshot on the full-bleed diamond band, as in the frame. */}
      <div className="relative mt-12 sm:mt-16 lg:mt-20">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-repeat-x opacity-90 sm:h-56 lg:h-72"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/assets/lattice-band.webp')",
            backgroundSize: "auto 100%",
          }}
        />

        <div className="relative mx-auto w-full max-w-[91rem] px-6 sm:px-10 lg:px-16 2xl:px-0">
          <img
            src="/assets/hero-dashboard.webp"
            alt={t("hero.dashboardAlt")}
            width={3076}
            height={1230}
            className="border-indigo-deep/70 mx-auto block w-full rounded-t-2xl border border-b-0 shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
