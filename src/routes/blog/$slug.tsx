import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { SectionShell } from "@/components/common/SectionShell";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { useSeo } from "@/localization/useSeo";
import { useBlogPosts } from "@/config/blog";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

/** Same category, newest first, current post excluded, at most this many. */
const MAX_RELATED = 4;

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation();
  const posts = useBlogPosts();
  const post = posts.find((item) => item.slug === slug);

  useSeo({
    title: post ? `${post.title} | AssistSec` : t("pages.blog.title"),
    description: post?.excerpt ?? t("pages.blog.description"),
    path: `/blog/${slug}`,
  });

  const related = useMemo(() => {
    if (!post) return [];
    return posts
      .filter(
        (item) =>
          item.published &&
          item.slug !== post.slug &&
          item.category === post.category,
      )
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, MAX_RELATED);
  }, [posts, post]);

  if (!post) {
    return (
      <SectionShell
        data-testid="blog-post-missing"
        className="bg-ink"
        innerClassName="flex flex-col items-center gap-6 py-28 text-center"
      >
        <h1 className="font-display text-mist text-3xl font-normal">
          {t("blog.notFoundTitle")}
        </h1>
        <Link
          to="/blog"
          className="text-lavender hover:text-lavender-soft inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("blog.backToBlog")}
        </Link>
      </SectionShell>
    );
  }

  const date = new Date(post.date).toLocaleDateString(i18n.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasRelated = related.length > 0;

  return (
    // One ground, hero glow as a tint over it — the header flows into the body
    // with no colour seam, the way the blog index does.
    <article data-testid="blog-post" className="bg-ink relative">
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
        data-testid="blog-post-main"
        innerClassName="pt-14 pb-16 sm:pt-20 lg:pt-24 lg:pb-24"
      >
        {/*
          Article and rail. From `lg` the related posts sit on the right and
          follow the read as a sticky rail; below it, the rail stacks under the
          article. The article column caps at a readable measure either way.
        */}
        <div
          className={clsx(
            hasRelated
              ? "grid gap-12 lg:grid-cols-[minmax(0,44rem)_minmax(0,16rem)] lg:justify-center lg:gap-14 xl:gap-20"
              : "flex justify-center",
          )}
        >
          <div
            className={clsx("min-w-0", !hasRelated && "w-full max-w-[44rem]")}
          >
            <div className="flex flex-col gap-6" data-testid="blog-post-header">
              <Link
                to="/blog"
                className="text-mist/55 hover:text-lavender inline-flex w-fit items-center gap-2 text-sm transition-colors"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                {t("blog.backToBlog")}
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <CategoryBadge category={post.category} />
                <span className="text-mist/45 text-sm">
                  {date} · {t("blog.minRead", { count: post.readMinutes })}
                </span>
              </div>

              <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                {post.title}
              </h1>

              <p className="text-mist/70 text-lg leading-relaxed text-pretty">
                {post.excerpt}
              </p>
            </div>

            <div
              className="blog-content text-mist/85 mt-10 text-base leading-relaxed sm:text-lg"
              data-testid="blog-post-body"
              // The body is our own editor output, written by an authenticated
              // admin — not third-party content — so it is rendered as authored.
              // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

            <Link
              to="/blog"
              data-testid="blog-post-back"
              className="text-lavender hover:text-lavender-soft mt-10 inline-flex w-fit items-center gap-2 text-base font-medium transition-colors"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("blog.backToBlog")}
            </Link>
          </div>

          {hasRelated && (
            <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
              <RelatedPosts posts={related} />
            </aside>
          )}
        </div>
      </SectionShell>

      {/* The site's closing invitation — the same robot-hand call to action the
          home page ends on, so a reader leaves an article the same way. */}
      <ClosingCta />
    </article>
  );
}
