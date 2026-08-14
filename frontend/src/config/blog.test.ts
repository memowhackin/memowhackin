import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The blog's read path, which is the only thing between a published row in the
 * CMS and what a visitor sees.
 *
 * Every test imports the module fresh: it caches the in-flight request at module
 * scope on purpose, so a shared instance would leak one test's posts into the
 * next and hide exactly the bugs this covers.
 */

interface Post {
  slug: string;
  title: string;
}

function post(slug: string): Post {
  return { slug, title: slug };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Which locales were requested, in order. */
function requestedLocales(fetchMock: ReturnType<typeof vi.fn>): string[] {
  return fetchMock.mock.calls.map((call) => {
    const url = new URL(String(call[0]), "http://localhost");
    return url.searchParams.get("locale") ?? "";
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function loadModule(siteLocale = "en") {
  vi.doMock("@/config/locale", () => ({
    DEFAULT_LOCALE: "en",
    SITE_LOCALE: siteLocale,
  }));
  return import("@/config/blog");
}

describe("loadBlogPosts", () => {
  it("requests this build's language, same-origin", async () => {
    fetchMock.mockResolvedValue(jsonResponse([post("a")]));
    const { loadBlogPosts } = await loadModule("nl");

    await loadBlogPosts();

    const url = String(fetchMock.mock.calls[0]?.[0]);
    expect(url).toBe("/api/public/posts?locale=nl");
  });

  it("falls back to the default language when this one has no posts", async () => {
    // An empty blog reads as broken. A Dutch visitor should see the English
    // articles until someone writes a Dutch one.
    fetchMock
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([post("english-only")]));
    const { loadBlogPosts } = await loadModule("nl");

    const posts = await loadBlogPosts();

    expect(requestedLocales(fetchMock)).toEqual(["nl", "en"]);
    expect(posts.map((entry) => entry.slug)).toEqual(["english-only"]);
  });

  it("does not ask twice when the default language is the one that is empty", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    const { loadBlogPosts } = await loadModule("en");

    expect(await loadBlogPosts()).toEqual([]);
    expect(requestedLocales(fetchMock)).toEqual(["en"]);
  });

  it("makes one request no matter how many callers ask", async () => {
    // The index and an article opened from it render off the same data; two
    // requests for it would be two round trips on every page load.
    fetchMock.mockResolvedValue(jsonResponse([post("a")]));
    const { loadBlogPosts } = await loadModule();

    await Promise.all([loadBlogPosts(), loadBlogPosts()]);
    await loadBlogPosts();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries after a failure instead of caching it for the life of the page", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(jsonResponse([post("a")]));
    const { loadBlogPosts } = await loadModule();

    await expect(loadBlogPosts()).rejects.toThrow("network down");
    // A cached rejection would leave the blog broken until a full reload.
    expect((await loadBlogPosts()).map((entry) => entry.slug)).toEqual(["a"]);
  });

  it("rejects rather than rendering an error page's body as posts", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "boom" }, 500));
    const { loadBlogPosts } = await loadModule();

    await expect(loadBlogPosts()).rejects.toThrow("500");
  });

  it("drops entries that are not posts", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([post("real"), { title: "no slug" }, null, "nonsense"]),
    );
    const { loadBlogPosts } = await loadModule();

    expect((await loadBlogPosts()).map((entry) => entry.slug)).toEqual([
      "real",
    ]);
  });
});

describe("loadPostBySlug", () => {
  it("finds the post and reuses the list", async () => {
    fetchMock.mockResolvedValue(jsonResponse([post("a"), post("b")]));
    const { loadBlogPosts, loadPostBySlug } = await loadModule();

    await loadBlogPosts();
    expect((await loadPostBySlug("b"))?.slug).toBe("b");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns undefined for a slug that is not published", async () => {
    fetchMock.mockResolvedValue(jsonResponse([post("a")]));
    const { loadPostBySlug } = await loadModule();

    expect(await loadPostBySlug("draft")).toBeUndefined();
  });
});
