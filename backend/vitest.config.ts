import "dotenv/config";
import { defineConfig } from "vitest/config";

/*
 * Without a config of its own, vitest walks up and finds the frontend's, which
 * points at a jsdom setup file that does not exist down here.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    root: import.meta.dirname,
    /*
     * Stand-in config so importing a module that reads `env` does not require a
     * real .env. These tests are pure units — nothing here opens a connection,
     * and nothing should need a database to run.
     */
    env: {
      // Real database settings come from .env, loaded above, so the integration
      // tests hit a live Postgres. These only fill gaps so that the pure unit
      // tests still run on a machine with no .env at all.
      DB_HOST: process.env.DB_HOST ?? "localhost",
      DB_NAME: process.env.DB_NAME ?? "test",
      DB_USER: process.env.DB_USER ?? "test",
      DB_PASSWORD: process.env.DB_PASSWORD ?? "test",
      ALLOWED_ORIGINS: "http://localhost:3000",
      NODE_ENV: "test",
    },
    // The integration tests share one database; running files in parallel would
    // have them deleting each other's fixtures.
    fileParallelism: false,
  },
});
