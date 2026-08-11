import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { site } from "@/config/site";

interface SeoOptions {
  /** Page title, already resolved to the active language. */
  title: string;
  /** Meta description, already resolved to the active language. */
  description: string;
  /** Route path, e.g. "/services/api-pentesting" (leading slash, no origin). */
  path: string;
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
  script.textContent = JSON.stringify(data);
}

/**
 * Publishes a page's SEO surface — title, description, canonical, Open Graph,
 * Twitter card and JSON-LD — and keeps it in sync with the active language.
 */
export function useSeo({ title, description, path }: SeoOptions) {
  const { i18n } = useTranslation();
  const language = i18n.language;

  useEffect(() => {
    const url = new URL(path, site.baseUrl).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertCanonical(url);

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
  }, [title, description, path, language]);
}
