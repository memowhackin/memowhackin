import type { NextFunction, Request, Response } from "express";
import {
  resolveSession,
  SESSION_COOKIE,
  type ResolvedSession,
  type SessionUser,
} from "./session.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: SessionUser;
      session?: ResolvedSession;
    }
  }
}

/** Read the session cookie without trusting cookie-parser's output shape. */
export function sessionCookie(req: Request): string | undefined {
  const cookies: unknown = req.cookies;
  if (typeof cookies !== "object" || cookies === null) return undefined;

  /*
   * Read dynamically rather than asserted into a shape. The cookie name is one
   * of two literals depending on whether cookies are Secure, and a union key
   * cannot index a narrowed unknown — so `Reflect.get` does the lookup the
   * honest way and the result is type-tested rather than trusted.
   */
  const raw: unknown = Reflect.get(cookies, SESSION_COOKIE);
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

/*
 * Attaches the session if there is a valid one, and does nothing otherwise.
 * Split out from `requireAdmin` so the CSRF check can see the session token on
 * routes that authenticate themselves, without any route becoming accidentally
 * public because a guard was ordered wrongly.
 */
export async function loadSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await resolveSession(sessionCookie(req));
  if (session !== undefined) {
    req.session = session;
    req.admin = session.user;
  }
  next();
}

/** Rejects anything without a live session. Every admin route uses this. */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.admin === undefined) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

/** The authenticated user, for handlers that already ran `requireAdmin`. */
export function currentAdmin(req: Request): SessionUser {
  if (req.admin === undefined) {
    throw new Error("currentAdmin called on an unauthenticated request");
  }
  return req.admin;
}
