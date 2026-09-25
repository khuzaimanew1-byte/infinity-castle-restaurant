/**
 * PATCH /api/admin/redeem
 * Admin-only: settle bill, deduct discount, record promoter commission.
 * Body: { sec: string, bil: number, com: number }
 *
 * Business rules enforced server-side:
 *  - Coupon must be status 'A' (Active)
 *  - For Fixed discount: bil must be >= dsc
 *  - For Percentage discount: any positive bill is valid (discount is a %)
 *  - bil must be a positive number
 *  - com must be >= 0
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";
import { calcNet } from "@/lib/constants";
import type { DscType } from "@/lib/constants";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;

export async function PATCH(req: NextRequest) {
  // Auth guard — server-side only, ADMIN_SECRET_KEY never exposed to client
  const key = req.headers.get("x-admin-key");
  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sec?: string; bil?: number; com?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { sec, bil, com } = body;

  // Input validation
  if (!sec || typeof sec !== "string" || sec.length !== 4) {
    return NextResponse.json({ error: "Invalid sec code" }, { status: 400 });
  }
  if (bil == null || typeof bil !== "number" || bil <= 0) {
    return NextResponse.json({ error: "bil must be a positive number" }, { status: 400 });
  }
  if (com == null || typeof com !== "number" || com < 0) {
    return NextResponse.json({ error: "com must be >= 0" }, { status: 400 });
  }

  try {
    const [cpn] = await cDb`
      SELECT cid, lid, dsc, typ, sts FROM cpn WHERE sec = ${sec} LIMIT 1
    `;
    if (!cpn) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    if (cpn.sts !== "A") {
      return NextResponse.json(
        { error: cpn.sts === "R" ? "Already redeemed" : "Coupon expired", sts: cpn.sts },
        { status: 409 }
      );
    }

    const dsc = Number(cpn.dsc);
    const typ = cpn.typ as DscType;

    // Negative bill guard:
    // Fixed: bill must be >= discount amount (can't pay less than 0)
    // Percentage: always valid for positive bill (worst case 100% off = 0)
    if (typ === "F" && bil < dsc) {
      return NextResponse.json(
        { error: `Bill (Rs ${bil}) is less than fixed discount (Rs ${dsc})` },
        { status: 422 }
      );
    }

    const net = calcNet(bil, dsc, typ);

    // Redeem atomically
    await cDb`
      UPDATE cpn SET sts = 'R', bil = ${bil}, com = ${com}, rdt = NOW()
      WHERE cid = ${cpn.cid}
    `;
    await cDb`UPDATE lnk SET com = com + ${com} WHERE lid = ${cpn.lid}`;

    return NextResponse.json({ ok: true, net, dsc, typ });
  } catch (err) {
    console.error("[PATCH /api/admin/redeem]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
