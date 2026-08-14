import { randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import type { CookieOptions, Response } from "express";
import { db } from "../db/client.js";
import { adminUsers, sessions, type AdminUser } from "../db/schema.js";
import { secureCookies } from "../env.js";

/*
 * The `__Host-` prefix is enforced by the browser: it refuses to accept the
 * cookie unless it is Secure, path=/, and has no Domain attribute. That makes
 * it impossible for a sibling subdomain to overwrite our session cookie, which
 * is otherwise a real attack against a multi-subdomain setup. It requires HTTPS,
 * so plain-HTTP local development uses the unprefixed name.
 */
export const SESSION_COOKIE = secureCookies
  ? "__Host-cms_session"
  : "cms_session";

const LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

/*
 * sameSite "lax" with no `domain`: the admin UI is on assistsec.nl and this API
 * on cms.assistsec.nl, which share a registrable domain and are therefore the
 * same site. Widening the cookie to .assistsec.nl would hand the session to
 * every subdomain for no benefit. Note that "lax" is NOT a CSRF defence between
 * those two hosts — see csrfToken in the schema.
 */
const COOKIE_BASE: CookieOptions = {
  httpOnly: true,
  secure: secureCookies,
  sameSite: "lax",
  path: "/",
};

const COOKIE_OPTIONS: CookieOptions = { ...COOKIE_BASE, maxAge: LIFETIME_MS };

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface ResolvedSession {
  user: SessionUser;
  sessionId: string;
  csrfToken: string;
}

export interface NewSession {
  sessionId: string;
  csrfToken: string;
}

export async function createSession(
  userId: string,
  userAgent: string | undefined,
  ip: string | undefined,
): Promise<NewSession> {
  const csrfToken = randomBytes(32).toString("hex");

  const [row] = await db
    .insert(sessions)
    .values({
      userId,
      csrfToken,
      expiresAt: new Date(Date.now() + LIFETIME_MS),
      userAgent: userAgent?.slice(0, 400) ?? null,
      ip: ip?.slice(0, 64) ?? null,
    })
    .returning({ id: sessions.id });

  if (row === undefined) throw new Error("session insert returned no row");
  return { sessionId: row.id, csrfToken };
}

/**
 * Resolve a cookie value to its session, or undefined. Returns nothing for an
 * expired session or a deactivated account, so locking someone out takes effect
 * on their next request rather than whenever their cookie happens to expire.
 */
export async function resolveSession(
  sessionId: string | undefined,
): Promise<ResolvedSession | undefined> {
  // Postgres raises a type error on a malformed uuid, which would surface as a
  // 500 on any request carrying a junk cookie. Reject the shape first.
  if (sessionId === undefined || !UUID.test(sessionId)) return undefined;

  const rows = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      csrfToken: sessions.csrfToken,
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      isActive: adminUsers.isActive,
    })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);

  const row = rows[0];
  if (!row?.isActive) return undefined;

  // Sliding expiry: extend once the session is past halfway, so an active
  // author is not logged out mid-post, while an abandoned cookie still dies.
  const remaining = row.expiresAt.getTime() - Date.now();
  if (remaining < LIFETIME_MS / 2) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + LIFETIME_MS) })
      .where(eq(sessions.id, row.sessionId));
  }

  return {
    user: { id: row.id, email: row.email, name: row.name },
    sessionId: row.sessionId,
    csrfToken: row.csrfToken,
  };
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function revokeSession(sessionId: string): Promise<void> {
  if (!UUID.test(sessionId)) return;
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

/** Kill every session for a user — for lockouts and password changes. */
export async function revokeAllSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Drop every expired row. Cheap enough to call on boot and once a day. */
export async function pruneSessions(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

/** Constant-time compare, so a wrong token cannot be found byte by byte. */
export function tokensMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function setSessionCookie(res: Response, sessionId: string): void {
  res.cookie(SESSION_COOKIE, sessionId, COOKIE_OPTIONS);
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, COOKIE_BASE);
}

export type { AdminUser };
