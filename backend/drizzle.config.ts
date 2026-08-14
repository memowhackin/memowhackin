import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./src/env.js";

/*
 * drizzle-kit reads the same validated config the server does, so `db:generate`
 * and `db:push` can never point at a different database than the running app.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: env.db.host,
    port: env.db.port,
    database: env.db.database,
    user: env.db.user,
    password: env.db.password,
    ssl: env.DB_SSL,
  },
  strict: true,
  verbose: true,
});
