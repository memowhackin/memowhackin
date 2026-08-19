import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import { MulterError } from "multer";
import { loadSession, pruneSessionsSafely } from "./auth/index.js";
import { authRouter } from "./auth/routes.js";
import { adminRouter } from "./blog/routes.admin.js";
import { publicRouter } from "./blog/routes.public.js";
import { pool } from "./db/client.js";
import { env, isProduction } from "./env.js";
import { logger } from "./logger.js";
import { scannerRouter } from "./scanner/routes.public.js";
import { requireAllowedOrigin } from "./security/origin.js";

export const app = express();

// Behind nginx, so req.ip must come from X-Forwarded-For — otherwise every
// rate limit sees a single upstream address and throttles everyone at once.
// The value is the number of proxies to trust, never `true`: trusting the whole
// chain lets a client spoof its own IP with a forged header.
app.set("trust proxy", 1);

app.disable("x-powered-by");
app.set("etag", false);

app.use(
  helmet({
    // This service returns JSON and images, never HTML, so a restrictive policy
    // costs nothing and blocks anything that manages to get rendered.
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'"],
        sandbox: ["allow-downloads"],
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);

/*
 * Credentialed CORS, so the origin list is exact — no wildcard, no regex, no
 * reflecting whatever Origin arrives. `optionsSuccessStatus` keeps preflights
 * cheap, and the custom CSRF header is allowlisted so it can be sent at all.
 */
app.use(
  cors({
    origin: env.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
    maxAge: 600,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Origin allowlist on every state-changing request, ahead of any route. CORS
// stops an attacker reading a response; this stops the request being executed.
app.use(requireAllowedOrigin);

// Resolve the session once, for everything. Routes decide what to require.
app.use(loadSession);

/*
 * Liveness *and* readiness. The check touches the database on purpose: a
 * process that answers "ok" while its only datastore is unreachable is a
 * container orchestrator's worst input — it keeps routing traffic to something
 * that cannot serve a single request.
 */
app.get("/health", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "health check failed");
    res.status(503).json({ ok: false, error: "database_unreachable" });
  }
});

app.use("/api/auth", authRouter);
/*
 * Ahead of the blog's public router because both live under /api/public and
 * that one ends in a terminal 404 for anything it does not recognise.
 */
app.use("/api/public/scanner", scannerRouter);
app.use("/api/public", publicRouter);
app.use("/api", adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "not_found" });
});

app.use(
  (error: unknown, req: Request, res: Response, next: NextFunction): void => {
    void next;

    if (res.headersSent) return;

    // Malformed JSON and oversized bodies are client errors, not server faults,
    // and reporting them as 500s hides real failures in the noise.
    if (error instanceof SyntaxError && "body" in error) {
      res.status(400).json({ error: "malformed_json" });
      return;
    }
    if (error instanceof MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      res.status(status).json({ error: "upload_rejected" });
      return;
    }

    // Log the detail, return none of it. Exception messages leak paths, driver
    // internals and occasionally fragments of the query.
    logger.error(
      { err: error, path: req.path, method: req.method },
      "unhandled error",
    );
    res.status(500).json({ error: "internal_error" });
  },
);

if (process.env.VITEST === undefined) {
  void pruneSessionsSafely();

  /*
   * Expired sessions are deleted on a timer as well as at boot. A long-lived
   * container would otherwise accumulate dead rows indefinitely, and `unref`
   * keeps this timer from holding the process open during shutdown.
   */
  const PRUNE_INTERVAL_MS = 6 * 60 * 60 * 1000;
  const pruneTimer = setInterval(() => {
    void pruneSessionsSafely();
  }, PRUNE_INTERVAL_MS);
  pruneTimer.unref();

  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, production: isProduction },
      "landing CMS listening",
    );
  });

  /*
   * Graceful shutdown. `docker stop` and every orchestrator send SIGTERM and
   * then wait; without a handler the process is killed outright, dropping
   * in-flight requests — including a half-finished upload — and leaving
   * Postgres to time out the connections itself.
   *
   * Stop accepting new connections, let the current ones finish, close the
   * pool. The timeout is the backstop for a request that never ends.
   */
  const SHUTDOWN_GRACE_MS = 10_000;
  let shuttingDown = false;

  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "shutting down");

    const forceExit = setTimeout(() => {
      logger.warn("shutdown timed out, exiting anyway");
      process.exit(1);
    }, SHUTDOWN_GRACE_MS);
    forceExit.unref();

    server.close(() => {
      pool
        .end()
        .catch((error: unknown) => {
          logger.error({ err: error }, "closing the database pool failed");
        })
        .finally(() => {
          clearTimeout(forceExit);
          process.exit(0);
        });
    });
  };

  process.on("SIGTERM", () => {
    shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    shutdown("SIGINT");
  });
}
