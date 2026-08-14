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

test.describe("image editing", () => {
  /** A post whose body already carries an image, so the drag tests have one. */
  const ILLUSTRATED = {
    ...POST,
    body:
      "<p>first paragraph</p>" +
      '<img src="/api/public/media/test.webp" alt="" class="blog-image" ' +
      'data-display-width="50" data-align="center" width="200" height="100">' +
      "<p>second paragraph</p><p>third paragraph</p>",
  };

  /*
   * Playwright cannot start Chromium's NATIVE drag pipeline, so the drag tests
   * drive the editor's handlers with synthetic DragEvents and simulate the
   * engine defaults the reconciliation exists for — a copy inserted at the
   * drop point, a source deleted at dragend. What is asserted is the invariant
   * the author cares about: a drag repositions exactly one image, whatever
   * the browser did around it. Reconciliation is deferred past the engine's
   * own cleanup, so assertions wait two frames.
   */
  async function openEditor(page: Page) {
    await mockApi(page, { authed: true, posts: [ILLUSTRATED] });
    await page.goto("/studio-b78262a861");
    await page.getByTestId(`admin-edit-${ILLUSTRATED.slug}`).click();
    await page.waitForSelector('[data-testid="editor-body"] img');
  }

  test("repositions a dragged image exactly once, even when the engine inserts its own copy", async ({
    page,
  }) => {
    await openEditor(page);

    const result = await page.evaluate(async () => {
      const editor = document.querySelector('[data-testid="editor-body"]');
      if (!editor) throw new Error("no editor");
      const img = editor.querySelector("img");
      const target = [...editor.querySelectorAll("p")].at(-1);
      if (!img || !target) throw new Error("no image or target");

      const rect = target.getBoundingClientRect();
      const opts: DragEventInit = {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
        clientX: rect.left + 10,
        clientY: rect.bottom - 2,
      };
      img.dispatchEvent(new DragEvent("dragstart", opts));
      editor.dispatchEvent(new DragEvent("dragover", opts));
      target.dispatchEvent(new DragEvent("drop", opts));
      // What the engine's unsuppressed drop default would leave behind.
      editor.append(img.cloneNode(true));
      img.dispatchEvent(new DragEvent("dragend", opts));

      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 0)),
        ),
      );
      return {
        images: editor.querySelectorAll("img").length,
        order: [...editor.children].map((el) => el.tagName).join(","),
      };
    });

    expect(result.images).toBe(1);
    // Moved below the third paragraph, with the trailing line the editor keeps
    // after a final image.
    expect(result.order).toBe("P,P,P,IMG,P");
  });

  test("restores the image when the engine deletes the source after the drop", async ({
    page,
  }) => {
    await openEditor(page);

    const images = await page.evaluate(async () => {
      const editor = document.querySelector('[data-testid="editor-body"]');
      if (!editor) throw new Error("no editor");
      const img = editor.querySelector("img");
      const target = [...editor.querySelectorAll("p")].at(-1);
      if (!img || !target) throw new Error("no image or target");

      const rect = target.getBoundingClientRect();
      const opts: DragEventInit = {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
        clientX: rect.left + 10,
        clientY: rect.bottom - 2,
      };
      img.dispatchEvent(new DragEvent("dragstart", opts));
      editor.dispatchEvent(new DragEvent("dragover", opts));
      target.dispatchEvent(new DragEvent("drop", opts));
      img.remove(); // Chromium's deleteByDrag.
      editor.dispatchEvent(new DragEvent("dragend", opts));

      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 0)),
        ),
      );
      return editor.querySelectorAll("img").length;
    });

    expect(images).toBe(1);
  });

  test("moves an image dragged after being clicked, where dragstart misses the img", async ({
    page,
  }) => {
    await openEditor(page);

    const result = await page.evaluate(async () => {
      const editor = document.querySelector('[data-testid="editor-body"]');
      if (!editor) throw new Error("no editor");
      const img = editor.querySelector("img");
      const target = editor.querySelector("p");
      if (!img || !target) throw new Error("no image or target");

      // Clicking before dragging — how anyone repositions an image. The
      // pointerdown records the drag source; the engine may then aim
      // dragstart at the container instead of the image.
      img.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true }),
      );

      const rect = target.getBoundingClientRect();
      const opts: DragEventInit = {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
        clientX: rect.left + 10,
        clientY: rect.top + 2,
      };
      editor.dispatchEvent(new DragEvent("dragstart", opts));
      editor.dispatchEvent(new DragEvent("dragover", opts));
      target.dispatchEvent(new DragEvent("drop", opts));
      editor.dispatchEvent(new DragEvent("dragend", opts));

      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 0)),
        ),
      );
      return {
        images: editor.querySelectorAll("img").length,
        first: editor.firstElementChild?.tagName,
      };
    });

    expect(result.images).toBe(1);
    // Dropped above the first paragraph's midline, so it leads the article.
    expect(result.first).toBe("IMG");
  });

  test("cancels the engine's own drop edits at the beforeinput layer", async ({
    page,
  }) => {
    await openEditor(page);

    const prevented = await page.evaluate(() => {
      const editor = document.querySelector('[data-testid="editor-body"]');
      if (!editor) throw new Error("no editor");
      const img = editor.querySelector("img");
      if (!img) throw new Error("no image");

      img.dispatchEvent(
        new DragEvent("dragstart", {
          bubbles: true,
          cancelable: true,
          dataTransfer: new DataTransfer(),
        }),
      );

      // Chromium expresses its half of the drag as these two, mid-flight.
      const results = ["deleteByDrag", "insertFromDrop"].map((inputType) => {
        const event = new InputEvent("beforeinput", {
          bubbles: true,
          cancelable: true,
          inputType,
        });
        editor.dispatchEvent(event);
        return event.defaultPrevented;
      });

      editor.dispatchEvent(
        new DragEvent("dragend", { bubbles: true, cancelable: true }),
      );
      return results;
    });

    expect(prevented).toEqual([true, true]);
  });

  test("previews where the image will land while dragging", async ({
    page,
  }) => {
    await openEditor(page);

    const during = await page.evaluate(async () => {
      const editor = document.querySelector('[data-testid="editor-body"]');
      if (!editor) throw new Error("no editor");
      const img = editor.querySelector("img");
      const target = [...editor.querySelectorAll("p")].at(-1);
      if (!img || !target) throw new Error("no image or target");

      const rect = target.getBoundingClientRect();
      const opts: DragEventInit = {
        bubbles: true,
        cancelable: true,
        dataTransfer: new DataTransfer(),
        clientX: rect.left + 10,
        clientY: rect.bottom - 2,
      };
      img.dispatchEvent(new DragEvent("dragstart", opts));
      editor.dispatchEvent(new DragEvent("dragover", opts));
      // The indicator renders a frame later; give it two.
      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 0)),
        ),
      );
      return (
        document.querySelector('[data-testid="editor-drop-indicator"]') !== null
      );
    });
    expect(during).toBe(true);

    const after = await page.evaluate(async () => {
      const editor = document.querySelector('[data-testid="editor-body"]');
      if (!editor) throw new Error("no editor");
      editor.dispatchEvent(
        new DragEvent("dragend", { bubbles: true, cancelable: true }),
      );
      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 0)),
        ),
      );
      return (
        document.querySelector('[data-testid="editor-drop-indicator"]') !== null
      );
    });
    expect(after).toBe(false);
  });

  test("resizes smoothly with the handle and snaps to a step on release", async ({
    page,
  }) => {
    await openEditor(page);

    // Select the image so the handle appears.
    const image = page.locator('[data-testid="editor-body"] img');
    await image.click();
    const handle = page.getByTestId("editor-resize-handle");
    await expect(handle).toBeVisible();

    const editorBox = await page.getByTestId("editor-body").boundingBox();
    const handleBox = await handle.boundingBox();
    if (!editorBox || !handleBox) throw new Error("no boxes");

    // Drag the corner right by a quarter of the column: 50% grows towards 75%.
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + editorBox.width * 0.25, startY, {
      steps: 8,
    });

    // Mid-drag: live preview via inline style, and the chip names the step.
    await expect(page.getByTestId("editor-resize-percent")).toHaveText("75%");
    const midStyle = await image.getAttribute("style");
    expect(midStyle).toContain("width");

    await page.mouse.up();

    // Released: snapped to the step, and the preview style is gone entirely.
    await expect(image).toHaveAttribute("data-display-width", "75");
    await expect(image).not.toHaveAttribute("style", /width/);
  });

  test("uploads a pasted image instead of inlining it as base64", async ({
    page,
  }) => {
    await openEditor(page);

    // The upload endpoint, which mockApi does not cover.
    await page.route("**/api/media", (route) =>
      json(route, 201, {
        path: "/api/public/media/pasted.webp",
        width: 10,
        height: 10,
      }),
    );

    const result = await page.evaluate(async () => {
      const editor = document.querySelector('[data-testid="editor-body"]');
      if (!editor) throw new Error("no editor");

      // A 1x1 PNG, as the clipboard would carry a screenshot.
      const bytes = Uint8Array.from(
        atob(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        ),
        (c) => c.codePointAt(0) ?? 0,
      );
      const data = new DataTransfer();
      data.items.add(new File([bytes], "shot.png", { type: "image/png" }));

      editor.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: data,
        }),
      );

      // The upload round-trips before the image lands.
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        uploaded: [...editor.querySelectorAll("img")].some((el) =>
          el.getAttribute("src")?.includes("/api/public/media/pasted.webp"),
        ),
        inlined: editor.innerHTML.includes("data:image"),
      };
    });

    expect(result.uploaded).toBe(true);
    // The whole point: no megabytes of base64 for the sanitizer to strip.
    expect(result.inlined).toBe(false);
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
