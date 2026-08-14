import type { Post } from "../db/schema.js";

/*
 * Responses are built by explicit mapping, never by returning a database row.
 * A row spread straight into JSON leaks whatever column is added next — that is
 * how internal identifiers and moderation flags end up in public payloads. The
 * cost of naming the fields is one line per field, once.
 */

/** What the marketing site consumes — the exact shape its content files use. */
export interface PublicPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  date: string;
  readMinutes: number;
  published: boolean;
  featured: boolean;
  /** Filenames referenced by the body, for the build's image mirror. */
  images: string[];
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

export function toPublicPost(post: Post): PublicPost {
  const published = post.publishedAt ?? post.createdAt;

  return {
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    body: post.body,
    date: published.toISOString().slice(0, 10),
    readMinutes: post.readMinutes,
    published: post.status === "published",
    featured: post.isFeatured,
    images: referencedImages(post.body),
  };
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
