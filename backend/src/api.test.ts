import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { eq, like } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "./index.js";
import { hashPassword } from "./auth/password.js";
import { db, pool } from "./db/client.js";
import { adminUsers, posts, sessions } from "./db/schema.js";

/*
 * Integration tests against the real app and a real database. These exist to
 * attack the API, not to demonstrate that the happy path works: every guard is
 * probed with a request that should fail, because a guard nobody has tried to
 * get past is an assumption, not a control.
 *
 * Requires Postgres. Fixtures are namespaced and removed afterwards.
 */

const ORIGIN = "http://localhost:3000";
const EMAIL = "integration-test@assistsec.test";
const PASSWORD = "integration-test-password-1234";

let server: Server;
let base: string;
let userId: string;

interface Session {
  cookie: string;
  csrfToken: string;
}

function url(path: string): string {
  return `${base}${path}`;
}

async function login(): Promise<Session> {
  const response = await fetch(url("/api/auth/login"), {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  expect(response.status).toBe(200);
  const cookie = response.headers.get("set-cookie") ?? "";
  const body = (await response.json()) as { csrfToken?: string };
  expect(body.csrfToken).toBeTypeOf("string");

  return {
    cookie: cookie.split(";")[0] ?? "",
    csrfToken: body.csrfToken ?? "",
  };
}

function authed(
  session: Session,
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    "content-type": "application/json",
    origin: ORIGIN,
    cookie: session.cookie,
    "x-csrf-token": session.csrfToken,
    ...extra,
  };
}

const draft = {
  title: "Integration test post",
  category: "news",
  excerpt: "An excerpt.",
  body: "<p>Body text.</p>",
};

/*
 * These tests create accounts, publish posts and delete rows. Run against a
 * database someone is actually using, that is data loss with a green tick next
 * to it — and the default `.env` on a developer's machine points at exactly
 * such a database.
 *
 * So the suite refuses to start unless the target is named like a test
 * database. Set DB_NAME in `.env.test` (see .env.test.example), or opt out
 * deliberately with ALLOW_DESTRUCTIVE_TESTS=1 if you really mean it.
 */
function assertDisposableDatabase(): void {
  const name = process.env.DB_NAME ?? "";
  if (process.env.ALLOW_DESTRUCTIVE_TESTS === "1") return;
  if (/(^|[_-])test(ing)?$/.test(name)) return;

  throw new Error(
    `refusing to run destructive tests against "${name}": its name does not ` +
      "end in _test. Create a throwaway database and point backend/.env.test " +
      "at it, or set ALLOW_DESTRUCTIVE_TESTS=1 to override.",
  );
}

beforeAll(async () => {
  assertDisposableDatabase();
  server = app.listen(0);
  const address = server.address() as AddressInfo;
  base = `http://127.0.0.1:${String(address.port)}`;

  await db.delete(adminUsers).where(eq(adminUsers.email, EMAIL));
  const [row] = await db
    .insert(adminUsers)
    .values({
      email: EMAIL,
      name: "Integration Test",
      passwordHash: await hashPassword(PASSWORD),
    })
    .returning({ id: adminUsers.id });

  userId = row?.id ?? "";
});

afterAll(async () => {
  await db.delete(posts).where(like(posts.slug, "integration-test%"));
  if (userId.length > 0) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(adminUsers).where(eq(adminUsers.id, userId));
  }
  await new Promise<void>((resolve) =>
    server.close(() => {
      resolve();
    }),
  );
  await pool.end();
});

describe("public surface", () => {
  it("serves health and published posts without a session", async () => {
    expect((await fetch(url("/health"))).status).toBe(200);

    const response = await fetch(url("/api/public/posts"));
    expect(response.status).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });

  it("does not leak drafts", async () => {
    const session = await login();
    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test secret draft",
      }),
    });
    expect(created.status).toBe(201);

    const publicList = (await (
      await fetch(url("/api/public/posts"))
    ).json()) as {
      slug: string;
    }[];
    expect(publicList.some((p) => p.slug.includes("secret-draft"))).toBe(false);

    const direct = await fetch(
      url("/api/public/posts/integration-test-secret-draft"),
    );
    expect(direct.status).toBe(404);
  });

  it("rejects path traversal on media", async () => {
    for (const attempt of [
      "..%2f..%2fetc%2fpasswd",
      "....//etc/passwd",
      "x.webp.php",
      "shell.php",
    ]) {
      const response = await fetch(url(`/api/public/media/${attempt}`));
      expect(response.status).toBe(404);
    }
  });
});

