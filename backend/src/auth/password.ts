import argon2 from "argon2";

/*
 * argon2id at the OWASP baseline. Chosen over bcrypt because it has no 72-byte
 * input cap to work around and is the current recommendation for new systems.
 *
 * These parameters are recorded inside every hash string, so raising them later
 * is safe: existing hashes keep verifying with their own settings, and a rehash
 * on next successful login upgrades them.
 */
const OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, OPTIONS);
}

export async function verifyPassword(
  hash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    // A malformed or truncated hash must read as "wrong password", never as an
    // exception that a caller might treat differently from a failed comparison.
    return false;
  }
}

/**
 * True when a stored hash was produced with weaker parameters than the current
 * ones, so it can be upgraded during a login that already has the plaintext.
 */
export function needsRehash(hash: string): boolean {
  return argon2.needsRehash(hash, OPTIONS);
}

/*
 * A login attempt for an unknown email must cost the same wall-clock time as
 * one for a real account, or response timing tells an attacker which addresses
 * exist. The decoy is hashed once, lazily, with the real parameters — a
 * hand-written constant would not survive a parameter change and a malformed
 * one would be rejected instantly, defeating the whole point.
 */
let decoyHash: Promise<string> | undefined;

export async function burnTime(plain: string): Promise<void> {
  decoyHash ??= hashPassword("decoy-for-constant-time-login-failures");
  await verifyPassword(await decoyHash, plain);
}
