import { z } from "zod";

/*
 * Configuration is validated once, at boot, and the process exits if anything
 * is missing or malformed. A CMS that starts with broken database settings and
 * only finds out on the first save is worse than one that never starts.
 *
 * The database is configured as discrete fields rather than a connection URL on
 * purpose: passwords routinely contain characters (`#`, `?`, `@`, `/`) that
 * silently truncate or re-target a URL unless every one is percent-encoded.
 * A DATABASE_URL is still honoured if set, for hosts that only provide that.
 */

const schema = z.object({
  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  /** Managed Postgres usually requires TLS; a LAN or compose host usually not. */
  DB_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  /** Optional escape hatch; when set it wins over the fields above. */
  DATABASE_URL: z.string().optional(),

  ALLOWED_ORIGINS: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(8001),
  UPLOAD_DIR: z.string().min(1).default("./uploads/blog"),
  DEPLOY_HOOK_URL: z.string().default(""),
  DEPLOY_HOOK_TOKEN: z.string().default(""),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /*
   * Whether session cookies are marked Secure and carry the `__Host-` prefix.
   *
   * Its own setting rather than a side effect of NODE_ENV, because a browser
   * silently refuses a Secure cookie over plain HTTP: a production build served
   * without TLS — a bare `docker compose up` on localhost, a staging box behind
   * someone else's terminating proxy — would accept a login and then never see
   * the session again. Defaults to on in production. Turn it off only for a
   * deployment you know is plain HTTP, never for a public one.
   */
  SECURE_COOKIES: z.enum(["true", "false"]).optional(),
});

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: { rejectUnauthorized: boolean };
  connectionString?: string;
}

function load(): z.infer<typeof schema> & {
  allowedOrigins: string[];
  db: DbConfig;
} {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment:\n${issues}\n\nCopy .env.example to .env and fill it in.`,
    );
  }

  const data = parsed.data;

  const db: DbConfig = {
    host: data.DB_HOST,
    port: data.DB_PORT,
    database: data.DB_NAME,
    user: data.DB_USER,
    password: data.DB_PASSWORD,
    ...(data.DB_SSL ? { ssl: { rejectUnauthorized: false } } : {}),
    ...(data.DATABASE_URL !== undefined && data.DATABASE_URL.length > 0
      ? { connectionString: data.DATABASE_URL }
      : {}),
  };

  return {
    ...data,
    db,
    allowedOrigins: data.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0),
  };
}

export const env = load();

export const isProduction = env.NODE_ENV === "production";

/** Secure cookies default to on in production, and can be turned off for HTTP. */
export const secureCookies =
  env.SECURE_COOKIES === undefined
    ? isProduction
    : env.SECURE_COOKIES === "true";
