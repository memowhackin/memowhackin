import type { Request } from "express";
import { db } from "./db/client.js";
import { auditLog } from "./db/schema.js";
import { logger } from "./logger.js";

export type AuditAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.logout"
  | "post.created"
  | "post.updated"
  | "post.published"
  | "post.unpublished"
  | "post.deleted"
  | "media.uploaded"
  | "deploy.triggered";

/**
 * Append-only record of who changed what. Never throws into the request path —
 * a failed audit write must not fail an author's save, but it must be loud in
 * the logs, because a silently empty audit trail is worse than none.
 */
export async function audit(
  req: Request,
  action: AuditAction,
  resourceId: string | undefined,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorId: req.admin?.id ?? null,
      action,
      resourceId: resourceId ?? null,
      metadata,
      ip: req.ip?.slice(0, 64) ?? null,
    });
  } catch (error) {
    logger.error({ err: error, action }, "audit write failed");
  }
}
