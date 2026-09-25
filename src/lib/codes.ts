/**
 * codes.ts — 4-character unique secret code generator.
 *
 * Charset: 0-9 A-Z a-z ! @ # $ % & *   (~70 chars)
 * Capacity: 70^4 = ~24 Million unique combos.
 * Rule: Length stays at 4 until exhausted (requirements §2.4).
 *
 * Usage:
 *   const code = genCode();          // "7$Kp"
 *   const ok   = await isCodeFree(code, sql);
 */

export const CHARSET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*";

const CODE_LEN = 4;

/** Generate a random 4-character code */
export function genCode(): string {
  let out = "";
  const bytes = new Uint8Array(CODE_LEN);
  // Works in Node and browser (crypto.getRandomValues / global.crypto)
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { randomBytes } = require("crypto") as typeof import("crypto");
    const buf = randomBytes(CODE_LEN);
    buf.forEach((b, i) => { bytes[i] = b; });
  }
  for (let i = 0; i < CODE_LEN; i++) {
    out += CHARSET[bytes[i] % CHARSET.length];
  }
  return out;
}

/**
 * Generate a code guaranteed unique against the DB.
 * Retries up to 20 times (collision probability ~0.000004% per attempt).
 */
export async function genUniqueCode(
  checkExists: (code: string) => Promise<boolean>
): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = genCode();
    if (!(await checkExists(code))) return code;
  }
  throw new Error("Code generation failed: exhausted retries");
}
