import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { PostCover } from "@/components/blog/PostCover";
import { BrandButton } from "@/components/common/BrandButton";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { useSeo } from "@/localization/useSeo";
import { NAV_ITEMS, type NavDropdown, type NavLeaf } from "@/config/nav";
import { site } from "@/config/site";

interface RoutePageProps {
  /** i18n key under `pages.*` carrying `title`, `description`, `heading`, `body`. */
  pageKey: string;
  /** The route's own path, for the canonical URL and share cards. */
  path: string;
}

/**
 * Where this page sits in the navigation.
 *
 * Read from `NAV_ITEMS` rather than passed in, because the tree already knows:
 * every leaf carries the group it belongs to, a one-line description and an
 * icon, in both languages. That is the whole reason these pages can show more
 * than a heading without anyone writing new copy for ten of them.
 */
function locate(
  path: string,
): { group: NavDropdown; siblings: NavLeaf[] } | null {
  for (const item of NAV_ITEMS) {
    if (item.kind !== "dropdown") continue;

    const leaves = item.groups.flatMap((group) => group.items);
    if (leaves.some((leaf) => leaf.to === path)) {
      return {
        group: item,
        siblings: leaves.filter((leaf) => leaf.to !== path),
      };
    }
  }
  return null;
}

/** One sibling page, as a card. */
function SiblingCard({ leaf, index }: { leaf: NavLeaf; index: number }) {
  const { t } = useTranslation();
  const Icon = leaf.icon;
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: Math.min(index, 4) * 60,
  });

  return (
    <li ref={ref} style={style} className={className}>
      <Link
        to={leaf.to}
        data-testid={`page-more-${leaf.key}`}
        className="group border-indigo-deep bg-ink-deep hover:border-lavender/60 flex h-full flex-col overflow-hidden rounded-2xl border transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1.25rem_2.5rem_-1rem_rgba(13,11,33,0.9)]"
      >
        {/* The same diamond band that heads a blog card, at the same held-back
            strength, so a card from this template belongs to the same set. */}
        <img
          src="/assets/blog-pattern.webp"
          alt=""
          width={488}
          height={84}
          loading="lazy"
          aria-hidden="true"
          className="h-8 w-full [mask-image:linear-gradient(to_bottom,black_35%,transparent)] object-cover opacity-50"
        />

        <span className="flex flex-1 flex-col gap-2 p-5">
          <span className="flex items-center gap-2.5">
            <Icon
              className="text-lavender/70 group-hover:text-lavender size-[1.15rem] shrink-0 transition-colors"
              aria-hidden="true"
            />
            <span className="text-mist group-hover:text-lavender font-medium transition-colors">
              {t(leaf.labelKey)}
            </span>
          </span>
          <span className="text-mist/60 text-sm leading-relaxed text-pretty">
            {t(leaf.descKey)}
          </span>

          {/* Sits at the foot of every card whatever the blurb's length, so a
              row of them lines up instead of hanging its cues at three
              heights. */}
          <ArrowUpRight
            className="text-mist/30 group-hover:text-lavender mt-auto size-4 shrink-0 transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}

/**
 * The shape every service, ARGUS and knowledge-base page takes.
 *
 * It used to render a heading and one sentence and then stop, which left the
 * footer sitting under half a screen of nothing — the pages read as unfinished
 * because there was nothing on them. The copy is unchanged; what is added is
 * built from what already exists: the section this page belongs to, the two
 * actions every one of these pages wants a reader to take, its sibling pages
 * with the blurbs the nav dropdowns already show, and the closing call the rest
 * of the site ends on.
 */
export function RoutePage({ pageKey, path }: RoutePageProps) {
  const { t } = useTranslation();
  const placement = locate(path);

  useSeo({
    title: t(`pages.${pageKey}.title`),
    description: t(`pages.${pageKey}.description`),
    path,
  });

  return (
    <div data-testid={`page-${pageKey}`} className="bg-ink relative">
      {/* The same tinted glow the blog and home pages open on, so a page from
          this template does not read as a different site. */}
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
        data-testid={`page-${pageKey}-hero`}
        innerClassName="flex flex-col items-center gap-6 pt-12 pb-16 text-center sm:pt-16 lg:pt-20 lg:pb-20"
      >
        {placement && (
          /*
            The site's own eyebrow, as the blog and every home section use it.
            A bordered chip was tried here and read worse at this size: uppercase
            tracking adds space after the last letter as well as between them, so
            the label sat visibly left of centre inside its pill, and a lone
            small capsule above a display heading is weaker than the plain mark.
          */
          <p className="eyebrow text-lavender">{t(placement.group.labelKey)}</p>
        )}

        <h1 className="font-display text-mist max-w-4xl text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-5xl">
          {t(`pages.${pageKey}.heading`)}
        </h1>

        <p className="text-mist/75 max-w-2xl text-lg leading-relaxed text-pretty">
          {t(`pages.${pageKey}.body`)}
        </p>

        {/*
          One action, the same one the home hero leads with. A second button
          beside it would be a style this site does not have anywhere else, and
          the closing section already asks again at the foot of the page.
        */}
        <BrandButton
          href={site.bookDemoUrl}
          variant="sweep"
          data-testid="page-book-demo"
          className="mt-2 text-nowrap"
        >
          {t("nav.bookDemo")}
        </BrandButton>
      </SectionShell>

      {/*
        A picture per page, framed from the brand's constellation.
        
        These pages carry no artwork, and ten identical banners would be the
        same template problem the blog cards solved: the crop is derived from
        the page's own key, so every one of them gets a different composition of
        the same graphic and no new asset is needed. It also does the job the
        lattice divider was doing — breaking the page in two — without stacking
        a second decorative band on top of it.
      */}
      <SectionShell
        className="bg-transparent"
        data-testid="page-cover"
        innerClassName="pb-16 lg:pb-24"
      >
        <div className="border-indigo-deep relative overflow-hidden rounded-3xl border">
          <PostCover
            slug={pageKey}
            tone="featured"
            className="h-44 w-full sm:h-56 lg:h-72"
          />
          {/* The panel darkens into the page at its foot, so the picture reads
              as part of the page rather than as a pasted-in rectangle. */}
          <div
            aria-hidden="true"
            className="from-ink absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
          />
        </div>
      </SectionShell>

      {placement && placement.siblings.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="page-more"
          innerClassName="flex flex-col gap-6 pb-16 lg:pb-24"
        >
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("pages.moreIn", { group: t(placement.group.labelKey) })}
          </h2>

          <ul
            className={clsx(
              "grid gap-4 sm:grid-cols-2",
              placement.siblings.length > 4 && "lg:grid-cols-3",
            )}
          >
            {placement.siblings.map((leaf, index) => (
              <SiblingCard key={leaf.key} leaf={leaf} index={index} />
            ))}
          </ul>
        </SectionShell>
      )}

      <ClosingCta />
    </div>
  );
}
