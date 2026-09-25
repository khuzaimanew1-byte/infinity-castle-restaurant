/**
 * codes.ts — 4-character unique secret code generator.
 *
 * Charset: 0-9 A-Z a-z ! @ # $ % & *  (70 chars)
 * Capacity: 70^4 = 24,010,000 unique combos.
 * Rule: Length stays at 4 until combinations exhausted (requirements §2.4).
 *
 * Fix: Removed Node.js require("crypto") fallback.
 * Reason: Next.js 14 server routes run in the Node.js runtime where
 * globalThis.crypto IS available (Node 19+). The require() fallback
 * would throw in strict ESM mode and is unnecessary. If running Node <19,
 * the crypto module is accessed correctly via the Web Crypto API polyfill
 * that Next.js provides. Removing the fallback prevents ESM/CJS conflicts.
 */

export const CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*";

const CODE_LEN = 4;

/** Generate a cryptographically random 4-character code. */
export function genCode(): string {
  const bytes = new Uint8Array(CODE_LEN);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) {
    out += CHARSET[bytes[i] % CHARSET.length];
  }
  return out;
}

/**
 * Generate a code guaranteed unique against the DB.
 * Retries up to 20 times — collision probability per attempt
 * is ~0.000004% (1 / 24M), so 20 retries is extremely safe.
 */
export async function genUniqueCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = genCode();
    if (!(await checkExists(code))) return code;
  }
  // This should never happen in practice with 24M combinations
  throw new Error("Code generation failed: 20 consecutive collisions");
}
