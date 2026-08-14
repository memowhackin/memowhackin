import { DEFAULT_LOCALE, SITE_LOCALE } from "@/config/locale";

/*
 * Blog posts, read from the CMS.
 *
 * The backend owns the posts; this fetches them. Nothing about the blog lives
 * in this repository — publishing in the CMS is enough to change the site, with
 * no rebuild, no generated JSON committed to git, and no content to drift out
 * of sync with the database.
 *
 * The prerender pass loads every route in a real browser and waits for the
 * network to settle, so these fetches resolve during the build and the article
 * text ends up in the static HTML a crawler receives. Route loaders (see the
 * blog routes) are what make the router wait rather than paint an empty page.
 */

/*
 * Empty means same-origin: the app requests /api/... and whatever serves the
 * site proxies it to the CMS — nginx in production, the vite dev server
 * locally, and the static servers used for prerendering and e2e. Same-origin
 * everywhere means no CORS to configure and no cross-origin request that a
 * browser can refuse. Set VITE_CMS_API_URL only when the API genuinely lives on
 * another host.
 */
const API_BASE = (import.meta.env.VITE_CMS_API_URL ?? "").replace(/\/+$/, "");

export const BLOG_CATEGORIES = [
  "rnd",
  "vulnerabilityAlerts",
  "news",
  "insideAssistsec",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPost {
  /** The URL-safe id the article is published under. */
  slug: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  /** HTML, sanitized server-side on write. Never sanitized here. */
  body: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  readMinutes: number;
  published: boolean;
  featured: boolean;
}

/*
 * URL-safe anchor ids, used by the article pages to give each heading in a
 * stored body an id the contents rail can link to. Matches the backend's slug
 * rules closely enough for anchors; the backend remains the authority on the
 * slugs articles are published under.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function isBlogPost(value: unknown): value is BlogPost {
  if (typeof value !== "object" || value === null) return false;
  const post = value as Record<string, unknown>;
  return typeof post.slug === "string" && typeof post.title === "string";
}

/*
 * One request per page load, shared by everything that renders on it. The blog
 * index and an article opened from it should not ask the CMS twice, and during
 * prerendering the same promise serves every route in the pass.
 */
let inflight: Promise<readonly BlogPost[]> | undefined;

/*
 * Flipped by `invalidateBlogPosts` and sticky on purpose: it only ever flips
 * in a tab where an admin has just written, and from then on every read in
 * that tab should reflect the latest write. `reload` makes fetch skip the
 * browser's HTTP cache — the list is served with `max-age=60`, so without it
 * a refetch straight after publishing can be answered from cache and hand
 * back the very list the write just outdated.
 */
let bypassHttpCache = false;

async function requestLocale(locale: string): Promise<readonly BlogPost[]> {
  const response = await fetch(
    `${API_BASE}/api/public/posts?locale=${locale}`,
    {
      headers: { accept: "application/json" },
      cache: bypassHttpCache ? "reload" : "default",
    },
  );
  if (!response.ok) throw new Error(`CMS returned ${String(response.status)}`);

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error("CMS did not return a list");

  return payload.filter(isBlogPost);
}

async function requestPosts(): Promise<readonly BlogPost[]> {
  const posts = await requestLocale(SITE_LOCALE);
  if (posts.length > 0 || SITE_LOCALE === DEFAULT_LOCALE) return posts;

  // Nothing written in this language yet. An empty blog reads as broken, so
  // fall back to the default language until a translation exists.
  return requestLocale(DEFAULT_LOCALE);
}

export function loadBlogPosts(): Promise<readonly BlogPost[]> {
  inflight ??= requestPosts().catch((error: unknown) => {
    // Let the next attempt try again rather than caching the failure for the
    // life of the page.
    inflight = undefined;
    throw error;
  });
  return inflight;
}

/**
 * Forget the cached list, so the next read asks the CMS again.
 *
 * The studio and the public site are one single-page app: publishing a post
 * and then following "View blog" is a client-side navigation, and without
 * this the loader would keep serving whatever this tab fetched first — the
 * new article missing from /blog and its /blog/{slug} page reading as not
 * found until a full reload. The CMS client calls this after every write.
 */
export function invalidateBlogPosts(): void {
  inflight = undefined;
  bypassHttpCache = true;
}

export async function loadPostBySlug(
  slug: string,
): Promise<BlogPost | undefined> {
  const posts = await loadBlogPosts();
  return posts.find((post) => post.slug === slug);
}
