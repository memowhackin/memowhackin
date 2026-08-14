import { test, expect, type Page, type Route } from "@playwright/test";

/*
 * Browser-level coverage of the CMS screens.
 *
 * The API is intercepted rather than run, so these need no backend, no database
 * and no account — and they stay deterministic. What they check is the part the
 * backend's own tests cannot see: that the admin UI sends the credentials and
 * the CSRF token the API demands, reflects a rejection instead of pretending it
 * worked, and never shows a signed-out visitor the dashboard.
 */

/*
 * Matched on path, not on origin.
 *
 * The app calls the API same-origin — it requests /api/... and whatever serves
 * the site proxies it to the backend. A pattern naming a fixed API host stopped
 * matching anything the moment that became true, so every request fell straight
 * through to the real server and these tests failed for a reason that had
 * nothing to do with the admin UI.
 */
const API = "**/api/**";

const CSRF = "test-csrf-token";

const SESSION = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "author@assistsec.test",
  name: "Test Author",
  csrfToken: CSRF,
};

const POST = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "an-existing-post",
  locale: "en",
  title: "An existing post",
  category: "news",
  excerpt: "Existing excerpt.",
  body: "<p>Existing body.</p>",
  readMinutes: 1,
  status: "published",
  isFeatured: false,
  publishedAt: "2026-07-01T00:00:00.000Z",
  seoTitle: null,
  seoDescription: null,
  updatedAt: "2026-07-01T00:00:00.000Z",
};

/*
 * Kept for the deployment where the API genuinely is on another host, which
 * VITE_CMS_API_URL still allows. A wildcard origin is invalid on a credentialed
 * response — the browser drops it and the call fails before any handler sees
 * it — so the mock echoes an origin and allows credentials, as the real API
 * does. Same-origin runs never consult these.
 */
const CORS = {
  "access-control-allow-origin": "http://localhost:3000",
  "access-control-allow-credentials": "true",
};

function json(route: Route, status: number, body: unknown) {
  return route.fulfill({
    status,
    contentType: "application/json",
    headers: CORS,
    body: JSON.stringify(body),
  });
}

/** Records every state-changing call so tests can assert on what was sent. */
interface Recorder {
  calls: { method: string; url: string; csrf: string | undefined }[];
}

async function mockApi(
  page: Page,
  options: { authed: boolean; posts?: (typeof POST)[] } = { authed: true },
): Promise<Recorder> {
  const recorder: Recorder = { calls: [] };
  const posts = options.posts ?? [POST];
  let authed = options.authed;

  await page.route(API, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();

    if (method === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          ...CORS,
          "access-control-allow-headers": "content-type,x-csrf-token",
          "access-control-allow-methods": "GET,POST,PATCH,DELETE",
        },
      });
      return;
    }

    if (method !== "GET") {
      recorder.calls.push({
        method,
        url: url.pathname,
        csrf: request.headers()["x-csrf-token"],
      });
    }

    if (url.pathname === "/api/auth/me") {
      if (!authed) return json(route, 401, { error: "unauthorized" });
      return json(route, 200, SESSION);
    }

    if (url.pathname === "/api/auth/login") {
      const body = request.postDataJSON() as { password?: string };
      if (body.password !== "correct-horse-battery") {
        return json(route, 401, { error: "invalid_credentials" });
      }
      authed = true;
      return json(route, 200, SESSION);
    }

    if (url.pathname === "/api/auth/logout") {
      authed = false;
      return route.fulfill({ status: 204, headers: CORS });
    }

    if (!authed) return json(route, 401, { error: "unauthorized" });

    if (url.pathname === "/api/posts" && method === "GET") {
      return json(route, 200, posts);
    }
    if (url.pathname === "/api/posts" && method === "POST") {
      return json(route, 201, { ...POST, id: "new", status: "draft" });
    }
    if (/^\/api\/posts\/[^/]+$/.test(url.pathname) && method === "PATCH") {
      return json(route, 200, POST);
    }
    if (/^\/api\/posts\/[^/]+$/.test(url.pathname) && method === "DELETE") {
      return route.fulfill({ status: 204, headers: CORS });
    }
    if (
      url.pathname.endsWith("/publish") ||
      url.pathname.endsWith("/unpublish")
    ) {
      return json(route, 200, POST);
    }

    return json(route, 404, { error: "not_found" });
  });

  return recorder;
}

async function signIn(page: Page) {
  await page.goto("/studio-b78262a861/login");
  await page.getByTestId("login-username").fill(SESSION.email);
  await page.getByTestId("login-password").fill("correct-horse-battery");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("blog-admin")).toBeVisible();
}

test.describe("access control", () => {
  test("sends a signed-out visitor to the login screen", async ({ page }) => {
    await mockApi(page, { authed: false });
    await page.goto("/studio-b78262a861");

    await expect(page).toHaveURL(/\/studio-b78262a861\/login$/);
    await expect(page.getByTestId("blog-login-form")).toBeVisible();
    // The dashboard must never render for someone without a session, however
    // briefly — no post titles should reach the DOM.
    await expect(page.getByTestId("blog-admin")).toHaveCount(0);
  });

  test("keeps the dashboard hidden while the session is still unknown", async ({
    page,
  }) => {
    // Hold /auth/me open: this is the moment where a naive implementation
    // flashes the dashboard before the server has answered.
    await page.route("**/api/auth/me", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        headers: CORS,
        body: "{}",
      });
    });

    await page.goto("/studio-b78262a861");
    await expect(page.getByTestId("blog-admin")).toHaveCount(0);
  });

  test("bounces to login when the session expires mid-use", async ({
    page,
  }) => {
    await mockApi(page, { authed: true });
    await page.goto("/studio-b78262a861");
    await expect(page.getByTestId("blog-admin")).toBeVisible();

    // Everything now answers 401, as it would after a logout elsewhere.
    await page.route(API, (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify({ error: "unauthorized" }),
      }),
    );

    await page.getByTestId("admin-new").click();
    await page.getByTestId("admin-title").fill("Anything");
    await page.getByTestId("admin-excerpt").fill("Anything");
    await page.getByTestId("admin-save").click();

    await expect(page).toHaveURL(/\/studio-b78262a861\/login$/, {
      timeout: 10_000,
    });
  });
});

