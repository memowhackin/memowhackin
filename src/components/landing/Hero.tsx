import { useTranslation } from "react-i18next";
import { BrandButton } from "@/components/common/BrandButton";
import { site } from "@/config/site";

/**
 * Opening statement: the blue shafted backdrop from the Figma frame, the
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
      {/*
        The backdrop the frame draws behind the hero: columns of blue light on a
        near-black ground, blurred to 90px, with the fine banding of the
        overlapping bars over the top and the whole thing falling away to
        nothing at the edges.

        It is drawn rather than filmed. The other homepage frame's backdrop
        arrived as a 1.7MB looping export — three quarters of the page's asset
        weight for a decorative layer — which had to be withheld from phones and
        from anyone asking for reduced motion to be affordable at all. This
        costs nothing to fetch, so every viewport gets the design, and the
        stylesheet's reduced-motion rule settles it on a still frame.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[70%] overflow-hidden"
        aria-hidden="true"
        style={{
          maskImage:
            "radial-gradient(85% 70% at 50% 38%, #000 0%, #000 45%, transparent 100%)",
        }}
      >
        {/*
          The two beam layers run against each other — one drifting right, one
          swaying back and stretching — so the light never settles into a
          repeat. They are inset past both edges by a quarter so neither drift
          can pull a hard edge into view.
        */}
        <div className="hero-beams animate-beam-drift absolute -inset-x-1/4 inset-y-0 blur-[5.625rem]" />
        <div className="hero-beams animate-beam-sway absolute -inset-x-1/4 inset-y-0 blur-[3.75rem]" />

        {/* The bloom the frame puts behind the headline. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 55% at 50% 30%, color-mix(in oklab, var(--color-indigo-bright) 45%, transparent) 0%, color-mix(in oklab, var(--color-indigo-deep) 30%, transparent) 48%, transparent 100%)",
          }}
        />

        <div className="hero-banding absolute inset-0" />
      </div>

      {/* Keeps the copy legible over the brightest part of the backdrop. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, #0d0b21b3 0%, #0d0b2166 28%, #0d0b21b3 62%, #0d0b21 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[90rem] flex-col items-center px-6 pt-12 sm:px-10 sm:pt-16 lg:px-16 lg:pt-20 2xl:px-0">
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
          className="relative z-10 mt-8 sm:mt-10"
        >
          {t("hero.cta")}
        </BrandButton>
      </div>

      {/*
        Portal screenshot on the full-bleed diamond band, as in the frame, which
        runs the call to action down onto the top edge of the panel rather than
        clearing it — hence the negative margin and the raised button above.
      */}
      <div className="relative mt-10 sm:mt-12 lg:-mt-4">
        {/*
          The band is masked at both ends. Drawn as a plain box it began and
          ended on two razor-straight horizontal lines running the full width of
          the page, on either side of the panel — the single most unfinished
          edge on the landing page. Fading it in and out turns the same artwork
          into something the section can hold.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-repeat-x opacity-90 sm:h-56 lg:h-72"
          aria-hidden="true"
          style={{
            backgroundImage: "url('/assets/lattice-band.webp')",
            backgroundSize: "auto 100%",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, #000 24%, #000 58%, transparent 100%)",
          }}
        />

        {/*
          The panel is taller than the room the section gives it, so the
          section's clip cut it off on a hard line part-way down a table. This
          dissolves the last of it into the background instead.

          It spans the section rather than the content column: the diamond band
          bleeds past the column's gutters, so a dissolve that stopped at the
          column left the band's own bottom edge standing.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 sm:h-40 lg:h-48"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, #0d0b21b3 55%, #0d0b21 100%)",
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
