import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";
import { logger } from "../logger.js";

/**
 * Apply pending migrations. Run as a one-off (`npm run db:migrate`) rather than
 * on boot, so that starting a second container never races a schema change.
 */
async function main(): Promise<void> {
  await migrate(db, { migrationsFolder: "./drizzle" });
  logger.info("migrations applied");
  await pool.end();
}

main().catch((error: unknown) => {
  logger.error({ err: error }, "migration failed");
  process.exitCode = 1;
});
