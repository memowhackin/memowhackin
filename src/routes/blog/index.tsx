import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight, Search } from "lucide-react";
import { BlogCard } from "@/components/blog/BlogCard";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { LogoMark } from "@/components/common/Logo";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { useSeo } from "@/localization/useSeo";
import {
  BLOG_CATEGORIES,
  useBlogPosts,
  type BlogCategory,
} from "@/config/blog";

export const Route = createFileRoute("/blog/")({
  component: BlogIndex,
});

type Filter = BlogCategory | "all";

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

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    // One ground for the whole page. The glow is a tint over that ground, not a
    // second colour, so the hero flows into the list with no seam.
    <div data-testid="blog-index" className="bg-ink relative">
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
        innerClassName="flex max-w-3xl flex-col gap-5 pt-20 pb-10 sm:pt-28 lg:pt-32"
      >
        <p className="eyebrow text-lavender">{t("blog.eyebrow")}</p>
        <h1 className="font-display text-mist text-4xl leading-tight font-normal text-balance sm:text-5xl lg:text-6xl">
          {t("blog.pageTitle")}
        </h1>
        <p className="text-mist/70 max-w-2xl text-lg leading-relaxed text-pretty">
          {t("blog.intro")}
        </p>
      </SectionShell>

      {/* The lead article, pattern-free: a gradient panel carried by its type,
          with the brand mark set at a whisper in the corner. */}
      {featured && (
        <SectionShell
          data-testid="blog-featured"
          className="bg-transparent"
          innerClassName="pb-4"
        >
          <Link
            ref={featuredRef}
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            data-testid="blog-featured-link"
            className={clsx(
              "group border-indigo-deep from-indigo-deep/45 via-ink-deep to-ink-deep hover:border-lavender/55 relative block overflow-hidden rounded-3xl border bg-gradient-to-br p-8 transition-[border-color,box-shadow] duration-300 hover:shadow-[0_2rem_4rem_-1.5rem_rgba(13,11,33,0.9)] sm:p-10 lg:p-14",
              featuredReveal,
            )}
          >
            <LogoMark
              className="text-lavender/[0.06] pointer-events-none absolute -right-12 -bottom-16 hidden w-80 sm:block"
              aria-hidden="true"
            />

            <div className="relative flex max-w-2xl flex-col gap-5">
              <div className="flex flex-wrap items-center gap-3">
                <CategoryBadge category={featured.category} />
                <span className="text-mist/40 text-xs">
                  {formatDate(featured.date)} ·{" "}
                  {t("blog.minRead", { count: featured.readMinutes })}
                </span>
              </div>

              <h2 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {featured.title}
              </h2>

              <p className="text-mist/70 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
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
        innerClassName="flex flex-col gap-8 py-12 lg:py-16"
      >
        <div className="flex flex-col gap-5">
          <label className="relative block max-w-md">
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
              className="border-lavender/25 bg-indigo-deep/40 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-full border py-3 pr-4 pl-11 text-base transition-colors outline-none focus:ring-2"
            />
          </label>

          {/* Category filter as pill badges — active one filled. */}
          <div className="flex flex-wrap gap-2">
            {filters.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setFilter(option);
                }}
                data-testid={`blog-filter-${option}`}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  filter === option
                    ? "border-lavender bg-lavender text-ink-deep"
                    : "border-indigo-deep bg-ink-deep/50 text-mist/60 hover:border-lavender/40 hover:text-mist",
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
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} />
            ))}
          </ul>
        ) : (
          <p
            className="text-mist/60 py-12 text-center text-base"
            data-testid="blog-empty"
          >
            {t("blog.empty")}
          </p>
        )}
      </SectionShell>
    </div>
  );
}
