import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { stdout } from "node:process";
import { and, eq } from "drizzle-orm";
import { db, pool } from "../src/db/client.js";
import { adminUsers, posts } from "../src/db/schema.js";
import { readMinutes } from "../src/blog/readTime.js";
import { sanitizeBody, sanitizeExcerpt } from "../src/blog/sanitize.js";
import { slugify } from "../src/blog/slug.js";

/*
 * Bulk import of posts from JSON files, one file per post.
 *
 *   npm run import-seed -- --dir ./seed --author you@assistsec.nl
 *
 * Written for the one-off migration off the JSON files the blog used before it
 * had a database. It is kept because it is also how CI seeds an article and how
 * a fresh environment gets content without clicking through the editor.
 *
 * Idempotent on (slug, locale), so re-running it is safe.
 *
 * Bodies go through the sanitizer rather than around it. If sanitizing changes
 * existing content, that is worth discovering during a migration you are
 * watching, not on someone's first save.
 */

interface SeedPost {
  slug?: string;
  title?: string;
  category?: string;
  excerpt?: string;
  body?: string;
  date?: string;
  published?: boolean;
  featured?: boolean;
}

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return process.argv[index + 1] ?? fallback;
}

async function main(): Promise<void> {
  const dir = path.resolve(arg("dir", "./seed"));
  const authorEmail = arg("author", "").toLowerCase();

  let authorId: string | null = null;
  if (authorEmail.length > 0) {
    const rows = await db
      .select({ id: adminUsers.id })
      .from(adminUsers)
      .where(eq(adminUsers.email, authorEmail))
      .limit(1);
    authorId = rows[0]?.id ?? null;
    if (authorId === null) {
      throw new Error(`no admin account for ${authorEmail}`);
    }
  }

  const files = (await readdir(dir)).filter((name) => name.endsWith(".json"));
  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const raw: unknown = JSON.parse(
      await readFile(path.join(dir, file), "utf8"),
    );
    if (typeof raw !== "object" || raw === null) continue;

    const seed = raw as SeedPost;
    const slug = slugify(seed.slug ?? seed.title ?? "");
    if (slug.length === 0 || seed.title === undefined) {
      stdout.write(`skip ${file}: no slug or title\n`);
      skipped += 1;
      continue;
    }

    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.locale, "en")))
      .limit(1);

    if (existing.length > 0) {
      stdout.write(`skip ${slug}: already present\n`);
      skipped += 1;
      continue;
    }

    const body = sanitizeBody(seed.body ?? "");
    const published = seed.published !== false;

    await db.insert(posts).values({
      slug,
      locale: "en",
      title: seed.title,
      category: seed.category ?? "news",
      excerpt: sanitizeExcerpt(seed.excerpt ?? ""),
      body,
      readMinutes: readMinutes(body),
      status: published ? "published" : "draft",
      isFeatured: seed.featured === true,
      publishedAt:
        seed.date !== undefined
          ? new Date(`${seed.date}T00:00:00Z`)
          : new Date(),
      authorId,
      lastEditedById: authorId,
    });

    stdout.write(`imported ${slug}\n`);
    imported += 1;
  }

  stdout.write(`\n${String(imported)} imported, ${String(skipped)} skipped\n`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    stdout.write(`Failed: ${message}\n`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
