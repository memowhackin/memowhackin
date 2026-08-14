import type { Post } from "../db/schema.js";

/*
 * Responses are built by explicit mapping, never by returning a database row.
 * A row spread straight into JSON leaks whatever column is added next — that is
 * how internal identifiers and moderation flags end up in public payloads. The
 * cost of naming the fields is one line per field, once.
 */

/*
 * The blog index needs to describe every article; only the article page needs
 * one of them in full.
 *
 * These were a single shape, so the list endpoint returned every published
 * post's entire body — the whole blog, rendered HTML and all, downloaded on
 * every visit to /blog and again on every revalidation. Invisible at four
 * posts and a hundred kilobytes at a hundred. The summary is what the list
 * serves; the body is fetched for the one article being read.
 */
export interface PublicPostSummary {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  published: boolean;
  featured: boolean;
  /**
   * Addresses this post used to live at. The site redirects each of them to
   * the current slug, so a link shared before a rename still arrives.
   */
  aliases: string[];
}

/** One article, in full. */
export interface PublicPost extends PublicPostSummary {
  body: string;
}

/** What the admin UI needs. Adds drafts and editing metadata, no user records. */
export interface AdminPost {
  id: string;
  slug: string;
  locale: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  readMinutes: number;
  status: string;
  isFeatured: boolean;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
}

// Legacy bodies stored /media/blog/<file>; both forms name the same upload.
const IMAGE_SRC =
  /src="\/(?:api\/public\/media|media\/blog)\/([a-zA-Z0-9-]+\.webp)"/g;

export function referencedImages(body: string): string[] {
  return [...new Set([...body.matchAll(IMAGE_SRC)].map((match) => match[1]))]
    .filter((name): name is string => name !== undefined)
    .sort();
}

export function toPublicSummary(
  post: Post,
  aliases: readonly string[] = [],
): PublicPostSummary {
  const published = post.publishedAt ?? post.createdAt;

  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    date: published.toISOString().slice(0, 10),
    readMinutes: post.readMinutes,
    published: post.status === "published",
    featured: post.isFeatured,
    aliases: [...aliases],
  };
}

export function toPublicPost(
  post: Post,
  aliases: readonly string[] = [],
): PublicPost {
  return { ...toPublicSummary(post, aliases), body: post.body };
}

export function adminPost(post: Post): AdminPost {
  return {
    id: post.id,
    slug: post.slug,
    locale: post.locale,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    readMinutes: post.readMinutes,
    status: post.status,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    updatedAt: post.updatedAt.toISOString(),
  };
}
