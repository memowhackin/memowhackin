import { createHash } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/client.js";
import { postSlugs, posts } from "../db/schema.js";
import { publicLimiter } from "../auth/rateLimit.js";
import { localeQuery } from "../http/params.js";
import { mediaPath } from "./media.js";
import {
  toPublicPost,
  toPublicSummary,
  type PublicPostSummary,
} from "./serialize.js";
import { safeSlug } from "./slug.js";

/*
 * Unauthenticated reads, on their own path prefix so the trust boundary is
 * obvious to anyone scanning this directory — and so nginx can cache and
 * rate-limit it separately from everything that requires a session.
 *
 * No handler here touches `req.admin` or reads a cookie. Published posts are
 * public by definition; the response must be identical for every caller.
 */
export const publicRouter: Router = Router();

publicRouter.use(publicLimiter);

function etagFor(items: PublicPostSummary[]): string {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(items));
  return `W/"${hash.digest("hex").slice(0, 32)}"`;
}

publicRouter.get("/posts", async (req, res) => {
  const locale = localeQuery(req);

  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.status, "published"), eq(posts.locale, locale)))
    .orderBy(desc(posts.publishedAt))
    .limit(500);

  /*
   * Former addresses, in one query rather than one per post. The site uses them
   * to redirect a link shared before a rename, and the build turns them into
   * real 301 rules.
   */
  const retired =
    rows.length === 0
      ? []
      : await db
          .select({ postId: postSlugs.postId, slug: postSlugs.slug })
          .from(postSlugs)
          .where(
            inArray(
              postSlugs.postId,
              rows.map((row) => row.id),
            ),
          );

  const byPost = new Map<string, string[]>();
  for (const entry of retired) {
    const list = byPost.get(entry.postId) ?? [];
    list.push(entry.slug);
    byPost.set(entry.postId, list);
  }

  const body = rows.map((row) =>
    toPublicSummary(row, byPost.get(row.id) ?? []),
  );
  const etag = etagFor(body);

  /*
   * Revalidate every time rather than caching for a fixed minute.
   *
   * `max-age=60` meant the browser answered from its own cache without asking,
   * so for a minute after an edit every open tab — the author's included —
   * kept showing the old article and a refresh changed nothing. Express already
   * sends an ETag, so `no-cache` costs one conditional request that almost
   * always comes back 304 with no body, and the blog is never stale.
   */
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("ETag", etag);

  if (req.headers["if-none-match"] === etag) {
    res.status(304).end();
    return;
  }

  res.json(body);
});

publicRouter.get("/posts/:slug", async (req, res) => {
  const locale = localeQuery(req);
  const slug = safeSlug(req.params.slug);

  if (slug.length === 0) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.slug, slug),
        eq(posts.locale, locale),
        eq(posts.status, "published"),
      ),
    )
    .limit(1);

  const row = rows[0];

  /*
   * Not a live address — but it may be one this post used to have. A rename
   * moves the slug and files the old one, so answering 404 here would break
   * every link shared before the rename. Redirect to where the article lives
   * now, permanently, which is also what tells a search engine to move its
   * record rather than drop it.
   */
  if (row === undefined) {
    const alias = await db
      .select({ postId: postSlugs.postId })
      .from(postSlugs)
      .where(and(eq(postSlugs.slug, slug), eq(postSlugs.locale, locale)))
      .limit(1);

    const postId = alias[0]?.postId;
    if (postId !== undefined) {
      const moved = await db
        .select()
        .from(posts)
        .where(and(eq(posts.id, postId), eq(posts.status, "published")))
        .limit(1);

      const target = moved[0];
      if (target !== undefined) {
        res.setHeader("Cache-Control", "no-cache");
        res.redirect(
          301,
          `/api/public/posts/${target.slug}?locale=${target.locale}`,
        );
        return;
      }
    }
  }

  if (row === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  // Revalidated, not cached for a fixed window — see the list route above.
  res.setHeader("Cache-Control", "no-cache");
  res.json(toPublicPost(row));
});

publicRouter.get("/media/:filename", (req, res) => {
  const resolved = mediaPath(req.params.filename);
  if (resolved === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  // Filenames are random and content never changes under one, so they can be
  // cached forever.
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Content-Type", "image/webp");
  res.sendFile(resolved, (error: unknown) => {
    if (error !== undefined && !res.headersSent) {
      res.status(404).json({ error: "not_found" });
    }
  });
});

/*
 * Terminal 404 for anything under /api/public that matched no route above.
 *
 * Without this, an unmatched public path — `/api/public/media/..//etc/passwd`,
 * which has too many segments for the route pattern — falls through to the
 * admin router mounted at /api and comes back 401. That is a confusing answer
 * to a public request, and it tells a prober that some guard lives behind it.
 */
publicRouter.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});
