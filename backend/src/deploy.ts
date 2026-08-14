import { env } from "./env.js";
import { logger } from "./logger.js";

/*
 * Publishing a post asks the static site to rebuild. Two rules matter here:
 *
 *   1. It never blocks or fails the author's request. The post is already
 *      saved; a hook that is slow or down is an operational problem, not a
 *      failed save.
 *   2. It debounces. Ten edits in a row should produce one build, not ten.
 *
 * With no hook configured the whole thing is a no-op, so everything else works
 * before the deploy pipeline exists.
 */

const DEBOUNCE_MS = 120_000;

let pendingUntil = 0;

export function triggerDeploy(reason: string): void {
  if (env.DEPLOY_HOOK_URL.length === 0) {
    logger.debug({ reason }, "deploy hook not configured, skipping");
    return;
  }

  const now = Date.now();
  if (now < pendingUntil) {
    logger.debug({ reason }, "deploy already pending, debounced");
    return;
  }
  pendingUntil = now + DEBOUNCE_MS;

  void fire(reason);
}

async function fire(reason: string): Promise<void> {
  try {
    const response = await fetch(env.DEPLOY_HOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/vnd.github+json",
        authorization: `Bearer ${env.DEPLOY_HOOK_TOKEN}`,
      },
      body: JSON.stringify({ event_type: "publish-blog" }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      logger.info({ reason, status: response.status }, "deploy triggered");
      return;
    }
    logger.error(
      { reason, status: response.status },
      "deploy hook rejected the request",
    );
  } catch (error) {
    logger.error({ err: error, reason }, "deploy hook call failed");
  }
}
