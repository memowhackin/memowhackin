import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight, Search } from "lucide-react";
import { BrandWatermark } from "@/components/blog/BrandWatermark";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { PostCover } from "@/components/blog/PostCover";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { useSeo } from "@/localization/useSeo";
import {
  BLOG_CATEGORIES,
  useBlogPosts,
  type BlogCategory,
  type BlogPost,
} from "@/config/blog";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

type Filter = BlogCategory | "all";

/**
 * One article in the archive, as a card.
 *
 * This is the home page teaser's shape: the diamond band across the top, the
 * date as a mono eyebrow, then title, excerpt and the reading cue, on the
 * site's `ink-deep` panel inside an `indigo-deep` hairline. Two departures.
 *
 * The band runs at a third of its height there. On the home page it heads
 * three cards and has room to be the picture; here it heads a whole archive,
 * and at full height a grid of them was all band and no article. Cut down it
 * still signs the card as ours without taking the space the picture needs.
 *
 * The picture is that space: a framed crop of the constellation, different per
 * article (see `PostCover`). It sits inset rather than bleeding to the card's
 * edge so the band above it stays the card's own top edge.
 *
 * Everything below the picture sits on a fixed rhythm so a row lines up
 * across, with the cue pushed to the foot by `flex-1` on the excerpt. Without
 * that, cards of unequal copy hang their links at different heights, which is
 * most of what makes a grid look untidy.
 */
function ArticleCard({ post, index }: { post: BlogPost; index: number }) {
  const { t, i18n } = useTranslation();
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: Math.min(index, 5) * 70,
  });

  const date = new Date(post.date)
    .toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  return (
    /*
     * The whole card is the target: the cue's link is stretched over it, so a
     * tap anywhere opens the article, which is what a card of this shape
     * promises on touch.
     */
    <li
      ref={ref}
      style={style}
      data-testid={`blog-card-${post.slug}`}
      className={clsx(
        "border-indigo-deep bg-ink-deep hover:border-lavender/60 focus-within:border-lavender/60 group relative flex flex-col overflow-hidden rounded-2xl border transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1.5rem_3rem_-1rem_rgba(13,11,33,0.9)]",
        className,
      )}
    >
      <img
        src="/assets/blog-pattern.webp"
        alt=""
        width={488}
        height={84}
        loading="lazy"
        aria-hidden="true"
        /*
         * Held back rather than shrunk further. At full strength a saturated
         * lavender bar ran across the top of every card and was the first
         * thing the eye landed on, ahead of the article. Half-lit and dissolved
         * into the card it still signs the panel as ours and stops competing
         * with the picture below it.
         */
        className="h-9 w-full [mask-image:linear-gradient(to_bottom,black_35%,transparent)] object-cover opacity-50 sm:h-10"
      />

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <PostCover
          slug={post.slug}
          className="border-indigo-deep aspect-video w-full rounded-xl border"
        />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="font-display eyebrow text-lavender">{date}</p>
          <CategoryBadge category={post.category} />
        </div>

        <h3 className="font-display text-mist text-lg leading-snug font-normal text-pretty">
          {post.title}
        </h3>

        <p className="text-mist/70 flex-1 text-sm leading-relaxed text-pretty">
          {post.excerpt}
        </p>

        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          data-testid={`blog-card-${post.slug}-link`}
          className="text-mist hover:text-lavender inline-flex w-fit items-center gap-2 py-1 text-base font-medium transition-colors before:absolute before:inset-0 before:content-['']"
        >
          {t("blog.viewDetails")}
          <ArrowUpRight
            className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </li>
  );
}

