import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { ArrowUpRight, Eye, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { RichEditor } from "@/components/blog/RichEditor";
import { LogoMark } from "@/components/common/Logo";
import { brandButtonClass } from "@/components/common/brandButtonClass";
import { useSeo } from "@/localization/useSeo";
import { BLOG_CATEGORIES, type BlogCategory } from "@/config/blog";
import {
  ApiError,
  createPost,
  deletePost,
  listPosts,
  logout,
  publishPost,
  unpublishPost,
  updatePost,
  useSession,
  type AdminPost,
} from "@/config/cms";

export const Route = createFileRoute("/studio-b78262a861/")({
  component: BlogAdmin,
});

interface Draft {
  /** Set when editing an existing post; absent when creating one. */
  id?: string;
  /** The address the post is published under. Server-assigned, read-only. */
  slug?: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  body: string;
  published: boolean;
  featured: boolean;
}

const inputClass =
  "border-lavender/25 bg-indigo-deep/40 text-mist placeholder:text-mist/35 focus:border-lavender focus:ring-lavender/30 w-full rounded-lg border px-4 py-3 text-base outline-none transition-colors focus:ring-2";

function emptyDraft(): Draft {
  return {
    title: "",
    category: "news",
    excerpt: "",
    body: "<p></p>",
    published: false,
    featured: false,
  };
}

function isCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.some((category) => category === value);
}

function toDraft(post: AdminPost): Draft {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: isCategory(post.category) ? post.category : "news",
    excerpt: post.excerpt,
    body: post.body,
    published: post.status === "published",
    featured: post.isFeatured,
  };
}