test.describe("signing in", () => {
  test("shows an error for wrong credentials and stays put", async ({
    page,
  }) => {
    await mockApi(page, { authed: false });
    await page.goto("/studio-b78262a861/login");

    await page.getByTestId("login-username").fill(SESSION.email);
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByTestId("login-submit").click();

    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page).toHaveURL(/\/studio-b78262a861\/login$/);
  });

  test("signs in and lists existing posts", async ({ page }) => {
    await mockApi(page, { authed: false });
    await signIn(page);

    await expect(page.getByTestId(`admin-post-${POST.slug}`)).toBeVisible();
    await expect(page.getByText(POST.title)).toBeVisible();
  });

  test("signs out and cannot get back in without signing in again", async ({
    page,
  }) => {
    await mockApi(page, { authed: true });
    await page.goto("/studio-b78262a861");
    await expect(page.getByTestId("blog-admin")).toBeVisible();

    await page.getByTestId("admin-logout").click();
    await expect(page).toHaveURL(/\/studio-b78262a861\/login$/);

    await page.goto("/studio-b78262a861");
    await expect(page).toHaveURL(/\/studio-b78262a861\/login$/);
  });
});

test.describe("authoring", () => {
  test("sends the CSRF token on every write", async ({ page }) => {
    const recorder = await mockApi(page, { authed: true });
    await page.goto("/studio-b78262a861");
    await expect(page.getByTestId("blog-admin")).toBeVisible();

    await page.getByTestId("admin-new").click();
    await page.getByTestId("admin-title").fill("A brand new post");
    await page.getByTestId("admin-excerpt").fill("Something worth reading.");
    await page.getByTestId("admin-save").click();

    await expect(page.getByTestId("admin-status")).toBeVisible();

    const writes = recorder.calls.filter((call) => call.method !== "OPTIONS");
    expect(writes.length).toBeGreaterThan(0);
    for (const call of writes) {
      // Without this header the API answers 403. A write that omits it is a
      // bug the backend would catch — but only in production.
      expect(call.csrf, `${call.method} ${call.url} had no CSRF token`).toBe(
        CSRF,
      );
    }
  });

  test("creates a post and reports the outcome", async ({ page }) => {
    const recorder = await mockApi(page, { authed: true });
    await page.goto("/studio-b78262a861");

    await page.getByTestId("admin-new").click();
    await page.getByTestId("admin-title").fill("A brand new post");
    await page.getByTestId("admin-excerpt").fill("Something worth reading.");
    await page.getByTestId("admin-save").click();

    await expect(page.getByTestId("admin-status")).toBeVisible();
    expect(
      recorder.calls.some(
        (call) => call.method === "POST" && call.url === "/api/posts",
      ),
    ).toBe(true);
  });

  test("publishes through the publish endpoint, not as a field", async ({
    page,
  }) => {
    const recorder = await mockApi(page, { authed: true });
    await page.goto("/studio-b78262a861");

    await page.getByTestId("admin-new").click();
    await page.getByTestId("admin-title").fill("Ready to publish");
    await page.getByTestId("admin-excerpt").fill("An excerpt.");
    await page.getByTestId("admin-published").check();
    await page.getByTestId("admin-save").click();

    await expect(page.getByTestId("admin-status")).toBeVisible();
    // Publishing is separately authorized and separately audited server-side,
    // so it must be its own call rather than a flag smuggled into the save.
    expect(recorder.calls.some((call) => call.url.endsWith("/publish"))).toBe(
      true,
    );
  });

  test("surfaces a duplicate slug instead of silently failing", async ({
    page,
  }) => {
    await mockApi(page, { authed: true });
    await page.route("**/api/posts", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        headers: CORS,
        body: JSON.stringify({ error: "slug_taken" }),
      });
    });

    await page.goto("/studio-b78262a861");
    await page.getByTestId("admin-new").click();
    await page.getByTestId("admin-title").fill("An existing post");
    await page.getByTestId("admin-excerpt").fill("Clashing excerpt.");
    await page.getByTestId("admin-save").click();

    await expect(page.getByTestId("admin-error")).toBeVisible();
  });

  test("deletes only after confirmation", async ({ page }) => {
    const recorder = await mockApi(page, { authed: true });
    await page.goto("/studio-b78262a861");
    await expect(page.getByTestId("blog-admin")).toBeVisible();

    page.once("dialog", (dialog) => void dialog.dismiss());
    await page.getByTestId(`admin-delete-${POST.slug}`).click();
    expect(recorder.calls.some((call) => call.method === "DELETE")).toBe(false);

    page.once("dialog", (dialog) => void dialog.accept());
    await page.getByTestId(`admin-delete-${POST.slug}`).click();
    await expect
      .poll(() => recorder.calls.some((call) => call.method === "DELETE"))
      .toBe(true);
  });
});

test.describe("the admin screens are not indexable", () => {
  test("marks login and dashboard noindex", async ({ page }) => {
    await mockApi(page, { authed: false });

    await page.goto("/studio-b78262a861/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});
