import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, Link2 } from "lucide-react";
import { BrandWatermark } from "@/components/blog/BrandWatermark";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import { SectionShell } from "@/components/common/SectionShell";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { useReveal } from "@/components/common/useReveal";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { useSeo } from "@/localization/useSeo";
import { BlogUnavailable } from "@/components/blog/BlogUnavailable";
import { loadBlogPosts, slugify, type BlogPost } from "@/config/blog";

export const Route = createFileRoute("/blog/$slug")({
  // Awaited by the router, so the prerender pass captures the article rather
  // than an empty shell.
  loader: () => loadBlogPosts(),
  component: BlogPostPage,
  // A CMS outage is a bad blog page, not a broken site.
  errorComponent: BlogUnavailable,
});

/** The related row always shows three, so it is never left ragged. */
const MAX_RELATED = 3;

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Reads the article's own headings out of the stored HTML and stamps an id on
 * each, so the contents rail has something to link to.
 *
 * The body arrives as a string from the editor, so the ids cannot be authored
 * in the markup. Parsing once here and handing back the rewritten HTML keeps a
 * single source of truth: the rail and the article can never disagree about
 * what the sections are, because both come out of this one pass.
 */
function useArticleOutline(body: string) {
  return useMemo(() => {
    if (typeof DOMParser === "undefined") {
      return { html: body, headings: [] as Heading[] };
    }

    const parsed = new DOMParser().parseFromString(body, "text/html");
    const seen = new Set<string>();

    const headings = [...parsed.body.querySelectorAll("h2, h3")].map(
      (element, index) => {
        const text = element.textContent?.trim() ?? "";
        // Two sections can carry the same wording; the suffix keeps the anchor
        // unique without changing what the reader sees.
        let id = slugify(text) || `section-${(index + 1).toString()}`;
        while (seen.has(id)) id = `${id}-${(index + 1).toString()}`;
        seen.add(id);

        element.id = id;
        // Annotated rather than asserted: the ternary alone widens to `number`,
        // and an assertion would be flagged as redundant.
        const level: 2 | 3 = element.tagName === "H2" ? 2 : 3;
        return { id, text, level };
      },
    );

    return { html: parsed.body.innerHTML, headings };
  }, [body]);
}

/**
 * Which section the reader is in, for the rail's marker.
 *
 * This measures against a reading line a quarter of the way down the viewport
 * rather than watching an IntersectionObserver band. A band has to be wide
 * enough to catch a heading and narrow enough not to catch two, and after a
 * jump from the rail the heading lands exactly at the sticky bar's height plus
 * its scroll margin, which fell a few pixels outside every band worth using.
 * Taking the last heading above the line has no such gap: some heading is
 * always the current one.
 */
function useActiveHeading(headings: readonly Heading[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = document.documentElement.clientHeight * 0.25;

      let current = headings[0].id;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= line) {
          current = heading.id;
        }
      }

      setActive(current);
    };

    // Scroll fires far faster than paint, so readings coalesce onto a frame.
    const onScroll = () => {
      frame ||= requestAnimationFrame(measure);
    };

    frame = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  return active;
}

/**
 * The article's sections, as a rail the reader can jump from.
 *
 * Rendered twice, once per breakpoint: stacked under the article a contents
 * list is no use to anyone, so on narrow screens it sits above the body inside
 * the article column, and from `lg` it moves into the sticky rail. Only one is
 * ever displayed. It carries `aria-label` rather than `aria-labelledby` so the
 * two copies cannot collide over an id.
 */
