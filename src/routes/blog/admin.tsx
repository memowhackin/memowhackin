import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight, Eye, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { RichEditor } from "@/components/blog/RichEditor";
import { LogoMark } from "@/components/common/Logo";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import {
  BLOG_CATEGORIES,
  deletePost,
  logout,
  savePost,
  slugify,
  useBlogPosts,
  useIsAuthed,
  type BlogCategory,
  type BlogPost,
  type SaveMode,
} from "@/config/blog";

export const Route = createFileRoute("/blog/admin")({
  component: BlogAdmin,
});

interface Draft {
  /** Set when editing: the slug the post had before this edit, for renames. */
  originalSlug?: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  body: string;
  date: string;
  published: boolean;
  featured: boolean;
}

const inputClass =
  "border-lavender/25 bg-indigo-deep/40 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:ring-2";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyDraft(): Draft {
  return {
    title: "",
    category: "news",
    excerpt: "",
    body: "<p></p>",
    date: todayIso(),
    published: true,
    featured: false,
  };
}

/** Reading time from the body text, rounded up, at 200 words a minute. */
function readMinutes(body: string): number {
  const words = body
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function BlogAdmin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const authed = useIsAuthed();
  const posts = useBlogPosts();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [savedMode, setSavedMode] = useState<SaveMode | null>(null);

  // No server to gate on, so the route gates itself: unauthenticated visitors
  // are bounced to the login screen.
  useEffect(() => {
    if (!authed) void navigate({ to: "/blog/login" });
  }, [authed, navigate]);

  if (!authed) return null;

  function startEdit(post: BlogPost) {
    setSavedMode(null);
    setDraft({ ...post, originalSlug: post.slug });
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    const post: BlogPost = {
      slug: slugify(draft.title || t("admin.untitled")),
      title: draft.title.trim() || t("admin.untitled"),
      category: draft.category,
      excerpt: draft.excerpt.trim(),
      body: draft.body,
      date: draft.date,
      readMinutes: readMinutes(draft.body),
      published: draft.published,
      featured: draft.featured,
    };

    void savePost(post, draft.originalSlug).then((mode) => {
      setSavedMode(mode);
    });
    setDraft(null);
  }

  function handleDelete(post: BlogPost) {
    if (window.confirm(t("admin.deleteConfirm", { title: post.title }))) {
      void deletePost(post.slug);
    }
  }

  const ordered = [...posts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div data-testid="blog-admin" className="bg-ink min-h-screen">
      {/* The dashboard's own top bar, in place of the marketing header. */}
      <header className="border-indigo-deep bg-ink-deep/90 sticky top-0 z-20 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <LogoMark className="text-lavender h-6 w-auto" />
            <span className="font-display text-mist text-sm font-medium tracking-wide">
              {t("admin.loginHeading")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/blog"
              data-testid="admin-view-blog"
              className="border-indigo-deep text-mist hover:border-lavender/50 hover:text-lavender inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors"
            >
              <ArrowUpRight className="size-4" aria-hidden="true" />
              {t("admin.viewBlog")}
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
              }}
              data-testid="admin-logout"
              className="bg-lavender text-ink-deep hover:bg-lavender-soft inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("admin.logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[80rem] flex-col gap-8 px-4 py-8 sm:px-8 lg:py-10">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-mist text-2xl font-normal sm:text-3xl">
            {t("admin.heading")}
          </h1>
          <p className="text-mist/55 text-sm">{t("admin.subheading")}</p>
        </div>

        {savedMode && !draft && (
          <div
            data-testid="admin-status"
            className="border-lavender/25 bg-indigo-deep/30 text-mist/80 rounded-lg border px-4 py-3 text-sm leading-relaxed"
          >
            {savedMode === "written"
              ? t("admin.savedWritten")
              : t("admin.savedDownloaded")}
          </div>
        )}

        {draft ? (
          <form
            onSubmit={handleSave}
            data-testid="admin-editor-form"
            className="flex flex-col gap-6"
          >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="post-title"
                  className="text-mist/80 text-sm font-medium"
                >
                  {t("admin.fieldTitle")}
                </label>
                <input
                  id="post-title"
                  type="text"
                  required
                  value={draft.title}
                  onChange={(event) => {
                    setDraft({ ...draft, title: event.target.value });
                  }}
                  className={inputClass}
                  data-testid="admin-title"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="post-category"
                  className="text-mist/80 text-sm font-medium"
                >
                  {t("admin.fieldCategory")}
                </label>
                <select
                  id="post-category"
                  value={draft.category}
                  onChange={(event) => {
                    setDraft({
                      ...draft,
                      category: event.target.value as BlogCategory,
                    });
                  }}
                  className={clsx(inputClass, "appearance-none")}
                  data-testid="admin-category"
                >
                  {BLOG_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {t(`blog.categories.${category}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="post-excerpt"
                  className="text-mist/80 text-sm font-medium"
                >
                  {t("admin.fieldExcerpt")}
                </label>
                <textarea
                  id="post-excerpt"
                  rows={2}
                  value={draft.excerpt}
                  onChange={(event) => {
                    setDraft({ ...draft, excerpt: event.target.value });
                  }}
                  className={clsx(inputClass, "resize-y")}
                  data-testid="admin-excerpt"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="post-date"
                  className="text-mist/80 text-sm font-medium"
                >
                  {t("admin.fieldDate")}
                </label>
                <input
                  id="post-date"
                  type="date"
                  value={draft.date}
                  onChange={(event) => {
                    setDraft({ ...draft, date: event.target.value });
                  }}
                  className={clsx(inputClass, "[color-scheme:dark]")}
                  data-testid="admin-date"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-mist/80 text-sm font-medium">
                {t("admin.fieldBody")}
              </span>
              <RichEditor
                value={draft.body}
                onChange={(body) => {
                  setDraft((current) =>
                    current ? { ...current, body } : current,
                  );
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <label className="text-mist/80 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(event) => {
                    setDraft({ ...draft, published: event.target.checked });
                  }}
                  className="accent-lavender size-4"
                  data-testid="admin-published"
                />
                {t("admin.fieldPublished")}
              </label>

              <label className="text-mist/80 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) => {
                    setDraft({ ...draft, featured: event.target.checked });
                  }}
                  className="accent-lavender size-4"
                  data-testid="admin-featured"
                />
                {t("admin.fieldFeatured")}
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                data-testid="admin-save"
                className={brandButtonClass()}
              >
                {t("admin.save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                }}
                className={brandButtonClass({ variant: "ghost" })}
              >
                {t("admin.cancel")}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <button
                type="button"
                onClick={() => {
                  setSavedMode(null);
                  setDraft(emptyDraft());
                }}
                data-testid="admin-new"
                className={brandButtonClass()}
              >
                <Plus className="size-5" aria-hidden="true" />
                {t("admin.newPost")}
              </button>
            </div>

            <ul className="flex flex-col gap-3" data-testid="admin-post-list">
              {ordered.map((post) => (
                <li
                  key={post.slug}
                  data-testid={`admin-post-${post.slug}`}
                  className="border-indigo-deep bg-ink-deep/60 flex flex-wrap items-center gap-4 rounded-xl border p-4 sm:p-5"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="eyebrow text-lavender/80">
                        {t(`blog.categories.${post.category}`)}
                      </span>
                      {!post.published && (
                        <span className="text-mist/40 text-xs">
                          · {t("admin.draftTag")}
                        </span>
                      )}
                      {post.featured && (
                        <span className="text-lavender/70 text-xs">
                          · {t("admin.featuredTag")}
                        </span>
                      )}
                    </div>
                    <p className="text-mist truncate text-base font-medium">
                      {post.title}
                    </p>
                    <p className="text-mist/45 text-xs">
                      {new Date(post.date).toLocaleDateString(i18n.language, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      aria-label={t("admin.view")}
                      className="text-mist/60 hover:bg-lavender/10 hover:text-lavender inline-flex size-9 items-center justify-center rounded-md transition-colors"
                    >
                      <Eye className="size-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        startEdit(post);
                      }}
                      aria-label={t("admin.edit")}
                      data-testid={`admin-edit-${post.slug}`}
                      className="text-mist/60 hover:bg-lavender/10 hover:text-lavender inline-flex size-9 items-center justify-center rounded-md transition-colors"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete(post);
                      }}
                      aria-label={t("admin.delete")}
                      data-testid={`admin-delete-${post.slug}`}
                      className="text-mist/60 hover:text-ember hover:bg-ember/10 inline-flex size-9 items-center justify-center rounded-md transition-colors"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
