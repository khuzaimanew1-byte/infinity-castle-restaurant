/**
 * db.ts — Dual Neon connection clients.
 * COUPON_DB : referral links + coupons + redemptions
 * AUTH_DB   : user profiles + sessions
 * Both use edge-compatible @neondatabase/serverless with pooled endpoints.
 */
import { neon } from "@neondatabase/serverless";

const cUrl = process.env.COUPON_DATABASE_URL!;
const aUrl = process.env.USER_AUTH_DATABASE_URL!;

if (!cUrl) throw new Error("COUPON_DATABASE_URL missing");
if (!aUrl) throw new Error("USER_AUTH_DATABASE_URL missing");

/** Coupon & Affiliate database */
export const cDb = neon(cUrl);
/** User Accounts & Auth database */
export const aDb = neon(aUrl);
