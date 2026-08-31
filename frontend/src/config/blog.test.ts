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

describe("invalidateBlogPosts", () => {
  it("refetches after a CMS write instead of reusing this tab's list", async () => {
    // Publishing in the studio and following "View blog" is one client-side
    // navigation; the article just saved must be in the next list.
    fetchMock
      .mockResolvedValueOnce(jsonResponse([post("old")]))
      .mockResolvedValueOnce(jsonResponse([post("old"), post("new")]));
    const { loadBlogPosts, invalidateBlogPosts } = await loadModule();

    await loadBlogPosts();
    invalidateBlogPosts();

    const posts = await loadBlogPosts();
    expect(posts.map((entry) => entry.slug)).toEqual(["old", "new"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("skips the browser's HTTP cache when refetching", async () => {
    // The list is served with max-age=60. A refetch answered from the HTTP
    // cache would hand back the very list the write just outdated.
    // A Response body reads once, so each call needs its own.
    fetchMock.mockImplementation(() => jsonResponse([post("a")]));
    const { loadBlogPosts, invalidateBlogPosts } = await loadModule();

    await loadBlogPosts();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ cache: "default" }),
    );

    invalidateBlogPosts();
    await loadBlogPosts();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ cache: "reload" }),
    );
  });
});

describe("loadPost", () => {
  it("asks for the one article rather than the whole blog", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ ...post("b"), body: "<p>text</p>" }),
    );
    const { loadPost } = await loadModule();

    const article = await loadPost("b");

    expect(article?.body).toBe("<p>text</p>");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "/api/public/posts/b?locale=en",
    );
  });

  it("escapes the slug it was handed", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...post("x"), body: "" }));
    const { loadPost } = await loadModule();

    await loadPost("../admin");

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("..%2Fadmin");
  });

  it("returns undefined for a slug that is not published", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "not_found" }, 404));
    const { loadPost } = await loadModule();

    expect(await loadPost("draft")).toBeUndefined();
  });

  it("rejects rather than rendering an error page as an article", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "boom" }, 500));
    const { loadPost } = await loadModule();

    await expect(loadPost("a")).rejects.toThrow("500");
  });

  /*
   * The list falls back to the default language when a build's own language has
   * no articles, so every list on the Dutch site is a list of English posts.
   * Opening one has to reach the same article, or the site spends its time
   * advertising pages it then refuses to serve, which is exactly what it did.
   */
  it("falls back to the default language for an untranslated article", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "not_found" }, 404))
      .mockResolvedValueOnce(
        jsonResponse({ ...post("a"), body: "<p>english</p>" }),
      );
    const { loadPost } = await loadModule("nl");

    const article = await loadPost("a");

    expect(article?.body).toBe("<p>english</p>");
    expect(requestedLocales(fetchMock)).toEqual(["nl", "en"]);
  });

  it("does not ask twice when the build is already the default language", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "not_found" }, 404));
    const { loadPost } = await loadModule("en");

    expect(await loadPost("a")).toBeUndefined();
    expect(requestedLocales(fetchMock)).toEqual(["en"]);
  });

  it("still reports a genuinely missing article as missing", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "not_found" }, 404));
    const { loadPost } = await loadModule("nl");

    expect(await loadPost("never-existed")).toBeUndefined();
    expect(requestedLocales(fetchMock)).toEqual(["nl", "en"]);
  });

  /*
   * An outage is not a translation gap. Retrying a 500 against another locale
   * would turn a CMS that is down into an article that does not exist, and the
   * route would render its not-found state instead of the retry screen.
   */
  it("does not fall back when the failure is not a 404", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "boom" }, 500));
    const { loadPost } = await loadModule("nl");

    await expect(loadPost("a")).rejects.toThrow("500");
    expect(requestedLocales(fetchMock)).toEqual(["nl"]);
  });
});

describe("the list", () => {
  it("carries no article bodies", async () => {
    // The index describes every post; shipping each one's HTML to do that
    // meant downloading the whole blog to render a page of summaries.
    fetchMock.mockResolvedValue(jsonResponse([post("a"), post("b")]));
    const { loadBlogPosts } = await loadModule();

    for (const entry of await loadBlogPosts()) {
      expect(entry).not.toHaveProperty("body");
    }
  });
});
