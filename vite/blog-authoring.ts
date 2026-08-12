import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";

/*
 * The local authoring endpoint. It runs only under `vite` (dev), never in a
 * build, and turns the browser admin into a real file editor: saving a post
 * writes `src/content/blog/<slug>.json` straight into the project, and any
 * image pasted in as a data URL is written out to `public/assets/blog/` so the
 * committed JSON stays small. Publishing is then just `git commit` + deploy —
 * the built site reads those files, so the post is public and indexable.
 *
 * It touches the filesystem, so it is deliberately dev-only (`apply: "serve"`)
 * and its slugs are sanitised before they ever reach a path.
 */

const CONTENT_DIR = path.resolve(process.cwd(), "src/content/blog");
const IMAGE_DIR = path.resolve(process.cwd(), "public/assets/blog");
const IMAGE_URL = "/assets/blog";

const EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

interface IncomingPost {
  slug: string;
  body: string;
  [key: string]: unknown;
}

function safeSlug(value: unknown): string {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 120);
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk: Buffer | string) => {
      data += chunk.toString();
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", reject);
  });
}

function freeImageName(slug: string, ext: string): string {
  let index = 1;
  let name = `${slug}-${index.toString()}.${ext}`;
  while (existsSync(path.join(IMAGE_DIR, name))) {
    index += 1;
    name = `${slug}-${index.toString()}.${ext}`;
  }
  return name;
}

/** Write every inlined data-URL image to disk and swap in its asset URL. */
function externaliseImages(slug: string, body: string): string {
  return body.replace(
    /src="data:(image\/[a-z+]+);base64,([^"]+)"/g,
    (whole, mime: string, data: string) => {
      const ext = EXTENSION[mime];
      if (!ext) return whole;
      mkdirSync(IMAGE_DIR, { recursive: true });
      const name = freeImageName(slug, ext);
      writeFileSync(path.join(IMAGE_DIR, name), Buffer.from(data, "base64"));
      return `src="${IMAGE_URL}/${name}"`;
    },
  );
}

function json(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

async function handleSave(
  req: Connect.IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const parsed: unknown = JSON.parse(await readBody(req));
  if (typeof parsed !== "object" || parsed === null || !("post" in parsed)) {
    json(res, 400, { ok: false });
    return;
  }

  const { post, previousSlug } = parsed as {
    post: IncomingPost;
    previousSlug?: string;
  };
  const slug = safeSlug(post.slug);
  if (slug.length === 0) {
    json(res, 400, { ok: false });
    return;
  }

  mkdirSync(CONTENT_DIR, { recursive: true });
  const saved = { ...post, slug, body: externaliseImages(slug, post.body) };
  writeFileSync(
    path.join(CONTENT_DIR, `${slug}.json`),
    `${JSON.stringify(saved, null, 2)}\n`,
  );

  const previous = safeSlug(previousSlug ?? "");
  if (previous.length > 0 && previous !== slug) {
    const old = path.join(CONTENT_DIR, `${previous}.json`);
    if (existsSync(old)) rmSync(old);
  }

  json(res, 200, { ok: true, post: saved });
}

async function handleDelete(
  req: Connect.IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const parsed: unknown = JSON.parse(await readBody(req));
  const slug =
    typeof parsed === "object" && parsed !== null && "slug" in parsed
      ? safeSlug(parsed.slug)
      : "";
  if (slug.length === 0) {
    json(res, 400, { ok: false });
    return;
  }

  const file = path.join(CONTENT_DIR, `${slug}.json`);
  if (existsSync(file)) rmSync(file);

  // Remove this post's own images (`<slug>-<n>.<ext>`) without touching a
  // post whose slug merely starts the same way.
  if (existsSync(IMAGE_DIR)) {
    const owned = new RegExp(`^${slug}-\\d+\\.[a-z]+$`);
    for (const name of readdirSync(IMAGE_DIR)) {
      if (owned.test(name)) rmSync(path.join(IMAGE_DIR, name));
    }
  }

  json(res, 200, { ok: true });
}

export function blogAuthoring(): Plugin {
  return {
    name: "assistsec-blog-authoring",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "POST" || req.url === undefined) {
          next();
          return;
        }
        if (req.url === "/__blog/save") {
          void handleSave(req, res).catch(() => {
            json(res, 500, { ok: false });
          });
        } else if (req.url === "/__blog/delete") {
          void handleDelete(req, res).catch(() => {
            json(res, 500, { ok: false });
          });
        } else {
          next();
        }
      });
    },
  };
}
