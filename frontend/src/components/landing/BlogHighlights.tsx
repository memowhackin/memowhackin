import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import { SectionBadge } from "@/components/common/SectionBadge";
import { SectionShell } from "@/components/common/SectionShell";
import { useReveal } from "@/components/common/useReveal";
import { sectionIds, site } from "@/config/site";
import { latestPosts } from "@/components/landing/latestPosts";
import type { BlogSummary } from "@/config/blog";

/** One teaser card. Split out so each can hold its own reveal state. */
function BlogCard({ post, index }: { post: BlogSummary; index: number }) {
  const { t, i18n } = useTranslation();
  const {
    ref: revealRef,
    className: revealClassName,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay: index * 90 });

  /*
   * Formatted here rather than stored: the CMS gives an ISO date, and the two
   * language builds spell a date differently. The same call, options and
   * uppercasing as the blog index's own cards, so an article's date reads the
   * same on the home page as on the page it links to.
   */
  const date = new Date(post.date)
    .toLocaleDateString(i18n.language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  return (
    /*
     * The whole card is the target: the "View details" link is stretched
     * over it so a tap anywhere opens the article, which is what a card
     * of this shape promises on touch.
     */
    <li
      ref={revealRef}
      style={revealStyle}
      data-testid={`blog-post-${post.slug}`}
      className={clsx(
        "border-indigo-deep bg-ink-deep hover:border-lavender/60 focus-within:border-lavender/60 relative flex flex-col overflow-hidden rounded-2xl border transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1.5rem_3rem_-1rem_rgba(13,11,33,0.9)]",
        revealClassName,
      )}
    >
      <img
        src="/assets/blog-pattern.webp"
        alt=""
        width={488}
        height={84}
        loading="lazy"
        aria-hidden="true"
        className="h-20 w-full object-cover sm:h-24 lg:h-28"
      />

      <div className="flex flex-1 flex-col gap-5 p-6 sm:p-7 lg:pt-8">
        <p className="font-display eyebrow text-lavender">{date}</p>

        <h3 className="font-display text-mist text-lg leading-snug font-normal text-pretty sm:text-xl">
          {post.title}
        </h3>

        <p className="text-mist/75 flex-1 text-base leading-relaxed text-pretty">
          {post.excerpt}
        </p>

        {/*
          A router link to the article on this site, not an `<a href>` to the
          scanner app's blog. The articles live here now, and every `Link` is
          written without a language prefix so the Dutch build resolves its own
          `/nl/blog/...` without this component knowing which build it is in.
        */}
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          data-testid={`blog-post-${post.slug}-link`}
          className="text-mist hover:text-lavender group inline-flex w-fit items-center gap-2 py-1 text-base font-medium transition-colors before:absolute before:inset-0 before:content-['']"
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

/**
 * Latest-articles teaser: the three newest published posts, newest first.
 *
 * The posts arrive as a prop rather than being fetched here. The home route's
 * loader reads them (see `routes/index.tsx`), which is what makes the router
 * wait rather than paint an empty grid, and what puts real article titles into
 * the prerendered HTML a crawler receives. It also keeps this component out of
 * the short list of files that touch the network.
 *
 * An empty list is a normal state, not a failure: the CMS is unreachable during
 * `docker compose build`, and the loader deliberately degrades to no posts
 * rather than taking the whole landing page down with it. The section still
 * renders its badge, its way through to the blog and its closing copy; only the
 * grid drops out, so the page has no hole in it.
 */
export function BlogHighlights({ posts }: { posts: readonly BlogSummary[] }) {
  const { t } = useTranslation();

  // Newest first, published only, capped at three. See `latestPosts` for why
  // the rule lives in its own module and what a same-day tie does.
  const latest = useMemo(() => latestPosts(posts), [posts]);

  return (
    <SectionShell
      id={sectionIds.blog}
      data-testid="blog-highlights"
      className="bg-ink"
      innerClassName="flex flex-col gap-10 py-16 sm:py-24 lg:py-28"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionBadge data-testid="blog-highlights-badge">
          {t("blog.title")}
        </SectionBadge>

        <Link
          to="/blog"
          data-testid="blog-view-all"
          className="text-mist hover:text-lavender group inline-flex items-center gap-2 py-1 text-base font-medium transition-colors pointer-coarse:min-h-11"
        >
          {t("blog.viewAll")}
          <ArrowUpRight
            className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>

      {latest.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </ul>
      )}

      <div className="text-mist/80 flex max-w-3xl flex-col gap-6 text-lg leading-[1.45] text-pretty sm:text-xl">
        <p>{t("blog.outroIntro")}</p>
        <p>
          {t("blog.outroFollow")}{" "}
          <a
            href={site.linkedInUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="blog-linkedin"
            className="font-display text-lavender hover:text-lavender-soft transition-colors"
          >
            {t("blog.linkedIn")}
          </a>
        </p>
      </div>
    </SectionShell>
  );
}
