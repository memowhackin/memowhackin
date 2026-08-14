import { useTranslation } from "react-i18next";
import clsx from "clsx";
import type { BlogCategory } from "@/config/blog";

interface CategoryBadgeProps {
  category: BlogCategory;
  className?: string;
}

/** A small lavender pill naming an article's category. */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const { t } = useTranslation();

  return (
    <span
      className={clsx(
        "border-lavender/25 bg-lavender/10 text-lavender inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.06em] uppercase",
        className,
      )}
    >
      {t(`blog.categories.${category}`)}
    </span>
  );
}
