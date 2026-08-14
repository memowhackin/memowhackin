import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { site } from "@/config/site";
import {
  DEFAULT_LOCALE,
  localizedPath,
  SITE_LOCALE,
  SUPPORTED_LANGUAGES,
} from "@/config/locale";

interface SeoOptions {
  /** Page title, already resolved to the active language. */
  title: string;
  /** Meta description, already resolved to the active language. */
  description: string;
  /** Route path, e.g. "/services/api-pentesting" (leading slash, no origin). */
  path: string;
  /** Keep the page out of search results — used by the admin screens. */
  noindex?: boolean;
}

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
export function useSeo({ title, description, path, noindex }: SeoOptions) {
  const { i18n } = useTranslation();
  const language = i18n.language;

  useEffect(() => {
    // Canonical is this language's own URL — pointing every language at the
    // bare path would tell a crawler the translations are not worth indexing.
    const url = new URL(
      localizedPath(SITE_LOCALE, path),
      site.baseUrl,
    ).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta(
      "name",
      "robots",
      noindex === true ? "noindex, nofollow" : "index, follow",
    );
    upsertCanonical(url);
    upsertAlternates(path);

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

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
      publisher: {
        "@type": "Organization",
        name: "AssistSec",
        url: site.baseUrl,
        logo: `${site.baseUrl}/assets/logo-mark.svg`,
      },
    });
  }, [title, description, path, language, noindex]);
}
