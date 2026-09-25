/**
 * GET /api/verify/[sec]
 * Public endpoint — opened when any phone camera scans the coupon QR.
 * Also used by admin ScanView to look up coupon details before settlement.
 *
 * Fix: Previously only returned { valid, sts } — admin lookupCode then
 * tried to read data.dsc and data.typ which were undefined, causing the
 * settlement form to display NaN and fmtDsc to fail.
 * Now returns full coupon details needed for admin settlement.
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { sec: string } }
) {
  const { sec } = params;
  if (!sec || sec.length !== 4) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  try {
    const [cpn] = await cDb`
      SELECT sts, dsc, typ FROM cpn WHERE sec = ${sec} LIMIT 1
    `;
    if (!cpn) return NextResponse.json({ valid: false }, { status: 404 });
    // Return dsc + typ so admin UI can display discount and calculate net payable
    return NextResponse.json({ valid: true, sts: cpn.sts, dsc: cpn.dsc, typ: cpn.typ });
  } catch (err) {
    console.error("[GET /api/verify]", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
