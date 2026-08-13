import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import type { BlogPost } from "@/config/blog";

interface RelatedPostsProps {
  posts: readonly BlogPost[];
}

/**
 * The "related posts" rail: compact cards for other articles in the same
 * category. No pattern band or badge here — the pieces are small and share the
 * current post's category, so the type carries them.
 */
export function RelatedPosts({ posts }: RelatedPostsProps) {
  const { t, i18n } = useTranslation();

  return (
    <div data-testid="blog-related" className="flex flex-col gap-4">
      <h2 className="font-display text-mist text-lg font-normal">
        {t("blog.relatedTitle")}
      </h2>

      <ul className="flex flex-col gap-3">
        {posts.map((post) => {
          const date = new Date(post.date).toLocaleDateString(i18n.language, {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <li key={post.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                data-testid={`blog-related-${post.slug}`}
                className="group border-indigo-deep bg-ink-deep/60 hover:border-lavender/50 block rounded-xl border p-4 transition-colors"
              >
                <h3 className="text-mist group-hover:text-lavender line-clamp-2 text-sm leading-snug font-medium text-pretty transition-colors">
                  {post.title}
                </h3>
                <span className="text-mist/40 mt-2 block text-xs">
                  {date} · {t("blog.minRead", { count: post.readMinutes })}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
