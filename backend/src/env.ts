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

  /*
   * The digital exposure scanner. Off unless switched on, because every part of
   * it — outbound requests to submitted hosts, stored personal exposure data,
   * transactional mail — is a liability on a deployment that does not use it.
   */
  SCANNER_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  /*
   * Which scan backend answers. `fixture` returns canned findings for local
   * development and is refused in production below: a marketing site that
   * invents security findings for a real visitor's domain is worse than one
   * with no scanner at all. `none` leaves the feature switched off.
   */
  SCANNER_PROVIDER: z.enum(["none", "fixture", "live"]).default("none"),

  /** `log` writes the mail to the process log; nothing leaves the machine. */
  SCANNER_MAIL_TRANSPORT: z.enum(["none", "log"]).default("none"),

  /*
   * SMTP, for contact and demo requests. Plain SMTP rather than a provider
   * SDK, so switching provider is configuration rather than a code change.
   *
   * An empty host switches delivery off without switching the feature off:
   * inquiries are still stored, and the undelivered rows are the queue to
   * send once credentials exist. See `inquiries/mail.ts`.
   */
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  /** Envelope sender. Must be a domain we are allowed to send as. */
  SMTP_FROM: z.string().default("AssistSec <noreply@assistsec.nl>"),
  /** Where contact and demo requests land. */
  INQUIRY_RECIPIENT: z.string().default("contact@assistsec.nl"),

  /** 32 bytes, base64. Encrypts the subject address and the stored findings. */
  SCANNER_ENCRYPTION_KEY: z.string().default(""),

  /** Absolute origin the single-use report links are built against. */
  SCANNER_PUBLIC_BASE_URL: z.string().default(""),

  /** How long a finished report stays readable before it is purged. */
  SCANNER_REPORT_TTL_HOURS: z.coerce
    .number()
    .int()
    .positive()
    .max(24 * 30)
    .default(72),

  /** How long a magic link stays usable. Short on purpose. */
  SCANNER_TOKEN_TTL_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .max(24 * 60)
    .default(30),
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

/*
 * Rules that span more than one variable, checked at boot alongside the rest.
 *
 * These are the settings where a wrong combination is not a crash but a quiet
 * wrong answer months later — invented findings served to a real visitor, or
 * personal exposure data written to disk under a key that is not a key. Both
 * are cheap to assert here and expensive to notice in production.
 */
function crossFieldIssues(data: z.infer<typeof schema>): string[] {
  const issues: string[] = [];
  if (!data.SCANNER_ENABLED) return issues;

  if (data.NODE_ENV === "production" && data.SCANNER_PROVIDER === "fixture") {
    issues.push(
      "  SCANNER_PROVIDER: fixture data must never be served in production. " +
        "Set a real provider or SCANNER_ENABLED=false.",
    );
  }

  if (data.SCANNER_PROVIDER === "none") {
    issues.push(
      "  SCANNER_PROVIDER: required when SCANNER_ENABLED=true (none disables it).",
    );
  }

  if (keyBytes(data.SCANNER_ENCRYPTION_KEY) !== 32) {
    issues.push(
      "  SCANNER_ENCRYPTION_KEY: required when SCANNER_ENABLED=true, " +
        "as 32 bytes of base64 (openssl rand -base64 32).",
    );
  }

  if (!/^https?:\/\/[^\s/]+$/.test(data.SCANNER_PUBLIC_BASE_URL)) {
    issues.push(
      "  SCANNER_PUBLIC_BASE_URL: required when SCANNER_ENABLED=true, " +
        "as an absolute origin such as https://assistsec.nl (no trailing path).",
    );
  }

  return issues;
}

/** Byte length of a base64 value, or -1 when it is not valid base64. */
function keyBytes(value: string): number {
  if (value.length === 0) return -1;
  try {
    return Buffer.from(value, "base64").length;
  } catch {
    return -1;
  }
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

  const conflicts = crossFieldIssues(data);
  if (conflicts.length > 0) {
    throw new Error(`Invalid environment:\n${conflicts.join("\n")}`);
  }

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
