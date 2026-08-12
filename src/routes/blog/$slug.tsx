import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { SectionShell } from "@/components/common/SectionShell";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { useSeo } from "@/localization/useSeo";
import { getPostBySlug } from "@/config/blog";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation();
  const post = getPostBySlug(slug);

  useSeo({
    title: post ? `${post.title} | AssistSec` : t("pages.blog.title"),
    description: post?.excerpt ?? t("pages.blog.description"),
    path: `/blog/${slug}`,
  });

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
        data-testid="blog-post-header"
        innerClassName="pt-14 pb-8 sm:pt-20 lg:pt-24"
      >
        <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-6">
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
      </SectionShell>

      <SectionShell
        className="bg-transparent"
        data-testid="blog-post-body"
        innerClassName="pb-16 lg:pb-24"
      >
        <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-10">
          <div
            className="blog-content text-mist/85 text-base leading-relaxed sm:text-lg"
            // The body is our own editor output, written by an authenticated
            // admin — not third-party content — so it is rendered as authored.
            // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <Link
            to="/blog"
            data-testid="blog-post-back"
            className="text-lavender hover:text-lavender-soft inline-flex w-fit items-center gap-2 text-base font-medium transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t("blog.backToBlog")}
          </Link>
        </div>
      </SectionShell>

      {/* The site's closing invitation — the same robot-hand call to action the
          home page ends on, so a reader leaves an article the same way. */}
      <ClosingCta />
    </article>
  );
}
