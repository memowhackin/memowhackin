import { createFileRoute } from "@tanstack/react-router";
import { useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { LatticeDivider } from "@/components/common/LatticeDivider";
import { LogoMark } from "@/components/common/Logo";
import { ScrollFillText } from "@/components/common/ScrollFillText";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { useSeo } from "@/localization/useSeo";
import { site } from "@/config/site";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

/**
 * The etched-light fill the "Why AssistSec" heading wears on the home page:
 * near-white at the cap line falling into the sky's lavender. The ARGUS word
 * above the closing call to action takes the same ramp, so the page's
 * brightest type reads as one family.
 */
const ETCHED_FILL: CSSProperties = {
  backgroundImage:
    "linear-gradient(180deg, rgb(237 233 255 / 0.95) 0%, rgb(237 233 255 / 0.75) 45%, rgb(173 157 238 / 0.55) 100%)",
};

/**
 * The visitor's region, read off the timezone the browser already carries —
 * "Europe/Amsterdam" reads back as "Amsterdam". No permission prompt, no
 * geolocation API, no network call: it is the only location signal a static
 * page has that costs the reader nothing. Falls back to the market's name
 * where the timezone gives nothing usable.
 */
function visitorRegion(fallback: string): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const city = zone.split("/").pop()?.replaceAll("_", " ") ?? "";
    return city.length > 0 ? city : fallback;
  } catch {
    return fallback;
  }
}

/**
 * About AssistSec: the mission, the lattice the brand is drawn from, the
 * story and a manifesto that fills in as it is read, closing on the ARGUS
 * registration call to action.
 */
function AboutPage() {
  const { t, i18n } = useTranslation();
  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: ctaRef, className: ctaReveal } = useReveal<HTMLDivElement>();

  /*
   * The tab title carries the visitor's own region ("About AssistSec |
   * Amsterdam"), which is the closest a client-rendered page can get to the
   * location-aware indexing intent: each crawler and each reader sees the
   * title for where they are. The canonical, description and structured data
   * stay location-neutral so the page still indexes as one page.
   */
  const region = useMemo(
    () => visitorRegion(i18n.language === "nl" ? "Nederland" : "Netherlands"),
    [i18n.language],
  );

  useSeo({
    title: `${t("pages.about.title")} | ${region}`,
    description: t("pages.about.description"),
    path: "/about",
  });

  return (
    <div data-testid="about-page">
      {/* Mission statement, set alone on the dark ground like the hero. */}
      <SectionShell
        data-testid="about-hero"
        className="bg-ink-deep"
        innerClassName="flex flex-col items-center gap-6 pt-12 sm:pt-16 lg:pt-20 pb-16 text-center sm:pb-24 lg:pb-28"
        backdrop={
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] opacity-40 blur-3xl"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(55% 80% at 50% 0%, #413994 0%, transparent 70%)",
            }}
          />
        }
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-center gap-6", heroReveal)}
        >
          {/*
            `text-pretty`, not `text-balance`: balance squeezed the shorter
            English headline into a narrow four-line tower while the Dutch one
            ran three lines wide. Pretty keeps the lines filling the measure in
            both languages and still guards the last line against an orphan.
          */}
          <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-pretty sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            {t("aboutPage.heroTitle")}
          </h1>

          <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
            {t("aboutPage.heroBody")}
          </p>
        </div>
      </SectionShell>

      {/*
        The brand's lattice, drawn live rather than laid in as artwork: the
        same diamond weave of the mark that bands the blog cards and the hero
        panel, with the light wandering from one mark to the next for as long
        as the page is open. It stands where a row of claims used to — the
        identity carrying the transition from the mission into the story.
      */}
      <LatticeDivider data-testid="about-lattice" />

      {/* The story, heading beside copy, twice over. */}
      <SectionShell
        data-testid="about-story"
        className="bg-ink"
        innerClassName="flex flex-col gap-16 py-14 lg:gap-24 lg:py-20"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2 className="font-display text-mist text-2xl font-normal sm:text-3xl">
            {t("aboutPage.story.title")}
          </h2>
          <div className="text-mist/75 flex max-w-2xl flex-col gap-5 text-base leading-relaxed text-pretty sm:text-lg">
            <p>{t("aboutPage.story.p1")}</p>
            <p>{t("aboutPage.story.p2")}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <h2 className="font-display text-mist text-2xl font-normal sm:text-3xl">
            {t("aboutPage.argusWhy.title")}
          </h2>
          <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
            {t("aboutPage.argusWhy.body")}
          </p>
        </div>
      </SectionShell>

      {/*
        What drives us, as one statement rather than three cells — filling in
        word by word as it is scrolled through, exactly as the lead statement
        does on the home page: same type, same size, same movement. It keeps
        the story rows' own grid, so the label column reads as part of the
        page's rhythm rather than a heading bolted above a quote; behind the
        text the mark stands at a whisper, the way the wordmark grounds the
        foot of every page.
      */}
      <SectionShell
        data-testid="about-manifesto"
        className="bg-ink"
        innerClassName="py-16 sm:py-24 lg:py-32"
        backdrop={
          <LogoMark className="text-lavender/[0.05] absolute top-1/2 right-[3%] -z-10 hidden w-[24rem] -translate-y-1/2 lg:block" />
        }
      >
        <div className="flex flex-col gap-6">
          <h2 className="eyebrow text-lavender">
            {t("aboutPage.manifesto.title")}
          </h2>

          <p className="text-mist max-w-[52.5rem] text-2xl leading-[1.35] tracking-[-0.02em] text-pretty sm:text-3xl lg:text-[clamp(1.625rem,1.9vw,2rem)]">
            <ScrollFillText>{t("aboutPage.manifesto.body")}</ScrollFillText>
          </p>
        </div>
      </SectionShell>

      {/*
        The ARGUS invitation, closing the page against the footer. The product's
        name is set the way the home page sets "Find what's exploitable." — wide
        tracking, the etched-light fill — so the platform arrives as a quiet
        line of light rather than a label. The glow beneath is the same lavender
        the footer rises out of, so the two read as one ending.
      */}
      <SectionShell
        data-testid="about-cta"
        className="bg-ink"
        innerClassName="flex flex-col items-center gap-7 py-20 text-center sm:py-28"
        backdrop={
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 opacity-35 blur-3xl"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(60% 100% at 50% 100%, #413994 0%, transparent 70%)",
            }}
          />
        }
      >
        <div
          ref={ctaRef}
          className={clsx("flex flex-col items-center gap-7", ctaReveal)}
        >
          <p
            className="font-display bg-clip-text text-xl font-light tracking-[0.5em] text-transparent uppercase sm:text-2xl sm:tracking-[0.6em]"
            style={ETCHED_FILL}
            aria-label="ARGUS"
          >
            Argus
          </p>

          <h2 className="font-display text-mist max-w-3xl text-2xl leading-tight font-normal text-balance sm:text-3xl lg:text-[2.5rem]">
            {t("aboutPage.cta.title")}
          </h2>

          <p className="text-mist/75 max-w-xl text-base leading-relaxed text-pretty">
            {t("aboutPage.cta.body")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <BrandButton
              href={`${site.scannerBaseUrl}/register`}
              data-testid="about-argus-register"
            >
              {t("aboutPage.cta.primary")}
            </BrandButton>

            <BrandButton
              href={site.bookDemoUrl}
              variant="ghost"
              data-testid="about-book-demo"
            >
              {t("nav.bookDemo")}
            </BrandButton>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
