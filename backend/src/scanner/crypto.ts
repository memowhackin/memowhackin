import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";
import { env } from "../env.js";

/*
 * Encryption for the two things this feature stores that would matter if the
 * database leaked: the address a report belongs to, and the findings attached
 * to it.
 *
 * AES-256-GCM rather than CBC or a raw stream, because it authenticates as
 * well as encrypts. Without that, ciphertext is malleable and a stored
 * "findings" blob becomes something an attacker with write access can flip
 * bits in. The tag makes tampering a decryption failure instead.
 *
 * The IV is random per record and stored beside the ciphertext, which is what
 * GCM requires: reusing a nonce under one key is the single mistake that
 * breaks it completely, so no counter or derived value is used here.
 *
 * The key never has a default. `env.ts` refuses to boot with the scanner on
 * and no valid key, so the alternative to a real key is a stopped process
 * rather than data encrypted under zeroes.
 */

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // 96 bits, the size GCM is specified for.
const TAG_BYTES = 16;

let cachedKey: Buffer | undefined;

function key(): Buffer {
  if (cachedKey !== undefined) return cachedKey;

  const decoded = Buffer.from(env.SCANNER_ENCRYPTION_KEY, "base64");
  if (decoded.length !== 32) {
    // Unreachable when the scanner is enabled, since env validation checks the
    // same thing at boot. Kept because the alternative to throwing here is
    // encrypting under a short key.
    throw new Error("SCANNER_ENCRYPTION_KEY must be 32 bytes of base64");
  }

  cachedKey = decoded;
  return decoded;
}

/**
 * Encrypt a UTF-8 string. The result is `iv.tag.ciphertext`, base64url, which
 * keeps the whole record in one text column with no second field to keep in
 * step.
 */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const body = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    body.toString("base64url"),
  ].join(".");
}

/**
 * Decrypt a value produced by `encrypt`.
 *
 * Returns undefined rather than throwing on anything malformed or tampered
 * with. Callers are read paths serving a visitor, and the honest answer to
 * "this record will not decrypt" is the same 404 as "no such record" — not a
 * 500 that confirms the row exists.
 */
export function decrypt(payload: string): string | undefined {
  const parts = payload.split(".");
  if (parts.length !== 3) return undefined;

  const [ivPart, tagPart, bodyPart] = parts;
  if (ivPart === undefined || tagPart === undefined || bodyPart === undefined) {
    return undefined;
  }

  try {
    const iv = Buffer.from(ivPart, "base64url");
    const tag = Buffer.from(tagPart, "base64url");
    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) return undefined;

    const decipher = createDecipheriv(ALGORITHM, key(), iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(Buffer.from(bodyPart, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // Wrong key, wrong tag, or truncated input. All of them mean "no".
    return undefined;
  }
}

/**
 * A keyed, deterministic digest of a subject.
 *
 * This is what lets the server ask "is this the same domain someone submitted
 * ten seconds ago" without storing the domain in a comparable form. It is
 * keyed (HMAC, not a bare hash) because the input space is small enough to
 * enumerate: an unkeyed SHA-256 of an email address is reversible by anyone
 * with a word list, which would make the digest column a plaintext column with
 * extra steps.
 */
export function subjectDigest(kind: string, value: string): string {
  return createHmac("sha256", key()).update(`${kind}:${value}`).digest("hex");
}
