import { randomUUID } from "node:crypto";
import { and, desc, eq, ne } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { audit } from "../audit.js";
import { currentAdmin, requireAdmin } from "../auth/middleware.js";
import { writeLimiter, uploadLimiter } from "../auth/rateLimit.js";
import { db } from "../db/client.js";
import {
  images,
  inquiries,
  postSlugs,
  posts,
  scanLeads,
} from "../db/schema.js";
import { triggerDeploy } from "../deploy.js";
import { uuidParam } from "../http/params.js";
import { requireCsrfToken } from "../security/csrf.js";
import { processAndStore, upload, UnsupportedImage } from "./media.js";
import { readMinutes } from "./readTime.js";
import { sanitizeBody, sanitizeExcerpt } from "./sanitize.js";
import { adminPost } from "./serialize.js";
import { buildSlug } from "./slug.js";

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

  return {
    // Sanitized like the excerpt: a title is rendered into <title>, Open
    // Graph tags and the JSON-LD block, so markup in it is not inert.
    title: sanitizeExcerpt(input.title),
    category: input.category,
    excerpt: sanitizeExcerpt(input.excerpt),
    body,
    readMinutes: readMinutes(body),
    locale: input.locale,
    isFeatured: input.isFeatured,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
  };
}

/*
 * A unique-violation on (slug, locale).
 *
 * Two authors saving the same title at the same moment both see the readable
 * slug as free, both build it, and one of the inserts loses to the index. The
 * loser retries with the id suffix, which cannot clash because no two rows
 * share an id — so the race costs a round trip rather than a failed save.
 */
function isSlugConflict(error: unknown): boolean {
  /*
   * Walks the cause chain: the driver's SQLSTATE arrives wrapped in whatever
   * the query layer threw, and the depth of that wrapping is not ours to rely
   * on. `in` narrows each link enough to read the property without asserting a
   * shape, and the walk is bounded so a self-referencing cause cannot spin.
   */
  let cause: unknown = error;

  for (let depth = 0; depth < 8; depth += 1) {
    if (typeof cause !== "object" || cause === null) return false;
    if ("code" in cause && cause.code === "23505") return true;
    cause = "cause" in cause ? cause.cause : undefined;
  }
  return false;
}

/*
 * Whether a candidate slug is already spoken for in this locale, ignoring the
 * row being written. The unique index on (slug, locale) is the real guarantee;
 * this is what lets a clash be resolved into a working URL instead of surfacing
 * as an error the author cannot act on.
 */
