/**
 * GET /api/verify/[sec]
 * Public endpoint — normal phone camera scan lands here.
 * Returns minimal JSON; UI renders the "staff will scan" notice.
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { sec: string } }
) {
  const { sec } = params;
  const [cpn] = await cDb`SELECT sts FROM cpn WHERE sec = ${sec} LIMIT 1`;
  if (!cpn) return NextResponse.json({ valid: false }, { status: 404 });
  return NextResponse.json({ valid: true, sts: cpn.sts });
}