function BlogIndex() {
  const { t, i18n } = useTranslation();
  const posts = useBlogPosts();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const { ref: featuredRef, className: featuredReveal } =
    useReveal<HTMLAnchorElement>();

  useSeo({
    title: t("pages.blog.title"),
    description: t("pages.blog.description"),
    path: "/blog",
  });

  const published = useMemo(
    () =>
      [...posts]
        .filter((post) => post.published)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [posts],
  );

  const featured = published.find((post) => post.featured) ?? published[0];

  const filters: readonly Filter[] = ["all", ...BLOG_CATEGORIES];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return published.filter((post) => {
      const matchesFilter = filter === "all" || post.category === filter;
      const matchesQuery =
        needle.length === 0 ||
        post.title.toLowerCase().includes(needle) ||
        post.excerpt.toLowerCase().includes(needle);
      return matchesFilter && matchesQuery;
    });
  }, [published, filter, query]);

  const featuredDate = featured
    ? new Date(featured.date).toLocaleDateString(i18n.language, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    // One ground for the whole page. The glow is a tint over that ground, not a
    // second colour, so the hero flows into the list with no seam.
    <div data-testid="blog-index" className="bg-ink relative">
      <BrandWatermark />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.22) 0%, transparent 68%)",
        }}
      />

      <SectionShell
        data-testid="blog-hero"
        className="bg-transparent"
        innerClassName="flex flex-col gap-6 pt-20 pb-12 sm:pt-28 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pt-32"
      >
        <div className="flex max-w-3xl flex-col gap-5">
          <p className="eyebrow text-lavender">{t("blog.eyebrow")}</p>
          <h1 className="font-display text-mist text-4xl leading-tight font-normal text-balance sm:text-5xl lg:text-6xl">
            {t("blog.pageTitle")}
          </h1>
          <p className="text-mist/70 max-w-2xl text-lg leading-relaxed text-pretty">
            {t("blog.intro")}
          </p>
        </div>

        {/* Search sits with the heading rather than above the list: it acts on
            the whole archive, so it belongs to the page, not to one section. */}
        <label className="relative block w-full lg:max-w-xs">
          <Search
            className="text-mist/40 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={t("blog.searchPlaceholder")}
            data-testid="blog-search"
            className="border-indigo-deep bg-ink-deep/60 text-mist placeholder:text-mist/35 focus:border-lavender w-full rounded-full border py-3 pr-4 pl-11 text-base transition-colors outline-none"
          />
        </label>
      </SectionShell>

      {/*
        The lead article, deliberately not a bigger version of the cards below.
        Where they are a banded panel with a framed picture inside, this one
        drops the band entirely and lets the picture bleed to its own edge
        across a full half of the card, lit harder. Size alone is a weak
        hierarchy: a page where the lead is the same object scaled up still
        reads as a list. A different construction reads as the lead.

        The band is not simply moved here. Turned on its edge it would have to
        cover a column roughly forty pixels wide and the height of the card,
        from a source that is 488 by 84, and the weave came out as unreadable
        blobs. It stays horizontal on the cards, at the size it was drawn.
      */}
      {featured && (
        <SectionShell
          data-testid="blog-featured"
          className="bg-transparent"
          innerClassName="pb-12"
        >
          <Link
            ref={featuredRef}
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            data-testid="blog-featured-link"
            className={clsx(
              "group border-indigo-deep bg-ink-deep hover:border-lavender/55 grid overflow-hidden rounded-3xl border transition-[border-color,box-shadow] duration-300 hover:shadow-[0_2rem_4rem_-1.5rem_rgba(13,11,33,0.9)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]",
              featuredReveal,
            )}
          >
            <div className="relative">
              <PostCover
                slug={featured.slug}
                tone="featured"
                className="h-48 w-full sm:h-64 lg:h-full lg:min-h-[22rem]"
              />
            </div>

            <div className="flex flex-col gap-5 p-7 sm:p-9 lg:p-12">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-lavender text-xs tracking-[0.08em] uppercase">
                  {t("blog.featuredLabel")}
                </span>
                <span className="bg-indigo-deep h-3 w-px" aria-hidden="true" />
                <CategoryBadge category={featured.category} />
                <span className="text-mist/40 text-xs">{featuredDate}</span>
              </div>

              <h2 className="font-display text-mist group-hover:text-lavender text-2xl leading-tight font-normal text-balance transition-colors sm:text-3xl lg:text-4xl lg:leading-[1.15]">
                {featured.title}
              </h2>

              <p className="text-mist/70 text-base leading-relaxed text-pretty">
                {featured.excerpt}
              </p>

              <span className="text-mist group-hover:text-lavender mt-1 inline-flex items-center gap-2 text-base font-medium transition-colors">
                {t("blog.readMore")}
                <ArrowUpRight
                  className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        </SectionShell>
      )}

      <SectionShell
        data-testid="blog-list"
        className="bg-transparent"
        innerClassName="flex flex-col gap-8 pb-16 lg:pb-24"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-mist text-2xl font-normal">
            {t("blog.archiveTitle")}
          </h2>

          <div className="flex flex-wrap gap-2">
            {filters.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setFilter(option);
                }}
                data-testid={`blog-filter-${option}`}
                aria-pressed={filter === option}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  filter === option
                    ? "border-lavender bg-lavender text-ink-deep"
                    : "border-indigo-deep text-mist/60 hover:border-lavender/40 hover:text-mist",
                )}
              >
                {option === "all"
                  ? t("blog.filterAll")
                  : t(`blog.categories.${option}`)}
              </button>
            ))}
          </div>
        </div>

        {visible.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post, index) => (
              <ArticleCard key={post.slug} post={post} index={index} />
            ))}
          </ul>
        ) : (
          <p
            className="text-mist/60 border-indigo-deep border-t py-16 text-center text-base"
            data-testid="blog-empty"
          >
            {t("blog.empty")}
          </p>
        )}
      </SectionShell>

      <ClosingCta />
    </div>
  );
}
