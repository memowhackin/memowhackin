import { eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { audit } from "../audit.js";
import { db } from "../db/client.js";
import { adminUsers } from "../db/schema.js";
import {
  burnTime,
  needsRehash,
  hashPassword,
  verifyPassword,
} from "./password.js";
import { currentAdmin, requireAdmin, sessionCookie } from "./middleware.js";
import { loginLimiter } from "./rateLimit.js";
import {
  clearSessionCookie,
  createSession,
  revokeSession,
  setSessionCookie,
} from "./session.js";

export const authRouter: Router = Router();

const credentials = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(400),
});

/*
 * There is no registration endpoint, by design. Accounts exist only because
 * someone ran scripts/create-admin.ts on the server.
 *
 * Login is exempt from the CSRF token check for the obvious reason that the
 * caller has no session yet; the origin allowlist still applies to it.
 */
authRouter.post("/login", loginLimiter, async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) {
    // Deliberately the same response as a wrong password: a distinct
    // "malformed" error tells an attacker their probe reached the comparison.
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const rows = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  const user = rows[0];

  // Unknown email still pays for a hash verification, so response timing does
  // not reveal which addresses exist. Both branches return the same error.
  if (!user?.isActive) {
    await burnTime(parsed.data.password);
    await audit(req, "auth.login_failed", undefined, { email });
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }

  if (!(await verifyPassword(user.passwordHash, parsed.data.password))) {
    await audit(req, "auth.login_failed", user.id, { email });
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }

  // Upgrade hashes in place when the cost parameters have been raised, while
  // the plaintext is in hand and already verified.
  if (needsRehash(user.passwordHash)) {
    await db
      .update(adminUsers)
      .set({ passwordHash: await hashPassword(parsed.data.password) })
      .where(eq(adminUsers.id, user.id));
  }

  const session = await createSession(
    user.id,
    req.headers["user-agent"],
    req.ip,
  );
  setSessionCookie(res, session.sessionId);

  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, user.id));

  req.admin = { id: user.id, email: user.email, name: user.name };
  await audit(req, "auth.login", user.id, {});

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    // Replayed as the X-CSRF-Token header on every state-changing request. It
    // is deliberately not a cookie: the admin UI is on another origin and could
    // not read one, and a token an attacker's page cannot read is the point.
    csrfToken: session.csrfToken,
  });
});

/*
 * Logout takes no CSRF token. Forcing a logout is not a meaningful attack, and
 * requiring the token would leave a client that lost it unable to clear a
 * session it holds.
 */
authRouter.post("/logout", async (req, res) => {
  const raw = sessionCookie(req);
  if (raw !== undefined) {
    await revokeSession(raw);
    await audit(req, "auth.logout", req.admin?.id, {});
  }

  clearSessionCookie(res);
  res.status(204).end();
});

/** Session probe on page load; also how the UI recovers its CSRF token. */
authRouter.get("/me", requireAdmin, (req, res) => {
  const user = currentAdmin(req);
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    csrfToken: req.session?.csrfToken ?? "",
  });
});