function ArticleContents({
  headings,
  activeId,
  className,
  testId,
}: {
  headings: readonly Heading[];
  activeId: string | null;
  className?: string;
  testId: string;
}) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("blog.tocTitle")}
      data-testid={testId}
      className={className}
    >
      <span className="text-lavender/90 block text-[0.8125rem] font-semibold tracking-[0.14em] uppercase">
        {t("blog.tocTitle")}
      </span>

      {/*
        The rail is one hairline with a lit segment on it, rather than a border
        per item: a full-height line reads as the article's spine, and the
        active section is the part of it catching light.
      */}
      <ul className="border-indigo-deep mt-4 flex flex-col border-l">
        {headings.map((heading) => {
          const active = heading.id === activeId;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                data-testid={`blog-toc-${heading.id}`}
                aria-current={active ? "true" : undefined}
                onClick={(event) => {
                  const target = document.getElementById(heading.id);
                  // No target means the body changed under us; let the browser
                  // deal with the bare hash rather than swallowing the click.
                  if (!target) return;

                  /*
                   * The jump is driven here rather than left to the anchor:
                   * the router's scroll handling reaches the click first and
                   * the hash lands without the page moving. `scrollIntoView`
                   * with no argument keeps CSS in charge, so it honours both
                   * the heading's scroll margin and the reduced-motion rule
                   * that turns smooth scrolling off.
                   */
                  event.preventDefault();
                  target.scrollIntoView();

                  // Replace rather than push, so the back button leaves the
                  // article instead of walking back up its own sections.
                  window.history.replaceState(null, "", `#${heading.id}`);
                }}
                className={clsx(
                  "-ml-px block border-l py-2.5 text-[0.9375rem] leading-snug text-pretty transition-colors",
                  heading.level === 3 ? "pr-3 pl-7" : "pr-3 pl-4",
                  active
                    ? "border-lavender text-lavender font-medium"
                    : "text-mist/65 hover:text-mist border-transparent hover:border-lavender/40",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** The subscribe block that sits under the contents in the rail. */
function SubscribeCard() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div
      data-testid="blog-subscribe"
      className="border-indigo-deep bg-ink-deep/70 flex flex-col gap-3 rounded-2xl border p-5"
    >
      <h2 className="font-display text-mist text-base font-normal">
        {t("blog.newsletter.title")}
      </h2>

      {sent ? (
        <p className="text-lavender flex items-center gap-2 text-sm">
          <Check className="size-4 shrink-0" aria-hidden="true" />
          {t("blog.newsletter.success")}
        </p>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <label className="sr-only" htmlFor="blog-subscribe-email">
            {t("blog.newsletter.placeholder")}
          </label>
          <input
            id="blog-subscribe-email"
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            placeholder={t("blog.newsletter.placeholder")}
            /*
             * Padding and height taken from the button's own `sm` preset
             * rather than set by eye, so the two line up by construction.
             * The radius is the one thing not taken from it: `rounded-selector`
             * is 40px, which on a 43px control is a full pill, and this card
             * sits among square-ish fields everywhere else.
             */
            className="border-indigo-deep bg-ink field-sheen text-mist placeholder:text-mist/35 focus:border-lavender/60 min-h-10 w-full rounded-lg border px-3 py-2.5 text-sm leading-normal transition-colors outline-none"
          />
          {/*
            `sm` and `ghost`, not the default solid `md`. At `md` the button
            stood ten pixels taller than the field above it and carried a size
            larger of type, so the two read as parts of different forms; and a
            filled lavender block that size, in a rail this narrow, was the
            loudest thing on the page next to the article itself.
          */}
          <button
            type="submit"
            className={brandButtonClass({
              variant: "ghost",
              size: "sm",
              // Flagged important: the variant also sets a radius, and two
              // single-class rules of equal weight are settled by sheet order.
              className: "w-full justify-center rounded-lg!",
            })}
          >
            {t("blog.newsletter.submit")}
          </button>
        </form>
      )}
    </div>
  );
}

/**
 * Share controls for the article.
 *
 * Squared rather than round and set tight together, so the pair reads as one
 * control rather than as loose buttons. There is no X here: the company has no
 * account on it, and a share button that posts into nothing is worse than no
 * button.
 * The label is dropped: the glyphs say what they are, and an uppercase "SHARE"
 * competing with the byline opposite added noise to no end. Copying reports
 * back in place, which is the only one of the three with no window of its own
 * to confirm it worked.
 */
function ShareRow() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const url = typeof window === "undefined" ? "" : window.location.href;
  const actionClass =
    "text-mist/60 hover:text-lavender hover:bg-lavender/10 grid size-9 place-items-center rounded-md transition-colors";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard access is permission gated; the address bar is the fallback.
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {copied && (
        <span className="text-lavender mr-1 text-xs" role="status">
          {t("blog.copied")}
        </span>
      )}

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={t("blog.shareLinkedin")}
        title={t("blog.shareLinkedin")}
        className={actionClass}
      >
        {/* lucide dropped its brand icons, so this one is drawn here to match
            the weight of the lucide icon beside it. */}
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM2.4 21.5h5.16V9.75H2.4V21.5Zm7.9-11.75h4.95v1.61h.07c.69-1.24 2.37-2.05 4.06-2.05 4.34 0 5.14 2.66 5.14 6.12v6.07h-5.15v-5.38c0-1.28-.02-2.93-1.87-2.93-1.87 0-2.16 1.4-2.16 2.84v5.47H10.3V9.75Z"
          />
        </svg>
      </a>

      <button
        type="button"
        onClick={() => void copy()}
        aria-label={t("blog.copyLink")}
        title={t("blog.copyLink")}
        className={actionClass}
      >
        {copied ? (
          <Check className="text-lavender size-4" aria-hidden="true" />
        ) : (
          <Link2 className="size-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/** A related article, in the shape the home page teasers use. */
function RelatedCard({ post, index }: { post: BlogPost; index: number }) {
  const { i18n } = useTranslation();
  const { ref, className, style } = useReveal<HTMLLIElement>({
    delay: index * 80,
  });

  const date = new Date(post.date).toLocaleDateString(i18n.language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li ref={ref} style={style} className={className}>
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        data-testid={`blog-more-${post.slug}`}
        className="group border-indigo-deep bg-ink-deep hover:border-lavender/60 flex h-full flex-col overflow-hidden rounded-2xl border transition-[border-color,transform] duration-300 hover:-translate-y-1"
      >
        <img
          src="/assets/blog-pattern.webp"
          alt=""
          width={488}
          height={84}
          loading="lazy"
          aria-hidden="true"
          className="h-20 w-full object-cover sm:h-24"
        />

        <div className="flex flex-1 flex-col gap-3 p-5">
          <CategoryBadge category={post.category} className="w-fit" />

          <h3 className="text-mist group-hover:text-lavender text-base leading-snug font-medium text-pretty transition-colors">
            {post.title}
          </h3>

          <p className="text-mist/60 line-clamp-2 text-sm leading-relaxed text-pretty">
            {post.excerpt}
          </p>

          <span className="text-mist/40 mt-auto pt-2 text-xs">{date}</span>
        </div>
      </Link>
    </li>
  );
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation();
  const posts = Route.useLoaderData();
  const post = posts.find((item) => item.slug === slug);

  const { html, headings } = useArticleOutline(post?.body ?? "");
  const activeId = useActiveHeading(headings);

  useSeo({
    title: post ? `${post.title} | AssistSec` : t("pages.blog.title"),
    description: post?.excerpt ?? t("pages.blog.description"),
    path: `/blog/${slug}`,
  });

  const related = useMemo(() => {
    if (!post) return [];
    const sameCategory = posts.filter(
      (item) =>
        item.published &&
        item.slug !== post.slug &&
        item.category === post.category,
    );
    // Topped up from the rest of the blog so a thin category still fills the row.
    const rest = posts.filter(
      (item) =>
        item.published &&
        item.slug !== post.slug &&
        item.category !== post.category,
    );
    return [...sameCategory, ...rest]
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

  return (
    <article data-testid="blog-post" className="bg-ink relative">
      <BrandWatermark />

      {/* Hero glow as a tint over the one ground, so there is no colour seam. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(96,70,202,0.22) 0%, transparent 70%)",
        }}
      />

      <SectionShell
        className="bg-transparent"
        data-testid="blog-post-main"
        innerClassName="pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24"
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,44rem)_minmax(0,16rem)] lg:justify-center lg:gap-14 xl:gap-20">
          <div className="flex min-w-0 flex-col gap-6">
            <nav
              aria-label="Breadcrumb"
              className="text-mist/45 flex items-center gap-2 text-sm"
            >
              <Link
                to="/blog"
                className="hover:text-lavender transition-colors"
              >
                {t("blog.breadcrumbHome")}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-mist/70">
                {t(`blog.categories.${post.category}`)}
              </span>
            </nav>

            <div className="flex flex-col gap-5">
              <CategoryBadge category={post.category} className="w-fit" />

              <h1 className="font-display text-mist text-3xl leading-tight font-normal text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
                {post.title}
              </h1>

              <p className="text-mist/70 text-lg leading-relaxed text-pretty">
                {post.excerpt}
              </p>
            </div>

            <div className="border-indigo-deep flex flex-wrap items-center justify-between gap-4 border-y py-4">
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-mist text-sm font-medium">
                  {t("blog.byline")}
                </span>
                <span className="text-mist/45 text-xs">{date}</span>
              </span>

              <ShareRow />
            </div>

            {/*
              Posts carry no image of their own, so the brand's constellation
              stands in. It is a real image and crops to any ratio, where the
              diamond band is 488x84 and would have to be blown up fivefold to
              fill a 16:9 frame. The band stays on the cards below, which show
              it at its own height.
            */}
            <div className="border-indigo-deep relative aspect-video overflow-hidden rounded-2xl border">
              <img
                src="/assets/constellation.webp"
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full scale-110 object-cover object-[30%_45%]"
              />
              <div
                aria-hidden="true"
                className="from-ink-deep via-ink-deep/20 absolute inset-0 bg-gradient-to-t to-transparent"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(70%_60%_at_30%_45%,color-mix(in_oklab,var(--color-indigo-bright)_28%,transparent),transparent_70%)]"
              />
            </div>

            {headings.length > 0 && (
              <ArticleContents
                headings={headings}
                activeId={activeId}
                testId="blog-toc-inline"
                className="mt-2 lg:hidden"
              />
            )}

            <div
              className="blog-content text-mist/85 mt-4 text-base leading-relaxed sm:text-lg"
              data-testid="blog-post-body"
              // The body is our own editor output, written by an authenticated
              // admin rather than third-party content, so it renders as authored.
              // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <Link
              to="/blog"
              data-testid="blog-post-back"
              className="text-lavender hover:text-lavender-soft mt-4 inline-flex w-fit items-center gap-2 text-base font-medium transition-colors"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {t("blog.backToBlog")}
            </Link>
          </div>

          {/*
            The rail follows the read from `lg` up and stacks under the article
            below it, where a sticky column would eat the viewport.
          */}
          <aside className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            {headings.length > 0 && (
              <ArticleContents
                headings={headings}
                activeId={activeId}
                testId="blog-toc"
                className="hidden lg:block"
              />
            )}
            <SubscribeCard />
          </aside>
        </div>
      </SectionShell>

      {related.length > 0 && (
        <SectionShell
          className="bg-transparent"
          data-testid="blog-post-more"
          innerClassName="pb-16 lg:pb-24"
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-mist text-2xl font-normal">
                {t("blog.moreTitle")}
              </h2>
              <Link
                to="/blog"
                className="text-lavender hover:text-lavender-soft inline-flex items-center gap-2 text-sm font-medium transition-colors"
              >
                {t("blog.viewAll")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <RelatedCard key={item.slug} post={item} index={index} />
              ))}
            </ul>
          </div>
        </SectionShell>
      )}

      <ClosingCta />
    </article>
  );
}
