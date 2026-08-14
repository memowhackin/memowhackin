import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/client.js";
import { posts } from "../db/schema.js";
import { publicLimiter } from "../auth/rateLimit.js";
import { localeQuery } from "../http/params.js";
import { mediaPath } from "./media.js";
import { toPublicPost, type PublicPost } from "./serialize.js";
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

function etagFor(items: PublicPost[]): string {
  const hash = createHash("sha256");
  for (const item of items) hash.update(`${item.slug}:${item.date}`);
  hash.update(String(items.length));
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

  const body = rows.map(toPublicPost);
  const etag = etagFor(body);

  res.setHeader("Cache-Control", "public, max-age=60");
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
  if (row === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  res.setHeader("Cache-Control", "public, max-age=60");
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
