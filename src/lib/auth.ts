/**
 * auth.ts — Google OAuth session management.
 *
 * Strategy: Server-side Google 1-tap redirect via next-auth v5 beta.
 * Sliding 180-day session stored in `usr` table on User Auth DB.
 * Session token is SHA-256 hashed before DB storage (aDb).
 */
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { SESSION_MS } from "@/lib/constants";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge:   SESSION_MS / 1000, // next-auth takes seconds
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, persist/update usr row
      if (user) {
        token.uid = await upsertUser({
          gid: user.id!,
          eml: user.email!,
          nam: user.name!,
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid as string;
      return session;
    },
  },
};

// ── DB upsert (sliding session refresh) ──────────────────────────
async function upsertUser(data: { gid: string; eml: string; nam: string }): Promise<string> {
  // Dynamic import keeps DB out of edge runtime if not needed
  const { aDb } = await import("@/lib/db");

  // SHA-256 token (no raw secrets in DB)
  const raw = `${data.gid}-${Date.now()}-${Math.random()}`;
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const tok  = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,"0")).join("");
  const exp  = new Date(Date.now() + SESSION_MS).toISOString();

  const rows = await aDb`
    INSERT INTO usr (gid, eml, nam, tok, lgn, exp)
    VALUES (${data.gid}, ${data.eml}, ${data.nam}, ${tok}, NOW(), ${exp})
    ON CONFLICT (gid) DO UPDATE
      SET nam = EXCLUDED.nam,
          tok = EXCLUDED.tok,
          lgn = NOW(),
          exp = ${exp}
    RETURNING uid
  `;
  return rows[0].uid as string;
}