function slugTaken(locale: string, exceptId?: string) {
  return async (candidate: string): Promise<boolean> => {
    const live = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(
          eq(posts.slug, candidate),
          eq(posts.locale, locale),
          exceptId === undefined ? undefined : ne(posts.id, exceptId),
        ),
      )
      .limit(1);
    if (live.length > 0) return true;

    /*
     * A retired address is still spoken for: it redirects to the post that used
     * to live there, and handing it to a different article would silently
     * hijack every old link. A post may reclaim its own former slug, which is
     * what makes renaming a title back again work.
     */
    const retired = await db
      .select({ id: postSlugs.id })
      .from(postSlugs)
      .where(
        and(
          eq(postSlugs.slug, candidate),
          eq(postSlugs.locale, locale),
          exceptId === undefined ? undefined : ne(postSlugs.postId, exceptId),
        ),
      )
      .limit(1);
    return retired.length > 0;
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

/*
 * The leads captured by the exposure scanner's unlock gate. Read-only: the
 * studio shows who asked to see a full report and how to reach them. Newest
 * first, and capped like the posts list.
 */
adminRouter.get("/scanner/leads", async (_req, res) => {
  const rows = await db
    .select()
    .from(scanLeads)
    .orderBy(desc(scanLeads.createdAt))
    .limit(500);

  res.json(
    rows.map((row) => ({
      id: row.id,
      scanId: row.scanId,
      name: row.name,
      company: row.company,
      position: row.position,
      email: row.email,
      createdAt: row.createdAt.toISOString(),
    })),
  );
});

/*
 * Contact and demo requests, newest first.
 *
 * One endpoint for both, narrowed by `kind`, because they are the same row
 * shape and the admin shows them as two views of one table. Capped like the
 * leads list: this screen is for reading the recent ones, not for exporting
 * the archive.
 *
 * `deliveredAt` is included deliberately. A null there means the row was
 * stored but the notification never left, which is the one thing somebody
 * reading this screen needs to know that the inquiry itself does not tell
 * them.
 */
adminRouter.get("/inquiries", async (req, res) => {
  const kind = req.query.kind === "demo" ? "demo" : "contact";

  const rows = await db
    .select()
    .from(inquiries)
    .where(eq(inquiries.kind, kind))
    .orderBy(desc(inquiries.createdAt))
    .limit(500);

  res.json(
    rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      name: row.name,
      email: row.email,
      company: row.company,
      subject: row.subject,
      phone: row.phone,
      message: row.message,
      consent: row.consent,
      locale: row.locale,
      deliveredAt: row.deliveredAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
  );
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
  const input = parsed.data;

  /*
   * The id is minted here rather than by the column default, because the slug
   * is derived from it: two posts sharing a title get the same readable slug,
   * and the disambiguating suffix has to come from something permanent and
   * unique to the row. Its own primary key is exactly that.
   */
  const id = randomUUID();
  const requested = input.slug ?? "";
  const slug = await buildSlug(
    id,
    requested.length > 0 ? requested : input.title,
    slugTaken(values.locale),
  );

  const insert = (candidate: string) =>
    db
      .insert(posts)
      .values({
        ...values,
        id,
        slug: candidate,
        authorId: admin.id,
        lastEditedById: admin.id,
      })
      .returning();

  let inserted;
  try {
    inserted = await insert(slug);
  } catch (error) {
    if (!isSlugConflict(error)) throw error;
    inserted = await insert(
      await buildSlug(id, requested.length > 0 ? requested : input.title, () =>
        Promise.resolve(true),
      ),
    );
  }

  const [row] = inserted;

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
  const input = parsed.data;

  const existing = await db
    .select({ slug: posts.slug, publishedAt: posts.publishedAt })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  const current = existing[0];
  if (current === undefined) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  /*
   * The slug follows the title, and the address it leaves behind keeps working.
   *
   * Freezing the slug at publish kept links alive but let the URL drift from
   * the headline — rename "Working in kitchen" to "Working in garage" and the
   * article still lived at /blog/working-in-kitchen, which reads as a bug. So
   * the slug moves with the title now, and the outgoing one is filed in
   * post_slugs, where the public lookup finds it and redirects. Nothing that
   * was ever shared stops resolving.
   */
  const requested = input.slug ?? "";
  const source = requested.length > 0 ? requested : input.title;
  const slug = await buildSlug(id, source, slugTaken(values.locale, id));

  const write = (candidate: string) =>
    db
      .update(posts)
      .set({
        ...values,
        slug: candidate,
        lastEditedById: admin.id,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

  let updated;
  try {
    updated = await write(slug);
  } catch (error) {
    if (!isSlugConflict(error)) throw error;
    updated = await write(
      await buildSlug(id, source, () => Promise.resolve(true)),
    );
  }

  const [row] = updated;

  if (row !== undefined && row.slug !== current.slug) {
    /*
     * Only a published post leaves an address behind: a draft has never had a
     * URL anyone could hold. The insert ignores a conflict because the post may
     * be reclaiming a slug it retired earlier, in which case that row is about
     * to be deleted below anyway.
     */
    if (current.publishedAt !== null) {
      await db
        .insert(postSlugs)
        .values({
          postId: id,
          slug: current.slug,
          locale: row.locale,
        })
        .onConflictDoNothing();
    }

    // The current address must never also be listed as a former one, or the
    // lookup would redirect the post to itself.
    await db
      .delete(postSlugs)
      .where(
        and(eq(postSlugs.slug, row.slug), eq(postSlugs.locale, row.locale)),
      );
  }

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
