import { useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { RefreshCw } from "lucide-react";
import { SectionShell } from "@/components/common/SectionShell";

/*
 * What a visitor sees when the CMS cannot be reached.
 *
 * Article content is fetched at runtime, so an outage — or a phone that lost
 * signal between pages — makes the route loader throw. Without this the router
 * falls back to its own error screen, which shows a stack trace on a marketing
 * site. Retrying re-runs the loader, and `loadBlogPosts` deliberately does not
 * cache a failure, so the second attempt is a real request.
 */
export function BlogUnavailable() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SectionShell
      data-testid="blog-unavailable"
      className="bg-ink"
      innerClassName="flex flex-col items-center gap-6 py-28 text-center"
    >
      <h1 className="font-display text-mist text-3xl font-normal">
        {t("blog.unavailableTitle")}
      </h1>
      <p className="text-mist/70 max-w-prose">{t("blog.unavailableBody")}</p>
      <button
        type="button"
        onClick={() => void router.invalidate()}
        className="text-lavender hover:text-lavender-soft inline-flex items-center gap-2 transition-colors"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        {t("blog.retry")}
      </button>
    </SectionShell>
  );
}
