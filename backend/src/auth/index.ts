import { logger } from "../logger.js";
import { pruneSessions } from "./session.js";

export { loadSession, requireAdmin, currentAdmin } from "./middleware.js";

/** Boot-time housekeeping must never take the process down with it. */
export async function pruneSessionsSafely(): Promise<void> {
  try {
    await pruneSessions();
  } catch (error) {
    logger.error({ err: error }, "session prune failed");
  }
}
