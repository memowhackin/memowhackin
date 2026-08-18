import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useReveal } from "@/components/common/useReveal";
import type { NavLeaf } from "@/config/nav";

interface PageLinkCardProps {
  /** The destination, taken straight from the navigation tree. */
  leaf: NavLeaf;
  /** Position in its row, for the stagger. */
  index: number;
}

/**
 * A link to another page of the site, as a card.
 *
 * Built from a `NavLeaf` rather than from props of its own, because the nav tree
 * already carries everything a card needs — the label, a one-line blurb and an
 * icon, in every language. That is what lets a page offer its neighbours without
 * anybody writing copy for the tenth time, and it means a renamed page cannot
 * leave a stale card behind.
 *
 * It lives here rather than inside `RoutePage` because two templates now hand
 * readers on to other pages — the generic one and the service pages — and the
 * card being in one of them is how the two slowly stop matching.
 */
export function PageLinkCard({ leaf, index }: PageLinkCardProps) {
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
