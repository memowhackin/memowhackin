import type { NextFunction, Request, Response } from "express";
import { tokensMatch } from "../auth/session.js";

const CSRF_HEADER = "x-csrf-token";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/*
 * Synchronizer-token CSRF check. Runs after the session has been resolved, so
 * `req.session` holds the token minted at login and stored on the session row.
 *
 * The client receives that token in the login response body and replays it as a
 * header. An attacker on another origin can make the browser *send* a
 * credentialed request, but cannot read the login response and so cannot learn
 * the token — and a custom header also forces a preflight, which the CORS
 * allowlist then rejects.
 */
export function requireCsrfToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const expected = req.session?.csrfToken;
  if (expected === undefined) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const received = req.get(CSRF_HEADER);
  if (received === undefined || !tokensMatch(expected, received)) {
    res.status(403).json({ error: "csrf_failed" });
    return;
  }

  next();
}
