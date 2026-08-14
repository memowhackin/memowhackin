import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The rebuild hook.
 *
 * Publishing has to reach the static site, or the prerendered HTML a crawler
 * reads stays at whatever the last build produced while readers — who run
 * JavaScript — see the new post. That gap is invisible in a browser, which is
 * exactly why it needs a test rather than a manual check.
 *
 * Each test imports the module fresh, because the hook's configuration is read
 * once at import and its debounce is module state.
 */

const HOOK = "https://api.github.com/repos/AssistSec/landing/dispatches";

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.resetModules();
  fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function loadDeploy(url: string, token = "hook-token") {
  vi.stubEnv("DEPLOY_HOOK_URL", url);
  vi.stubEnv("DEPLOY_HOOK_TOKEN", token);
  return import("./deploy.js");
}

describe("triggerDeploy", () => {
  it("asks the pipeline to rebuild when a hook is configured", async () => {
    const { triggerDeploy } = await loadDeploy(HOOK);

    triggerDeploy("publish:a-post");
    // Fired without being awaited, so the author's save never waits on it.
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(HOOK);
    expect(init.method).toBe("POST");
    // The body is the JSON string the hook sends; read it as one rather than
    // stringifying whatever it happens to be.
    expect(typeof init.body).toBe("string");
    expect(init.body).toContain("publish-blog");

    const headers = new Headers(init.headers);
    expect(headers.get("authorization")).toBe("Bearer hook-token");
  });

  it("collapses a burst of edits into one build", async () => {
    const { triggerDeploy } = await loadDeploy(HOOK);

    triggerDeploy("publish:one");
    triggerDeploy("update:one");
    triggerDeploy("update:one-again");

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    // Ten saves in a row should cost one build, not ten.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does nothing at all when no hook is configured", async () => {
    // The default. Everything else has to work before the pipeline exists, so
    // an unset hook is a silent no-op rather than an error on every publish.
    const { triggerDeploy } = await loadDeploy("");

    triggerDeploy("publish:a-post");
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("survives a hook that is down", async () => {
    fetchMock.mockRejectedValue(new Error("connect ECONNREFUSED"));
    const { triggerDeploy } = await loadDeploy(HOOK);

    // The post is already saved; a failing hook is an operational problem, not
    // a failed save, and must never surface as one.
    expect(() => {
      triggerDeploy("publish:a-post");
    }).not.toThrow();
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
