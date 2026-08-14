import { useTranslation } from "react-i18next";
import { SectionShell } from "@/components/common/SectionShell";
import { useSeo } from "@/localization/useSeo";

interface RoutePageProps {
  /** i18n key under `pages.*` carrying `title`, `description`, `heading`, `body`. */
  pageKey: string;
  /** The route's own path, for the canonical URL and share cards. */
  path: string;
}

/**
 * A placeholder page: it carries the real SEO surface (title, description,
 * canonical, structured data) and a heading, and nothing else. The design of
 * each page comes later; what ships now is a routable, indexable URL per nav
 * item so the structure and its metadata are in place.
 */
export function RoutePage({ pageKey, path }: RoutePageProps) {
  const { t } = useTranslation();

  useSeo({
    title: t(`pages.${pageKey}.title`),
    description: t(`pages.${pageKey}.description`),
    path,
  });

  return (
    <SectionShell
      data-testid={`page-${pageKey}`}
      className="bg-ink"
      innerClassName="flex flex-col gap-4 py-24 lg:py-32"
    >
      <h1 className="font-display text-mist text-3xl font-normal text-balance sm:text-4xl">
        {t(`pages.${pageKey}.heading`)}
      </h1>
      <p className="text-mist/75 max-w-2xl text-base leading-relaxed text-pretty">
        {t(`pages.${pageKey}.body`)}
      </p>
    </SectionShell>
  );
}
