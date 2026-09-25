/**
 * PATCH /api/admin/redeem
 * Admin-only: scan QR/dial code, settle bill, record commission.
 * Body: { sec, bil, com }
 * Business rules:
 *  - bil must be >= cpn.dsc (negative bill guard)
 *  - Coupon must be in status 'A' (Active)
 *  - Increments lnk.com with promoter commission
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";
import { calcNet } from "@/lib/constants";
import type { DscType } from "@/lib/constants";

// Simple admin key check — replace with proper JWT/session in production
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

export async function PATCH(req: NextRequest) {
  const key = req.headers.get("x-admin-key");
  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sec, bil, com }: { sec: string; bil: number; com: number } = await req.json();

  if (!sec || bil == null || com == null) {
    return NextResponse.json({ error: "Missing fields: sec, bil, com" }, { status: 400 });
  }

  // Fetch coupon
  const [cpn] = await cDb`
    SELECT cid, lid, dsc, typ, sts FROM cpn WHERE sec = ${sec} LIMIT 1
  `;
  if (!cpn)              return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  if (cpn.sts !== "A")  return NextResponse.json({ error: "Coupon not active", sts: cpn.sts }, { status: 409 });

  // Negative bill guard
  const net = calcNet(bil, Number(cpn.dsc), cpn.typ as DscType);
  if (bil < Number(cpn.dsc) && cpn.typ === "F") {
    return NextResponse.json({ error: "Bill less than discount" }, { status: 422 });
  }

  // Redeem coupon
  await cDb`
    UPDATE cpn SET sts = 'R', bil = ${bil}, com = ${com}, rdt = NOW()
    WHERE cid = ${cpn.cid}
  `;

  // Credit promoter commission
  await cDb`UPDATE lnk SET com = com + ${com} WHERE lid = ${cpn.lid}`;

  return NextResponse.json({ ok: true, net, dsc: cpn.dsc, typ: cpn.typ });
}
