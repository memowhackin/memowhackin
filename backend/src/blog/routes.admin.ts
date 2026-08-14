import { and, desc, eq, ne } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { audit } from "../audit.js";
import { currentAdmin, requireAdmin } from "../auth/middleware.js";
import { writeLimiter, uploadLimiter } from "../auth/rateLimit.js";
import { db } from "../db/client.js";
import { images, posts } from "../db/schema.js";
import { triggerDeploy } from "../deploy.js";
import { uuidParam } from "../http/params.js";
import { requireCsrfToken } from "../security/csrf.js";
import { processAndStore, upload, UnsupportedImage } from "./media.js";
import { readMinutes } from "./readTime.js";
import { sanitizeBody, sanitizeExcerpt } from "./sanitize.js";
import { adminPost } from "./serialize.js";
import { slugify } from "./slug.js";

export const adminRouter: Router = Router();

/*
 * Order matters and is the whole authorization story for this router:
 * authenticate, then prove the request was intended, then rate-limit. Applied
 * to the router rather than per-route so a new endpoint cannot be added
 * unprotected by forgetting a guard.
 */
adminRouter.use(requireAdmin);
adminRouter.use(requireCsrfToken);
adminRouter.use(writeLimiter);

const CATEGORIES = [
  "rnd",
  "vulnerabilityAlerts",
  "news",
  "insideAssistsec",
] as const;

const STATUSES = ["draft", "published", "archived"] as const;

/*
 * `.strict()` rejects unknown keys outright. Without it a client could post
 * `status`, `publishedAt` or `authorId` and have them spread into the row —
 * publishing straight past the publish endpoint and its audit entry.
 */
const postInput = z
  .object({
    title: z.string().min(1).max(200),
    category: z.enum(CATEGORIES),
    excerpt: z.string().min(1).max(2000),
    body: z.string().max(400_000),
    slug: z.string().max(140).optional(),
    locale: z
      .string()
      .regex(/^[a-z]{2}(-[A-Z]{2})?$/)
      .default("en"),
    isFeatured: z.boolean().default(false),
    seoTitle: z.string().max(200).nullish(),
    seoDescription: z.string().max(320).nullish(),
  })
  .strict();

type PostInput = z.infer<typeof postInput>;

/** Every write funnels through here, so nothing reaches the database unclean. */
function clean(input: PostInput) {
  const body = sanitizeBody(input.body);
  const requested = input.slug ?? "";

  return {
    // Sanitized like the excerpt: a title is rendered into <title>, Open
    // Graph tags and the JSON-LD block, so markup in it is not inert.
    title: sanitizeExcerpt(input.title),
    category: input.category,
    excerpt: sanitizeExcerpt(input.excerpt),
    body,
    readMinutes: readMinutes(body),
    slug: slugify(requested.length > 0 ? requested : input.title),
    locale: input.locale,
    isFeatured: input.isFeatured,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
  };
}

adminRouter.get("/posts", async (req, res) => {
  const raw = req.query.status;
  const status = STATUSES.find((value) => value === raw);

  const rows = await db
    .select()
    .from(posts)
    .where(status !== undefined ? eq(posts.status, status) : undefined)
    .orderBy(desc(posts.updatedAt))
    .limit(500);

  res.json(rows.map(adminPost));
});

adminRouter.get("/posts/:id", async (req, res) => {
  const id = uuidParam(req, res, "id");
  if (id === undefined) return;

  const rows = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

  const row = rows[0];
  if (row === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(adminPost(row));
});

adminRouter.post("/posts", async (req, res) => {
  const parsed = postInput.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "invalid_post", fields: fieldErrors(parsed.error) });
    return;
  }

  const admin = currentAdmin(req);
  const values = clean(parsed.data);

  if (values.slug.length === 0) {
    res.status(400).json({ error: "invalid_slug" });
    return;
  }

  const clash = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, values.slug), eq(posts.locale, values.locale)))
    .limit(1);

  if (clash.length > 0) {
    res.status(409).json({ error: "slug_taken" });
    return;
  }

  const [row] = await db
    .insert(posts)
    .values({ ...values, authorId: admin.id, lastEditedById: admin.id })
    .returning();

  if (row === undefined) {
    res.status(500).json({ error: "insert_failed" });
    return;
  }

  await audit(req, "post.created", row.id, { slug: row.slug });
  res.status(201).json(adminPost(row));
});