describe("authentication", () => {
  it("refuses every admin route without a session", async () => {
    const cases: [string, string][] = [
      ["GET", "/api/posts"],
      ["POST", "/api/posts"],
      ["PATCH", "/api/posts/00000000-0000-4000-8000-000000000000"],
      ["DELETE", "/api/posts/00000000-0000-4000-8000-000000000000"],
      ["POST", "/api/posts/00000000-0000-4000-8000-000000000000/publish"],
      ["POST", "/api/media"],
      ["POST", "/api/deploy"],
      ["GET", "/api/auth/me"],
    ];

    for (const [method, path] of cases) {
      const response = await fetch(url(path), {
        method,
        headers: { "content-type": "application/json", origin: ORIGIN },
      });
      expect([401, 403], `${method} ${path}`).toContain(response.status);
    }
  });

  it("gives the same answer for a wrong password and an unknown account", async () => {
    const wrong = await fetch(url("/api/auth/login"), {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN },
      body: JSON.stringify({ email: EMAIL, password: "not-the-password" }),
    });
    const unknown = await fetch(url("/api/auth/login"), {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN },
      body: JSON.stringify({ email: "nobody@assistsec.test", password: "x" }),
    });

    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
  });

  it("does not put the session in a readable cookie", async () => {
    const response = await fetch(url("/api/auth/login"), {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
  });

  it("stops honouring a session once it is revoked", async () => {
    const session = await login();
    expect(
      (await fetch(url("/api/auth/me"), { headers: authed(session) })).status,
    ).toBe(200);

    await fetch(url("/api/auth/logout"), {
      method: "POST",
      headers: authed(session),
    });

    const after = await fetch(url("/api/auth/me"), {
      headers: authed(session),
    });
    expect(after.status).toBe(401);
  });

  it("rejects a forged session id without a server error", async () => {
    for (const forged of [
      "not-a-uuid",
      "' OR 1=1--",
      "00000000-0000-4000-8000-000000000000",
    ]) {
      const response = await fetch(url("/api/auth/me"), {
        headers: { cookie: `cms_session=${forged}`, origin: ORIGIN },
      });
      expect(response.status).toBe(401);
    }
  });
});

describe("CSRF", () => {
  it("rejects a state-changing request that has the cookie but no token", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: ORIGIN,
        cookie: session.cookie,
      },
      body: JSON.stringify(draft),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "csrf_failed" });
  });

  it("rejects a wrong token", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session, { "x-csrf-token": "0".repeat(64) }),
      body: JSON.stringify(draft),
    });
    expect(response.status).toBe(403);
  });

  it("rejects another origin even with a valid session and token", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session, { origin: "https://evil.test" }),
      body: JSON.stringify(draft),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "origin_not_allowed" });
  });

  it("rejects a state-changing request with no origin at all", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: session.cookie,
        "x-csrf-token": session.csrfToken,
      },
      body: JSON.stringify(draft),
    });
    expect(response.status).toBe(403);
  });
});