function BlogAdmin() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { status } = useSession();

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useSeo({
    title: t("admin.heading"),
    description: t("admin.subheading"),
    path: "/studio-b78262a861",
    // An indexed admin dashboard is free reconnaissance for an attacker.
    noindex: true,
  });

  const reload = useCallback(() => {
    listPosts()
      .then(setPosts)
      .catch((cause: unknown) => {
        // A 401 is not an error worth showing: the session simply ended, and
        // the redirect is already taking us to the login screen.
        if (cause instanceof ApiError && cause.status === 401) return;
        setError(t("admin.loadError"));
      });
  }, [t]);

  /*
   * The route no longer gates itself in any meaningful sense — the server
   * rejects every unauthenticated request regardless of what this component
   * renders. Redirecting is a courtesy to the person, not a control.
   */
  useEffect(() => {
    if (status === "anonymous") {
      void navigate({ to: "/studio-b78262a861/login" });
      return;
    }
    if (status !== "authed") return;

    // Guarded so a response that arrives after the screen is gone cannot set
    // state on an unmounted component.
    let active = true;
    listPosts()
      .then((loaded) => {
        if (active) setPosts(loaded);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof ApiError && cause.status === 401) return;
        setError(t("admin.loadError"));
      });

    return () => {
      active = false;
    };
  }, [status, navigate, t]);

  if (status !== "authed") return null;

  /*
   * There is no longer a slug conflict to report: the server resolves a
   * duplicate title into its own URL rather than refusing the save. This used
   * to tell the author to change the title, which was the only escape when the
   * editor has no slug field — and is now advice for a state that cannot
   * happen.
   */
  function describe(): string {
    return t("admin.errorSaveFailed");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft === null || busy) return;

    const input = {
      title: draft.title.trim() || t("admin.untitled"),
      category: draft.category,
      excerpt: draft.excerpt.trim(),
      body: draft.body,
      isFeatured: draft.featured,
    };

    setBusy(true);
    setError(null);

    const saved =
      draft.id === undefined ? createPost(input) : updatePost(draft.id, input);

    /*
     * Publishing is a separate call rather than a field on the post, so it is
     * separately authorized and separately audited on the server — a save can
     * never publish something as a side effect.
     */
    saved
      .then((post) => {
        const wasPublished = post.status === "published";
        if (draft.published === wasPublished) return post;
        return draft.published ? publishPost(post.id) : unpublishPost(post.id);
      })
      .then(() => {
        setDraft(null);
        setNotice(t("admin.saved"));
        reload();
      })
      .catch(() => {
        setError(describe());
      })
      .finally(() => {
        setBusy(false);
      });
  }

  function handleDelete(post: AdminPost) {
    if (!window.confirm(t("admin.deleteConfirm", { title: post.title })))
      return;

    deletePost(post.id)
      .then(() => {
        setNotice(t("admin.deleted"));
        reload();
      })
      .catch(() => {
        setError(t("admin.errorDeleteFailed"));
      });
  }

  const ordered = [...posts].sort((a, b) =>
    (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt),
  );

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
                void logout().then(() =>
                  navigate({ to: "/studio-b78262a861/login" }),
                );
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

        {error !== null && (
          <div
            data-testid="admin-error"
            className="border-ember/40 bg-ember/10 text-ember rounded-lg border px-4 py-3 text-sm leading-relaxed"
          >
            {error}
          </div>
        )}

        {notice !== null && draft === null && (
          <div
            data-testid="admin-status"
            className="border-lavender/25 bg-indigo-deep/30 text-mist/80 rounded-lg border px-4 py-3 text-sm leading-relaxed"
          >
            {notice}
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
                  maxLength={200}
                  value={draft.title}
                  onChange={(event) => {
                    setDraft({ ...draft, title: event.target.value });
                  }}
                  className={inputClass}
                  data-testid="admin-title"
                />
                {/*
                  The address this post answers on, shown rather than editable:
                  it is derived from the title and assigned by the server, and a
                  duplicate title earns a suffix the author would otherwise
                  never see. Renaming moves it — the old address keeps
                  redirecting — so it is worth being able to read.
                */}
                <p
                  data-testid="admin-post-url"
                  className="text-mist/45 truncate font-mono text-xs"
                >
                  {draft.slug === undefined
                    ? t("admin.postUrlNew")
                    : `/blog/${draft.slug}`}
                </p>
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
                    const next = event.target.value;
                    if (isCategory(next))
                      setDraft({ ...draft, category: next });
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
                required
                maxLength={2000}
                value={draft.excerpt}
                onChange={(event) => {
                  setDraft({ ...draft, excerpt: event.target.value });
                }}
                className={clsx(inputClass, "resize-y")}
                data-testid="admin-excerpt"
              />
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
                disabled={busy}
                data-testid="admin-save"
                className={brandButtonClass({
                  className: "disabled:opacity-60",
                })}
              >
                {busy ? t("admin.saving") : t("admin.save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setError(null);
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
                  setNotice(null);
                  setError(null);
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
                  key={post.id}
                  data-testid={`admin-post-${post.slug}`}
                  className="border-indigo-deep bg-ink-deep/60 flex flex-wrap items-center gap-4 rounded-xl border p-4 sm:p-5"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="eyebrow text-lavender/80">
                        {t(`blog.categories.${post.category}`)}
                      </span>
                      {post.status !== "published" && (
                        <span className="text-mist/40 text-xs">
                          · {t("admin.draftTag")}
                        </span>
                      )}
                      {post.isFeatured && (
                        <span className="text-lavender/70 text-xs">
                          · {t("admin.featuredTag")}
                        </span>
                      )}
                    </div>
                    <p className="text-mist truncate text-base font-medium">
                      {post.title}
                    </p>
                    {/*
                      The address, because a title does not always identify the
                      post: two articles can share one, and the second gets a
                      suffix it would otherwise only discover by opening it.
                      This is the line that tells them apart.
                    */}
                    <p
                      data-testid={`admin-slug-${post.slug}`}
                      className="text-mist/40 truncate font-mono text-xs"
                    >
                      /blog/{post.slug}
                    </p>
                    <p className="text-mist/45 text-xs">
                      {new Date(
                        post.publishedAt ?? post.updatedAt,
                      ).toLocaleDateString(i18n.language, {
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
                        setNotice(null);
                        setError(null);
                        setDraft(toDraft(post));
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
