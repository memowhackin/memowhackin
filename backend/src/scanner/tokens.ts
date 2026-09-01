import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../db/client.js";
import { scanAccessTokens } from "../db/schema.js";
import { env } from "../env.js";

/*
 * Single-use links to a private report.
 *
 * The rules that make this worth anything, in the order they matter:
 *
 *   1. Only the hash is stored. The database never holds a usable link, so
 *      reading the table gives an attacker nothing they can open.
 *   2. Redemption is a conditional UPDATE, not a SELECT then an UPDATE. Two
 *      requests arriving together with the same token would both pass a read
 *      check and both be served; letting Postgres decide which one flips the
 *      row means exactly one wins.
 *   3. Expiry is enforced in that same statement, so a clock check cannot be
 *      raced either.
 *
 * The token is 32 bytes from the CSPRNG. That is the whole secret protecting
 * the report, so it is sized like a session id rather than like a code someone
 * types.
 */

const TOKEN_BYTES = 32;

export interface IssuedToken {
  /** Goes in the mail, and nowhere else. Never logged, never stored. */
  token: string;
  expiresAt: Date;
}

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Mint a token for a scan and store only its hash. */
export async function issueAccessToken(scanId: string): Promise<IssuedToken> {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(
    Date.now() + env.SCANNER_TOKEN_TTL_MINUTES * 60 * 1000,
  );

  await db.insert(scanAccessTokens).values({
    scanId,
    tokenHash: hash(token),
    expiresAt,
  });

  return { token, expiresAt };
}

export type RedeemResult =
  | { ok: true; scanId: string }
  | { ok: false; reason: "invalid" | "expired_or_used" };

/**
 * Spend a token, returning the scan it unlocks.
 *
 * The `usedAt is null and expiresAt > now` predicate lives in the WHERE clause
 * so that redemption is atomic: whichever concurrent request updates the row
 * first gets a returned row, and the loser gets none. A read-then-write here
 * would be a replay window measured in milliseconds, which is plenty.
 *
 * A malformed token is refused before touching the database, and the two
 * failure modes are reported separately only because the UI needs to say
 * "expired, ask for a new link" rather than "wrong link". Neither reveals
 * whether a scan exists.
 */
export async function redeemAccessToken(token: string): Promise<RedeemResult> {
  // Bound the input before hashing so an oversized string is not work we do.
  if (token.length === 0 || token.length > 128) {
    return { ok: false, reason: "invalid" };
  }

  const [row] = await db
    .update(scanAccessTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(scanAccessTokens.tokenHash, hash(token)),
        isNull(scanAccessTokens.usedAt),
        gt(scanAccessTokens.expiresAt, new Date()),
      ),
    )
    .returning({ scanId: scanAccessTokens.scanId });

  if (row === undefined) return { ok: false, reason: "expired_or_used" };
  return { ok: true, scanId: row.scanId };
}
