import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import type { BlogPost } from "@/config/blog";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { useReveal } from "@/components/common/useReveal";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

/**
 * One article teaser: a dark, lavender-edged panel that lifts on hover, opening
 * on the category badge and closing on the date and a read-more affordance. No
 * decorative band — the type carries it.
 */
export function BlogCard({ post, index }: BlogCardProps) {
  const { t, i18n } = useTranslation();
  const {
    ref: revealRef,
    className: revealClassName,
    style: revealStyle,
  } = useReveal<HTMLLIElement>({ delay: index * 80 });

  const date = new Date(post.date).toLocaleDateString(i18n.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <li
      ref={revealRef}
      style={revealStyle}
      data-testid={`blog-card-${post.slug}`}
      className={clsx(
        "border-indigo-deep bg-ink-deep hover:border-lavender/60 focus-within:border-lavender/60 relative flex flex-col gap-4 rounded-2xl border p-6 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1.5rem_3rem_-1rem_rgba(13,11,33,0.9)] sm:p-7",
        revealClassName,
      )}
    >
      <CategoryBadge category={post.category} className="self-start" />

      <h3 className="font-display text-mist group-hover:text-lavender text-lg leading-snug font-normal text-pretty sm:text-xl">
        {post.title}
      </h3>

      <p className="text-mist/65 line-clamp-3 flex-1 text-base leading-relaxed text-pretty">
        {post.excerpt}
      </p>

      <div className="border-indigo-deep/70 mt-1 flex items-center justify-between border-t pt-4">
        <span className="text-mist/40 text-xs">{date}</span>
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          data-testid={`blog-card-${post.slug}-link`}
          className="text-mist hover:text-lavender group/link inline-flex items-center gap-1.5 text-sm font-medium transition-colors before:absolute before:inset-0 before:content-['']"
        >
          {t("blog.readMore")}
          <ArrowUpRight
            className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </li>
  );
}
