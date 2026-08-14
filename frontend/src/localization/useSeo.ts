import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { site } from "@/config/site";
import {
  DEFAULT_LOCALE,
  localizedPath,
  SITE_LOCALE,
  SUPPORTED_LANGUAGES,
} from "@/config/locale";

interface SeoArticle {
  /** The article's own headline, without the site suffix. */
  headline: string;
  /** ISO date (YYYY-MM-DD) the article was published. */
  publishedAt: string;
  /** First content image, as a root-relative path, when the body has one. */
  image?: string;
}

interface SeoOptions {
  /** Page title, already resolved to the active language. */
  title: string;
  /** Meta description, already resolved to the active language. */
  description: string;
  /** Route path, e.g. "/services/api-pentesting" (leading slash, no origin). */
  path: string;
  /** Keep the page out of search results — used by the admin screens. */
  noindex?: boolean;
  /**
   * Present on blog articles: switches the Open Graph type, adds the article
   * timestamps, and upgrades the JSON-LD from a generic WebPage to a
   * BlogPosting with a breadcrumb — the shape search and answer engines
   * actually use to cite a post.
   */
  article?: SeoArticle;
}

/** Open Graph locale for a supported language. */
const OG_LOCALES: Record<string, string> = { en: "en_US", nl: "nl_NL" };

/** The image an unfurl shows when the page has none of its own. */
const OG_CARD = "/assets/og-card.jpg";

/*
 * This site is client-rendered, so the crawler-facing tags are written into the
 * document head at runtime rather than baked per file. Modern crawlers (Google,
 * Bing) and the generative engines execute the page and read what this sets;
 * `og`/`twitter` cover the social and chat unfurls, the canonical fixes the URL,
 * and the JSON-LD gives machines an explicit description of the page and its
 * publisher instead of leaving them to infer it. For full coverage on engines
 * that do not run scripts, this pairs with pre-rendering at build time.
 */
function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

/*
 * hreflang alternates. Without these, the same page in two languages looks to a
 * search engine like duplicate content and one of them gets dropped; with them,
 * each language is served to the audience that reads it.
 *
 * `x-default` points at the default language, which is what a crawler uses when
 * none of the alternates match the visitor.
 */
function upsertAlternates(path: string) {
  for (const link of document.head.querySelectorAll(
    'link[rel="alternate"][hreflang]',
  )) {
    link.remove();
  }

  const alternates: [string, string][] = SUPPORTED_LANGUAGES.map((locale) => [
    locale,
    new URL(localizedPath(locale, path), site.baseUrl).toString(),
  ]);
  alternates.push([
    "x-default",
    new URL(localizedPath(DEFAULT_LOCALE, path), site.baseUrl).toString(),
  ]);

  for (const [hreflang, href] of alternates) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = hreflang;
    link.href = href;
    document.head.appendChild(link);
  }
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

const JSON_LD_ID = "route-jsonld";

function upsertJsonLd(data: unknown) {
  let script = document.getElementById(JSON_LD_ID);
  if (!script) {
    script = document.createElement("script");
    script.id = JSON_LD_ID;
    script.setAttribute("type", "application/ld+json");
    document.head.appendChild(script);
  }
  /*
   * `<` is escaped so a value containing "</script>" cannot close this block.
   *
   * Assigning textContent is safe in the live DOM — it is never re-parsed. But
   * the build prerenders each route by serialising the DOM to a file, and when
   * a browser later parses that file an unescaped "</script>" ends the JSON-LD
   * early and everything after it becomes live markup. Escaping here keeps the
   * JSON valid while making that impossible.
   */
  script.textContent = JSON.stringify(data).replaceAll("<", "\\u003c");
}

/**
 * Publishes a page's SEO surface — title, description, canonical, Open Graph,
 * Twitter card and JSON-LD — and keeps it in sync with the active language.
 */
export function useSeo({
  title,
  description,
  path,
  noindex,
  article,
}: SeoOptions) {
  const { i18n, t } = useTranslation();
  const language = i18n.language;

  useEffect(() => {
    // Canonical is this language's own URL — pointing every language at the
    // bare path would tell a crawler the translations are not worth indexing.
    const url = new URL(
      localizedPath(SITE_LOCALE, path),
      site.baseUrl,
    ).toString();
    const image = new URL(article?.image ?? OG_CARD, site.baseUrl).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noindex === true ? "noindex, nofollow" : "index, follow",
    );
    upsertCanonical(url);
    upsertAlternates(path);

    upsertMeta("property", "og:type", article ? "article" : "website");
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", image);
    upsertMeta(
      "property",
      "og:locale",
      OG_LOCALES[SITE_LOCALE] ?? OG_LOCALES[DEFAULT_LOCALE] ?? "en_US",
    );
    for (const locale of SUPPORTED_LANGUAGES) {
      if (locale !== SITE_LOCALE) {
        upsertMeta(
          "property",
          "og:locale:alternate",
          OG_LOCALES[locale] ?? locale,
        );
      }
    }
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image);

    if (article) {
      upsertMeta("property", "article:published_time", article.publishedAt);
    } else {
      removeMeta("property", "article:published_time");
    }

    const publisher = {
      "@type": "Organization",
      name: "AssistSec",
      url: site.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${site.baseUrl}/assets/logo-mark.svg`,
      },
    };

    if (article) {
      /*
       * BlogPosting plus the breadcrumb in one @graph. The author is the
       * organisation, deliberately: posts are published under the company
       * name, and inventing a personal author would be the kind of made-up
       * metadata that gets a site distrusted.
       */
      const blogUrl = new URL(
        localizedPath(SITE_LOCALE, "/blog"),
        site.baseUrl,
      ).toString();
      upsertJsonLd({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",
            headline: article.headline,
            description,
            url,
            mainEntityOfPage: url,
            image,
            datePublished: article.publishedAt,
            inLanguage: language,
            author: publisher,
            publisher,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: t("blog.pageTitle"),
                item: blogUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: article.headline,
                item: url,
              },
            ],
          },
        ],
      });
    } else {
      upsertJsonLd({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url,
        inLanguage: language,
        isPartOf: {
          "@type": "WebSite",
          name: "AssistSec",
          url: site.baseUrl,
        },
        publisher,
      });
    }
  }, [title, description, path, language, noindex, article, t]);
}
