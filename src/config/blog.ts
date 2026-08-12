import { useSyncExternalStore } from "react";

/*
 * The blog's data layer, backed by files in the repository.
 *
 * Every post is a JSON file in `src/content/blog/`. Those files are imported at
 * build time, so the built site ships the posts as static content — public,
 * indexable, no server and no third-party service. Writing happens through the
 * local authoring endpoint while `vite` is running (see `vite/blog-authoring`);
 * publishing is committing the file it wrote and deploying. Everything a
 * component touches goes through this module, so the storage can change under
 * it without any of them noticing.
 */

const files = import.meta.glob<BlogPost>("../content/blog/*.json", {
  eager: true,
  import: "default",
});

export const BLOG_CATEGORIES = [
  "rnd",
  "vulnerabilityAlerts",
  "news",
  "insideAssistsec",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export interface BlogPost {
  /** The URL-safe id; also the JSON file's name. */
  slug: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  /** Rendered HTML from the editor. */
  body: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  readMinutes: number;
  published: boolean;
  featured: boolean;
}

export type SaveMode = "written" | "downloaded";

const SESSION_KEY = "assistsec-blog-session";

/*
 * Credentials are checked in the browser, which cannot keep a secret. With the
 * posts living in git, this is a soft gate on the local authoring UI rather
 * than the thing that protects what gets published — a post only goes live once
 * someone with repository access commits its file.
 */
const ADMIN_USER = "AssistsecAdmin";
const ADMIN_PASSWORD = "34_Fu93>(Jxni~";

function isBlogPost(value: unknown): value is BlogPost {
  if (typeof value !== "object" || value === null) return false;
  const post = value as Record<string, unknown>;
  return typeof post.slug === "string" && typeof post.title === "string";
}

const FILE_POSTS: readonly BlogPost[] = Object.values(files).filter(isBlogPost);

/*
 * A reactive mirror of the files, so the dashboard reflects a save or delete
 * the instant it happens rather than waiting for the dev server to reload the
 * changed file. `useSyncExternalStore` reads it without a render loop.
 */
let cache: BlogPost[] = [...FILE_POSTS];
const listeners = new Set<() => void>();

function readPosts(): BlogPost[] {
  return cache;
}

function notify(next: BlogPost[]): void {
  cache = next;
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBlogPosts(): BlogPost[] {
  return useSyncExternalStore(subscribe, readPosts, readPosts);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return readPosts().find((post) => post.slug === slug);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replaceAll(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replaceAll(/^-+|-+$/g, "");
}

function safeRead(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Offer the post as a file to drop into the repo, when no dev server can. */
function downloadPost(post: BlogPost): void {
  const blob = new Blob([`${JSON.stringify(post, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${post.slug}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

interface SaveResponse {
  ok?: boolean;
  post?: BlogPost;
}

/**
 * Persist a post. In local development it is written to its file (and any
 * inlined image with it); anywhere else the file is offered as a download to
 * commit by hand. Either way the in-memory mirror updates at once.
 */
export async function savePost(
  post: BlogPost,
  previousSlug?: string,
): Promise<SaveMode> {
  const withoutOld = cache.filter(
    (item) => item.slug !== post.slug && item.slug !== previousSlug,
  );

  if (import.meta.env.DEV) {
    try {
      const response = await fetch("/__blog/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ post, previousSlug }),
      });
      const data = (await response.json()) as SaveResponse;
      if (response.ok && data.ok === true) {
        // The server rewrites data-URL images to asset paths; mirror that.
        const stored = data.post && isBlogPost(data.post) ? data.post : post;
        notify([stored, ...withoutOld]);
        return "written";
      }
    } catch {
      /* fall through to the download path */
    }
  }

  notify([post, ...withoutOld]);
  downloadPost(post);
  return "downloaded";
}

export async function deletePost(slug: string): Promise<void> {
  notify(cache.filter((post) => post.slug !== slug));

  if (import.meta.env.DEV) {
    try {
      await fetch("/__blog/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
    } catch {
      /* the mirror is already updated; the file stays until removed by hand */
    }
  }
}

/* Auth: a session flag, not a token — see the caveats above. */

export function login(username: string, password: string): boolean {
  const ok = username === ADMIN_USER && password === ADMIN_PASSWORD;
  if (ok) {
    try {
      globalThis.localStorage?.setItem(SESSION_KEY, "1");
    } catch {
      /* session stays in memory for this tab */
    }
    authListeners.forEach((listener) => {
      listener();
    });
  }
  return ok;
}

export function logout(): void {
  try {
    globalThis.localStorage?.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  authListeners.forEach((listener) => {
    listener();
  });
}

const authListeners = new Set<() => void>();

function subscribeAuth(listener: () => void): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function readAuth(): boolean {
  return safeRead(SESSION_KEY) === "1";
}

export function useIsAuthed(): boolean {
  return useSyncExternalStore(subscribeAuth, readAuth, () => false);
}
