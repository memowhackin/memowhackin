import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

/*
 * Login throttling, keyed on the IP *and* the submitted email. Keying on IP
 * alone lets one attacker spray many accounts from a rotating address; keying
 * on email alone lets them lock a known user out on purpose. Together, neither
 * works well.
 */
function loginKey(req: Request): string {
  const body: unknown = req.body;
  const email =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).email
      : undefined;

  const ip = ipKeyGenerator(req.ip ?? "");
  if (typeof email !== "string") return ip;

  /*
   * The key is truncated because this runs BEFORE the request body is
   * validated: the limiter sits in front of the handler, so `email` is still
   * whatever the client sent, up to the 1 MB JSON limit. Storing that verbatim
   * lets an unauthenticated caller grow the in-memory rate-limit store by a
   * megabyte per request.
   */
  return `${ip}:${email.toLowerCase().slice(0, 320)}`;
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: loginKey,
  // Failed attempts are what should be expensive; a working login should not
  // count against the author.
  skipSuccessfulRequests: true,
  message: { error: "too_many_attempts" },
});

/** A far looser cap on the public read endpoints the static build calls. */
export const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

/*
 * Authenticated writes are still bounded. A stolen session or a runaway client
 * should not be able to hammer the database or fill the disk, and the ceiling
 * is far above what a person editing prose can reach.
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "rate_limited" },
});

/** Uploads are the expensive path: decode, resize, re-encode, write. */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "rate_limited" },
});
