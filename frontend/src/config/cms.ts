import { useCallback, useEffect, useSyncExternalStore } from "react";
import { invalidateBlogPosts, type BlogCategory } from "@/config/blog";

/*
 * The only file in this app that talks to a server.
 *
 * Everything public — the blog index, the posts themselves — is baked into the
 * build as static content, so the marketing site makes no network calls at all.
 * These calls exist solely for the admin screens, and every one of them is
 * authorized server-side: nothing here is a security control, it is a UI that
 * asks politely and is told no when it should be.
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

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

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

export interface PostInput {
  title: string;
  category: BlogCategory;
  excerpt: string;
  body: string;
  slug?: string;
  isFeatured: boolean;
}

export type AuthStatus = "unknown" | "authed" | "anonymous";

/*
 * The CSRF token is held in memory only. Putting it in localStorage would let
 * any script that manages to run on this page read it, which is exactly the
 * situation the token is supposed to survive. Losing it on reload is fine —
 * `me()` re-issues it.
 */
let csrfToken = "";
let status: AuthStatus = "unknown";
let user: AdminUser | null = null;

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

function setAuth(next: AdminUser | null, token: string): void {
  user = next;
  csrfToken = token;
  status = next === null ? "anonymous" : "authed";
  emit();
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(
    httpStatus: number,
    code: string,
    fields: Record<string, string> = {},
  ) {
    super(code);
    this.name = "ApiError";
    this.status = httpStatus;
    this.code = code;
    this.fields = fields;
  }
}

