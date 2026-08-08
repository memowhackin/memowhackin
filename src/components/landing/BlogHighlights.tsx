import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";
import { sectionIds, site } from "@/config/site";

const posts = ["rules", "owasp", "compliance"] as const;

/** Latest-articles teaser. Copy is static until a blog API exists. */
export function BlogHighlights() {
  const { t } = useTranslation();

  return (
    <SectionShell
      id={sectionIds.blog}
      data-testid="blog-highlights"
      className="bg-ink"
      innerClassName="flex flex-col gap-10 py-16 sm:py-24 lg:py-28"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-mist text-base tracking-[0.235em] uppercase sm:text-xl">{t("blog.title")}</h2>

        <a
          href={`${site.scannerBaseUrl}/blog`}
          target="_blank"
          rel="noreferrer noopener"
          data-testid="blog-view-all"
          className="text-mist hover:text-lavender inline-flex items-center gap-2 text-base font-medium transition"
        >
          {t("blog.viewAll")}
          <ArrowUpRight className="size-5" aria-hidden="true" />
        </a>
      </div>

      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li
            key={post}
            data-testid={`blog-post-${post}`}
            className="border-indigo-deep bg-ink-deep hover:border-lavender/60 flex flex-col overflow-hidden rounded-2xl border transition"
          >
            <img
              src="/assets/blog-pattern.webp"
              alt=""
              width={488}
              height={84}
              loading="lazy"
              aria-hidden="true"
              className="h-[7.1875rem] w-full object-cover"
            />

            <div className="flex flex-1 flex-col gap-6 px-8 pt-12 pb-10">
              <p className="font-display eyebrow text-lavender">
                {t(`blog.posts.${post}.date`)}
              </p>

              <div className="flex flex-1 flex-col gap-6">
                <h3 className="font-display text-mist text-xl leading-[1.28] font-normal">
                  {t(`blog.posts.${post}.title`)}
                </h3>

                <p className="text-mist/75 flex-1 text-base leading-6">
                  {t(`blog.posts.${post}.excerpt`)}
                </p>
              </div>

              <a
                href={`${site.scannerBaseUrl}/blog`}
                target="_blank"
                rel="noreferrer noopener"
                data-testid={`blog-post-${post}-link`}
                className="text-mist hover:text-lavender inline-flex w-fit items-center gap-2 text-base font-medium transition"
              >
                {t("blog.viewDetails")}
                <ArrowUpRight className="size-5" aria-hidden="true" />
              </a>
            </div>
          </li>
        ))}
      </ul>

      <div className="text-mist/80 flex flex-col gap-6 text-lg leading-[1.4] sm:text-xl">
        <p>{t("blog.outroIntro")}</p>
        <p>
          {t("blog.outroFollow")}{" "}
          <a
            href={site.linkedInUrl}
            target="_blank"
            rel="noreferrer noopener"
            data-testid="blog-linkedin"
            className="font-display text-lavender hover:text-lavender-soft transition"
          >
            {t("blog.linkedIn")}
          </a>
        </p>
      </div>
    </SectionShell>
  );
}