adminRouter.patch("/posts/:id", async (req, res) => {
  const id = uuidParam(req, res, "id");
  if (id === undefined) return;

  const parsed = postInput.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "invalid_post", fields: fieldErrors(parsed.error) });
    return;
  }

  const admin = currentAdmin(req);
  const values = clean(parsed.data);

  if (values.slug.length === 0) {
    res.status(400).json({ error: "invalid_slug" });
    return;
  }

  const clash = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      and(
        eq(posts.slug, values.slug),
        eq(posts.locale, values.locale),
        ne(posts.id, id),
      ),
    )
    .limit(1);

  if (clash.length > 0) {
    res.status(409).json({ error: "slug_taken" });
    return;
  }

  const [row] = await db
    .update(posts)
    .set({ ...values, lastEditedById: admin.id, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();

  if (row === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  await audit(req, "post.updated", row.id, { slug: row.slug });
  if (row.status === "published") triggerDeploy(`update:${row.slug}`);

  res.json(adminPost(row));
});

adminRouter.post("/posts/:id/publish", async (req, res) => {
  const id = uuidParam(req, res, "id");
  if (id === undefined) return;

  const existing = await db
    .select({ publishedAt: posts.publishedAt })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  const current = existing[0];
  if (current === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  // published_at is set once, on first publish. Re-publishing after an edit
  // must not silently reorder the blog.
  const [row] = await db
    .update(posts)
    .set({
      status: "published",
      publishedAt: current.publishedAt ?? new Date(),
      lastEditedById: currentAdmin(req).id,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  if (row === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  await audit(req, "post.published", row.id, { slug: row.slug });
  triggerDeploy(`publish:${row.slug}`);

  res.json(adminPost(row));
});

adminRouter.post("/posts/:id/unpublish", async (req, res) => {
  const id = uuidParam(req, res, "id");
  if (id === undefined) return;

  const [row] = await db
    .update(posts)
    .set({
      status: "draft",
      lastEditedById: currentAdmin(req).id,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();

  if (row === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  await audit(req, "post.unpublished", row.id, { slug: row.slug });
  triggerDeploy(`unpublish:${row.slug}`);

  res.json(adminPost(row));
});

adminRouter.delete("/posts/:id", async (req, res) => {
  const id = uuidParam(req, res, "id");
  if (id === undefined) return;

  // Read the identifying fields before the row is gone — an audit entry that
  // only carries a uuid is close to useless when someone asks what was deleted.
  const [row] = await db.delete(posts).where(eq(posts.id, id)).returning();

  if (row === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  await audit(req, "post.deleted", row.id, {
    slug: row.slug,
    title: row.title,
  });
  if (row.status === "published") triggerDeploy(`delete:${row.slug}`);

  res.status(204).end();
});

adminRouter.post(
  "/media",
  uploadLimiter,
  upload.single("file"),
  async (req, res) => {
    if (req.file === undefined) {
      res.status(400).json({ error: "no_file" });
      return;
    }

    try {
      const stored = await processAndStore(req.file.buffer);

      await db.insert(images).values({
        filename: stored.filename,
        originalFilename: req.file.originalname.slice(0, 255),
        contentType: stored.contentType,
        sizeBytes: stored.sizeBytes,
        width: stored.width,
        height: stored.height,
        uploadedById: currentAdmin(req).id,
      });

      await audit(req, "media.uploaded", stored.filename, {});

      res.status(201).json({
        filename: stored.filename,
        // The path the stored HTML uses. It resolves on the static site because
        // The path the site serves this image from — same-origin through the
        // /api proxy, which is also exactly what belongs inside a post body.
        path: `/api/public/media/${stored.filename}`,
        width: stored.width,
        height: stored.height,
      });
    } catch (error) {
      if (error instanceof UnsupportedImage) {
        res.status(415).json({ error: "unsupported_format" });
        return;
      }
      throw error;
    }
  },
);

adminRouter.post("/deploy", async (req, res) => {
  triggerDeploy("manual");
  await audit(req, "deploy.triggered", undefined, {});
  res.status(202).json({ ok: true });
});

/**
 * Field-level messages for the form, without echoing the submitted values back.
 * Reflecting input into an error body is how a validation message becomes a
 * reflected-XSS gadget in someone else's client.
 */
function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    fields[key.length > 0 ? key : "_"] = issue.message;
  }
  return fields;
}