interface ErrorBody {
  error?: unknown;
  fields?: unknown;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  body?: unknown,
): Promise<T> {
  const method = init.method ?? "GET";
  const headers = new Headers(init.headers);

  if (body !== undefined) headers.set("content-type", "application/json");
  if (method !== "GET" && csrfToken.length > 0) {
    headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    method,
    headers,
    // Sends the session cookie cross-origin. The API answers only to this
    // origin, and only with a matching CSRF token.
    credentials: "include",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  if (response.status === 401) {
    // The server has the final say on whether a session is alive; reflect that
    // rather than keeping a stale "logged in" UI on screen.
    setAuth(null, "");
    throw new ApiError(401, "unauthorized");
  }

  if (!response.ok) {
    const problem = await safeJson<ErrorBody>(response);
    throw new ApiError(
      response.status,
      typeof problem?.error === "string" ? problem.error : "request_failed",
      isFieldMap(problem?.fields) ? problem.fields : {},
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function safeJson<T>(response: Response): Promise<T | undefined> {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}

function isFieldMap(value: unknown): value is Record<string, string> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface SessionResponse extends AdminUser {
  csrfToken: string;
}

export async function login(
  email: string,
  password: string,
): Promise<AdminUser> {
  const session = await request<SessionResponse>(
    "/api/auth/login",
    { method: "POST" },
    { email, password },
  );

  setAuth(
    { id: session.id, email: session.email, name: session.name },
    session.csrfToken,
  );
  return session;
}

export async function logout(): Promise<void> {
  try {
    await request<void>("/api/auth/logout", { method: "POST" });
  } finally {
    // Whatever the server said, this browser is done with the session.
    setAuth(null, "");
  }
}

/** Ask the server who we are. The only source of truth for "logged in". */
export async function refreshSession(): Promise<void> {
  try {
    const session = await request<SessionResponse>("/api/auth/me");
    setAuth(
      { id: session.id, email: session.email, name: session.name },
      session.csrfToken,
    );
  } catch {
    setAuth(null, "");
  }
}

export function listPosts(): Promise<AdminPost[]> {
  return request<AdminPost[]>("/api/posts");
}

/*
 * Every write drops the public site's cached post list. The studio and the
 * site share one single-page app, so without this an admin who publishes and
 * clicks through to /blog is shown the list this tab fetched before the write.
 */

export async function createPost(input: PostInput): Promise<AdminPost> {
  const post = await request<AdminPost>(
    "/api/posts",
    { method: "POST" },
    input,
  );
  invalidateBlogPosts();
  return post;
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<AdminPost> {
  const post = await request<AdminPost>(
    `/api/posts/${id}`,
    { method: "PATCH" },
    input,
  );
  invalidateBlogPosts();
  return post;
}

export async function publishPost(id: string): Promise<AdminPost> {
  const post = await request<AdminPost>(`/api/posts/${id}/publish`, {
    method: "POST",
  });
  invalidateBlogPosts();
  return post;
}

export async function unpublishPost(id: string): Promise<AdminPost> {
  const post = await request<AdminPost>(`/api/posts/${id}/unpublish`, {
    method: "POST",
  });
  invalidateBlogPosts();
  return post;
}

export async function deletePost(id: string): Promise<void> {
  await request<void>(`/api/posts/${id}`, { method: "DELETE" });
  invalidateBlogPosts();
}

export interface UploadedImage {
  filename: string;
  path: string;
  width: number;
  height: number;
}

export async function uploadImage(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.set("file", file);

  const headers = new Headers();
  if (csrfToken.length > 0) headers.set("x-csrf-token", csrfToken);

  // No content-type header: the browser has to set the multipart boundary.
  const response = await fetch(`${API_BASE}/api/media`, {
    method: "POST",
    headers,
    credentials: "include",
    body: form,
  });

  if (response.status === 401) {
    setAuth(null, "");
    throw new ApiError(401, "unauthorized");
  }
  if (!response.ok) {
    const problem = await safeJson<ErrorBody>(response);
    throw new ApiError(
      response.status,
      typeof problem?.error === "string" ? problem.error : "upload_failed",
    );
  }

  return (await response.json()) as UploadedImage;
}

/*
 * Post bodies store image sources as `/api/public/media/<file>` — the
 * same-origin path that everything in front of the site proxies to the backend:
 * nginx in production, the vite dev server, and the static servers used for
 * prerendering and e2e. One URL form works in the editor, on the public pages
 * and in the prerendered HTML, so nothing rewrites bodies at render time.
 *
 * Two wrinkles keep these functions alive:
 *  - The admin screens can be served with the API on another host
 *    (VITE_CMS_API_URL set), where the canonical path does not resolve; the
 *    host is prepended for display and stripped again before saving. With the
 *    default same-origin setup both replacements are identity.
 *  - Bodies written before the CMS became the runtime source stored
 *    `/media/blog/<file>`, a path the build used to mirror and nothing serves
 *    any more. Those are upgraded on the way into the editor, so the next save
 *    heals them.
 */
const MEDIA_CANONICAL = "/api/public/media/";
const LEGACY_MEDIA_PATH = "/media/blog/";
const MEDIA_DISPLAY = `${API_BASE}${MEDIA_CANONICAL}`;

/** The URL the editor should render an image from, whatever form it is in. */
export function mediaUrl(storagePath: string): string {
  if (storagePath.startsWith(LEGACY_MEDIA_PATH)) {
    return MEDIA_DISPLAY + storagePath.slice(LEGACY_MEDIA_PATH.length);
  }
  if (storagePath.startsWith(MEDIA_CANONICAL)) {
    return API_BASE + storagePath;
  }
  return storagePath;
}

export function toDisplayHtml(html: string): string {
  return html
    .replaceAll(`src="${LEGACY_MEDIA_PATH}`, `src="${MEDIA_DISPLAY}`)
    .replaceAll(`src="${MEDIA_CANONICAL}`, `src="${MEDIA_DISPLAY}`);
}

export function toStorageHtml(html: string): string {
  return html.replaceAll(`src="${MEDIA_DISPLAY}`, `src="${MEDIA_CANONICAL}`);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readStatus(): AuthStatus {
  return status;
}

function readUser(): AdminUser | null {
  return user;
}

/**
 * Session state for the admin screens. Starts as "unknown" and resolves once
 * the server has answered, so the UI never flashes a logged-in shell at a
 * visitor who is not.
 */
export function useSession(): { status: AuthStatus; user: AdminUser | null } {
  const currentStatus = useSyncExternalStore(
    subscribe,
    readStatus,
    (): AuthStatus => "unknown",
  );
  const currentUser = useSyncExternalStore(subscribe, readUser, () => null);

  const bootstrap = useCallback(() => {
    if (status === "unknown") void refreshSession();
  }, []);

  useEffect(bootstrap, [bootstrap]);

  return { status: currentStatus, user: currentUser };
}