describe("input handling", () => {
  it("sanitizes stored post bodies", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test xss",
        body: "<p>ok</p><script>alert(1)</script><img src=x onerror=alert(1)>",
        excerpt: "<script>alert(1)</script>plain",
      }),
    });

    expect(response.status).toBe(201);
    const created = (await response.json()) as {
      body: string;
      excerpt: string;
    };
    expect(created.body).not.toContain("<script");
    expect(created.body).not.toContain("onerror");
    expect(created.excerpt).toBe("plain");
  });

  it("ignores fields the client is not allowed to set", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test massassign",
        status: "published",
        publishedAt: "2000-01-01T00:00:00Z",
        authorId: "00000000-0000-4000-8000-000000000000",
      }),
    });

    // Rejected outright rather than silently dropped, so a client that thinks
    // it is publishing finds out that it is not.
    expect(response.status).toBe(400);
  });

  it("rejects an unknown category rather than storing it", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, category: "'; drop table posts;--" }),
    });
    expect(response.status).toBe(400);
  });

  it("answers 404, not 500, for a malformed id", async () => {
    const session = await login();
    for (const id of ["not-a-uuid", "1 OR 1=1", "../../etc/passwd"]) {
      const response = await fetch(
        url(`/api/posts/${encodeURIComponent(id)}`),
        {
          headers: authed(session),
        },
      );
      expect(response.status).toBe(404);
    }
  });

  it("answers 400, not 500, for malformed JSON", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: "{not json",
    });
    expect(response.status).toBe(400);
  });

  it("survives a SQL injection attempt in a query parameter", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts?status=' OR 1=1--"), {
      headers: authed(session),
    });
    expect(response.status).toBe(200);
  });

  it("never leaks a stack trace or driver internals", async () => {
    // Absurd input on every shape of endpoint; none may answer with anything
    // that looks like an exception. Matching on stack-trace and driver markers
    // rather than on "at ", which occurs in ordinary post prose.
    const probes = [
      `/api/public/posts?locale=${"x".repeat(500)}`,
      "/api/public/posts/" + "%2e".repeat(200),
      `/api/public/media/${"a".repeat(300)}.webp`,
      "/api/posts/%00",
    ];

    for (const probe of probes) {
      const text = await (await fetch(url(probe))).text();
      for (const marker of [
        "node_modules",
        "at Object.",
        "DrizzleQueryError",
        "/home/",
        "Error:",
      ]) {
        expect(text, `${probe} leaked ${marker}`).not.toContain(marker);
      }
    }
  });
});

describe("uploads", () => {
  it("rejects an SVG, which would be stored XSS on the marketing origin", async () => {
    const session = await login();
    const form = new FormData();
    form.set(
      "file",
      new Blob(
        ['<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>'],
        {
          type: "image/svg+xml",
        },
      ),
      "payload.svg",
    );

    const response = await fetch(url("/api/media"), {
      method: "POST",
      headers: {
        origin: ORIGIN,
        cookie: session.cookie,
        "x-csrf-token": session.csrfToken,
      },
      body: form,
    });

    expect([400, 415]).toContain(response.status);
  });

  it("rejects a file that only claims to be an image", async () => {
    const session = await login();
    const form = new FormData();
    form.set(
      "file",
      new Blob(["#!/bin/sh\necho pwned"], { type: "image/png" }),
      "payload.png",
    );

    const response = await fetch(url("/api/media"), {
      method: "POST",
      headers: {
        origin: ORIGIN,
        cookie: session.cookie,
        "x-csrf-token": session.csrfToken,
      },
      body: form,
    });

    expect([400, 415]).toContain(response.status);
  });

  it("requires a session for uploads", async () => {
    const form = new FormData();
    form.set("file", new Blob(["x"], { type: "image/png" }), "x.png");
    const response = await fetch(url("/api/media"), {
      method: "POST",
      headers: { origin: ORIGIN },
      body: form,
    });
    expect([401, 403]).toContain(response.status);
  });
});

