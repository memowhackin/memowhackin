import type { NextFunction, Request, Response } from "express";
import { env } from "../env.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/*
 * Defence in depth in front of the CSRF token: every state-changing request
 * must carry an Origin (or, for older clients, a Referer) that is on the
 * allowlist.
 *
 * CORS alone does not do this. A browser blocks the attacker from *reading* a
 * cross-origin response, but the request is still sent and still executed —
 * and multipart/form-data is CORS-safelisted, so an upload needs no preflight
 * at all. Checking the origin server-side is what stops the request happening.
 *
 * A missing Origin on a state-changing request is rejected rather than allowed:
 * every browser sends it on cross-origin and on non-GET same-origin requests,
 * so absence means a non-browser client, which has no business using cookies.
 */
export function requireAllowedOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  if (origin !== undefined) {
    if (env.allowedOrigins.includes(origin)) {
      next();
      return;
    }
    res.status(403).json({ error: "origin_not_allowed" });
    return;
  }

  const referer = req.get("referer");
  if (referer !== undefined) {
    const base = safeOrigin(referer);
    if (base !== undefined && env.allowedOrigins.includes(base)) {
      next();
      return;
    }
  }

  res.status(403).json({ error: "origin_required" });
}

function safeOrigin(value: string): string | undefined {
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}
