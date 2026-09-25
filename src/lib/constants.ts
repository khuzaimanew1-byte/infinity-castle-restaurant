/**
 * constants.ts — Single source of truth for short-code ↔ label mappings.
 * DB stores 1-char flags; UI reads from here — never raw flags in JSX.
 */

// ── Status ───────────────────────────────────────────────────────
export type CpnStatus = "A" | "R" | "E";

export const STS_LABEL: Record<CpnStatus, string> = {
  A: "Active",
  R: "Redeemed",
  E: "Expired",
};

export const STS_COLOR: Record<CpnStatus, string> = {
  A: "#8961D9", // wisteria — live coupon
  R: "#D4935A", // lantern  — used
  E: "#5C5A55", // muted    — expired
};

// ── Discount Type ────────────────────────────────────────────────
export type DscType = "F" | "P";

export const TYP_LABEL: Record<DscType, string> = {
  F: "Fixed",      // Rs off
  P: "Percentage", // % off
};

/** Format discount for display: "Rs 300 OFF" or "15% OFF" */
export function fmtDsc(dsc: number, typ: DscType): string {
  return typ === "F" ? `Rs ${dsc.toLocaleString()} OFF` : `${dsc}% OFF`;
}

/**
 * Calculate final bill after discount.
 * Negative bill guard: never returns < 0.
 */
export function calcNet(bill: number, dsc: number, typ: DscType): number {
  const disc = typ === "F" ? dsc : (bill * dsc) / 100;
  return Math.max(0, bill - disc);
}

// ── Routes (never stored in DB) ───────────────────────────────────
export const ROUTES = {
  claim:   "/c",   // /c/[slug]  — promoter referral entry
  verify:  "/v",   // /v/[sec]   — public QR scan landing
  account: "/account",
  admin:   "/admin",
} as const;

// ── Session ───────────────────────────────────────────────────────
export const SESSION_DAYS = 180;
export const SESSION_MS   = SESSION_DAYS * 24 * 60 * 60 * 1000;