describe("authorized flow", () => {
  it("creates, edits, publishes and deletes", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test lifecycle" }),
    });
    expect(created.status).toBe(201);
    const post = (await created.json()) as { id: string; status: string };
    expect(post.status).toBe("draft");

    const published = await fetch(url(`/api/posts/${post.id}/publish`), {
      method: "POST",
      headers: authed(session),
    });
    expect(published.status).toBe(200);

    const list = (await (await fetch(url("/api/public/posts"))).json()) as {
      slug: string;
    }[];
    expect(list.some((p) => p.slug === "integration-test-lifecycle")).toBe(
      true,
    );

    const removed = await fetch(url(`/api/posts/${post.id}`), {
      method: "DELETE",
      headers: authed(session),
    });
    expect(removed.status).toBe(204);

    const after = await fetch(
      url("/api/public/posts/integration-test-lifecycle"),
    );
    expect(after.status).toBe(404);
  });

  /*
   * Post URLs, end to end. These are the two properties that matter about a
   * slug — that it is unique, and that it never moves once published — asserted
   * through the API rather than against the generator, because both are
   * decided by the route handlers and the unique index, not by slugify.
   */
  it("gives two posts with the same title their own URLs", async () => {
    const session = await login();
    const title = "Integration test duplicate title";

    const slugs: string[] = [];
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const created = await fetch(url("/api/posts"), {
        method: "POST",
        headers: authed(session),
        body: JSON.stringify({ ...draft, title }),
      });
      expect(created.status).toBe(201);

      const post = (await created.json()) as { id: string; slug: string };
      slugs.push(post.slug);

      const published = await fetch(url(`/api/posts/${post.id}/publish`), {
        method: "POST",
        headers: authed(session),
      });
      expect(published.status).toBe(200);
    }

    const [first, second] = slugs;
    expect(first).toBe("integration-test-duplicate-title");
    // The second keeps the readable stem and earns a suffix from its own id,
    // rather than being refused as a clash the author cannot resolve — the
    // editor has no slug field to correct.
    expect(second).not.toBe(first);
    expect(second).toMatch(/^integration-test-duplicate-title-[a-f0-9]{8}$/);

    // Both are reachable, which is the point of the exercise.
    for (const slug of slugs) {
      const response = await fetch(url(`/api/public/posts/${slug}`));
      expect(response.status, `${slug} should resolve`).toBe(200);
      expect(((await response.json()) as { title: string }).title).toBe(title);
    }
  });

  it("still tracks the title while a post has never been published", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test draft name" }),
    });
    const post = (await created.json()) as { id: string; slug: string };
    expect(post.slug).toBe("integration-test-draft-name");

    const renamed = await fetch(url(`/api/posts/${post.id}`), {
      method: "PATCH",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test draft renamed",
      }),
    });

    // Nothing is published, so there is no URL to protect and the slug should
    // follow the title the author is still settling on.
    expect(((await renamed.json()) as { slug: string }).slug).toBe(
      "integration-test-draft-renamed",
    );
  });

  it("accepts a slug the author asks for outright, even after publishing", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test explicit" }),
    });
    const post = (await created.json()) as { id: string };

    await fetch(url(`/api/posts/${post.id}/publish`), {
      method: "POST",
      headers: authed(session),
    });

    const moved = await fetch(url(`/api/posts/${post.id}`), {
      method: "PATCH",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test explicit",
        slug: "Integration test explicit MOVED",
      }),
    });

    // Moving a published post is allowed, but only as a deliberate act — never
    // as a side effect of editing the title.
    expect(((await moved.json()) as { slug: string }).slug).toBe(
      "integration-test-explicit-moved",
    );
  });

  it("gives a title that transliterates to nothing a usable URL", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      // Slug-wise this is empty, which used to be a 400 the author could not
      // act on. It has to become an address instead.
      body: JSON.stringify({
        ...draft,
        title: "🔒🔥",
        slug: "integration-test-emoji",
      }),
    });
    expect(created.status).toBe(201);

    const post = (await created.json()) as { slug: string };
    expect(post.slug).toBe("integration-test-emoji");
  });

  it("lets a reader see an edit without waiting out a cache window", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test freshness" }),
    });
    const post = (await created.json()) as { id: string };
    await fetch(url(`/api/posts/${post.id}/publish`), {
      method: "POST",
      headers: authed(session),
    });

    /*
     * The public reads must revalidate rather than sit in the browser's cache
     * for a fixed window. `max-age=60` meant an edit was invisible for a minute
     * to every tab already open — including the author's, where refreshing
     * changed nothing and the CMS looked broken.
     */
    const list = await fetch(url("/api/public/posts"));
    expect(list.headers.get("cache-control")).toBe("no-cache");

    const etag = list.headers.get("etag");
    expect(etag).not.toBe(null);

    // Revalidation has to be cheap, or "no-cache" just means "download it all
    // again every time".
    const unchanged = await fetch(url("/api/public/posts"), {
      headers: { "if-none-match": etag ?? "" },
    });
    expect(unchanged.status).toBe(304);

    // And an edit must invalidate that ETag, so the next request gets the body.
    await fetch(url(`/api/posts/${post.id}`), {
      method: "PATCH",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test freshness, edited",
      }),
    });

    const after = await fetch(url("/api/public/posts"), {
      headers: { "if-none-match": etag ?? "" },
    });
    expect(after.status).toBe(200);
    const titles = ((await after.json()) as { title: string }[]).map(
      (p) => p.title,
    );
    expect(titles).toContain("Integration test freshness, edited");
  });

  it("moves the URL with the title and keeps the old one working", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test working in kitchen",
      }),
    });
    const post = (await created.json()) as { id: string; slug: string };
    expect(post.slug).toBe("integration-test-working-in-kitchen");

    await fetch(url(`/api/posts/${post.id}/publish`), {
      method: "POST",
      headers: authed(session),
    });

    const renamed = await fetch(url(`/api/posts/${post.id}`), {
      method: "PATCH",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test working in garage",
      }),
    });

    // The address follows the headline, rather than staying at a slug that no
    // longer describes the article.
    const after = (await renamed.json()) as { slug: string };
    expect(after.slug).toBe("integration-test-working-in-garage");

    const live = await fetch(
      url("/api/public/posts/integration-test-working-in-garage"),
    );
    expect(live.status).toBe(200);

    // And the address it was shared under still arrives, permanently.
    const old = await fetch(
      url("/api/public/posts/integration-test-working-in-kitchen"),
      { redirect: "manual" },
    );
    expect(old.status).toBe(301);
    expect(old.headers.get("location")).toContain(
      "integration-test-working-in-garage",
    );

    // The list advertises the former address, which is what the site and the
    // build turn into a redirect.
    const list = (await (await fetch(url("/api/public/posts"))).json()) as {
      slug: string;
      aliases: string[];
    }[];
    const entry = list.find(
      (p) => p.slug === "integration-test-working-in-garage",
    );
    expect(entry?.aliases).toContain("integration-test-working-in-kitchen");
  });

  it("refuses to hand a retired address to a different post", async () => {
    const session = await login();

    const first = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test moved away" }),
    });
    const moved = (await first.json()) as { id: string; slug: string };
    await fetch(url(`/api/posts/${moved.id}/publish`), {
      method: "POST",
      headers: authed(session),
    });
    await fetch(url(`/api/posts/${moved.id}`), {
      method: "PATCH",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test settled here",
      }),
    });

    // A second post asks for the address the first one left behind. Granting it
    // would silently hijack every link that still points at the first article.
    const second = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test moved away" }),
    });
    const squatter = (await second.json()) as { slug: string };
    expect(squatter.slug).not.toBe("integration-test-moved-away");
    expect(squatter.slug).toMatch(/^integration-test-moved-away-[a-f0-9]{8}$/);

    // The old address still points at the post that used to own it.
    const followed = await fetch(
      url("/api/public/posts/integration-test-moved-away"),
      { redirect: "manual" },
    );
    expect(followed.headers.get("location")).toContain(
      "integration-test-settled-here",
    );
  });

  it("lets a post reclaim an address it retired earlier", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test round trip" }),
    });
    const post = (await created.json()) as { id: string };
    await fetch(url(`/api/posts/${post.id}/publish`), {
      method: "POST",
      headers: authed(session),
    });

    const rename = (title: string) =>
      fetch(url(`/api/posts/${post.id}`), {
        method: "PATCH",
        headers: authed(session),
        body: JSON.stringify({ ...draft, title }),
      });

    await rename("Integration test round trip renamed");
    const back = await rename("Integration test round trip");

    // Undoing a rename has to land back on the original address, not on a
    // suffixed variant of it, and the post must not redirect to itself.
    const final = (await back.json()) as { slug: string };
    expect(final.slug).toBe("integration-test-round-trip");

    const direct = await fetch(
      url("/api/public/posts/integration-test-round-trip"),
      { redirect: "manual" },
    );
    expect(direct.status).toBe(200);
  });

  it("does not retire an address a draft never published under", async () => {
    const session = await login();

    const created = await fetch(url("/api/posts"), {
      method: "POST",
      headers: authed(session),
      body: JSON.stringify({ ...draft, title: "Integration test never live" }),
    });
    const post = (await created.json()) as { id: string };

    await fetch(url(`/api/posts/${post.id}`), {
      method: "PATCH",
      headers: authed(session),
      body: JSON.stringify({
        ...draft,
        title: "Integration test never live renamed",
      }),
    });
    await fetch(url(`/api/posts/${post.id}/publish`), {
      method: "POST",
      headers: authed(session),
    });

    // Nothing was ever shared under the draft's first slug, so it should not be
    // occupying an address or redirecting anywhere.
    const stale = await fetch(
      url("/api/public/posts/integration-test-never-live"),
      { redirect: "manual" },
    );
    expect(stale.status).toBe(404);
  });

  it("does not expose internal columns in admin responses", async () => {
    const session = await login();
    const response = await fetch(url("/api/posts"), {
      headers: authed(session),
    });
    const rows = (await response.json()) as Record<string, unknown>[];

    for (const row of rows) {
      expect(row).not.toHaveProperty("authorId");
      expect(row).not.toHaveProperty("lastEditedById");
    }
  });
});
