import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { BrandButton } from "@/components/common/BrandButton";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { PageLinkCard } from "@/components/common/PageLinkCard";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { ArgusSectionBlock } from "@/components/argus/ArgusSections";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavLeaf } from "@/config/nav";
import type { ArgusFeature } from "@/config/argus";
import { SERVICE_AREA_SERVED } from "@/config/services";
import { site } from "@/config/site";

/** The pages this one hands the reader on to, resolved out of the nav tree. */
function relatedLeaves(paths: readonly string[]): NavLeaf[] {
  const leaves = NAV_ITEMS.flatMap((item) =>
    item.kind === "dropdown" ? item.groups.flatMap((group) => group.items) : [],
  );

  return paths.flatMap((path) => leaves.filter((leaf) => leaf.to === path));
}

/**
 * One feature of the platform, as a page.
 *
 * The hero and the closing are fixed, because a reader arriving cold needs the
 * same two things on every page: what this is, and a way to ask about it.
 * Everything between them is composed per feature (see `ARGUS_FEATURES`), so
 * the scanning page argues from a calendar, the retest page follows a single
 * finding, and the integrations page is organised by destination, without any
 * of them borrowing a shape that does not fit.
 */
export function ArgusPage({ feature }: { feature: ArgusFeature }) {
  const { t } = useTranslation();
  const related = relatedLeaves(feature.related);
  const { ref: heroRef, className: heroReveal } = useReveal<HTMLDivElement>();
  const { ref: endRef, className: endReveal } = useReveal<HTMLDivElement>();

  const serviceSchema = useMemo(
    () => ({
      name: `ARGUS ${t(`pages.${feature.pageKey}.heading`)}`,
      serviceType: "Continuous security validation platform",
      areaServed: SERVICE_AREA_SERVED,
    }),
    [feature, t],
  );

  useSeo({
    title: t(`pages.${feature.pageKey}.title`),
    description: t(`pages.${feature.pageKey}.description`),
    path: feature.path,
    service: serviceSchema,
  });

  const base = `argusPages.${feature.key}`;

  return (
    <div data-testid={`argus-${feature.key}`} className="bg-ink relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.2) 0%, transparent 68%)",
        }}
      />

      <SectionShell
        className="bg-transparent"
        data-testid={`argus-${feature.key}-hero`}
        innerClassName="flex flex-col items-center gap-6 pt-12 pb-16 text-center sm:pt-16 lg:pt-20 lg:pb-24"
      >
        <div
          ref={heroRef}
          className={clsx("flex flex-col items-center gap-6", heroReveal)}
        >
          {/*
            The product's name over the feature's, set the way the about page
            sets it: wide tracking, upper case, quiet. It is the one thing all
            six pages share, and putting it inside each heading would spend six
            H1s saying ARGUS six times.
          */}
          <p
            className="font-display text-lavender/80 text-sm font-light tracking-[0.5em] uppercase"
            aria-label="ARGUS"
          >
            Argus
          </p>

          <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
            {t(`${base}.hero.title`)}
          </h1>

          <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
            {t(`${base}.hero.body`)}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
            <BrandButton
              href={site.bookDemoUrl}
              variant="sweep"
              data-testid="page-book-demo"
              className="text-nowrap"
            >
              {t(`${base}.hero.primary`)}
            </BrandButton>

            {feature.secondaryCta && (
              /*
                A router link rather than a `BrandButton`: that component is an
                `<a href>` that opens a new tab, and an internal destination has
                to go through the router or the Dutch build walks out of its own
                `/nl` prefix. The look comes from the shared class list.
              */
              <Link
                to="/contact"
                data-testid={`argus-${feature.key}-secondary`}
                className={brandButtonClass({
                  variant: "ghost",
                  className: "text-nowrap",
                })}
              >
                {t(`${base}.hero.secondary`)}
              </Link>
            )}
          </div>
        </div>
      </SectionShell>

      {feature.sections.map((section) => (
        <ArgusSectionBlock
          key={`${section.kind}-${section.key}`}
          page={feature.key}
          section={section}
        />
      ))}

      <SectionShell
        className="bg-transparent"
        data-testid={`argus-${feature.key}-closing`}
        innerClassName="pb-16 lg:pb-24"
      >
        <div
          ref={endRef}
          className={clsx(
            "mx-auto flex max-w-2xl flex-col items-center gap-5 text-center",
            endReveal,
          )}
        >
          <h2 className="font-display text-mist text-2xl font-normal text-balance sm:text-3xl">
            {t(`${base}.closing.title`)}
          </h2>

          <p className="text-mist/75 text-base leading-relaxed text-pretty sm:text-lg">
            {t(`${base}.closing.body`)}
          </p>

          <BrandButton
            href={site.bookDemoUrl}
            data-testid={`argus-${feature.key}-closing-cta`}
            className="w-fit"
          >
            {t(`${base}.hero.primary`)}
          </BrandButton>
        </div>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid={`argus-${feature.key}-related`}
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("argusPages.labels.related")}
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((leaf, index) => (
              <PageLinkCard key={leaf.key} leaf={leaf} index={index} />
            ))}
          </ul>
        </SectionShell>
      )}

      <ClosingCta />
    </div>
  );
}
