/**
 * POST /api/reservations
 * Public — saves a reservation submitted from the home page form.
 * No auth required. Stores in Coupon DB (rsv table).
 * WhatsApp is still the primary notification; this is a server-side backup.
 *
 * Body: { nam, pax, dat, tim, evt, msg? }
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: {
    nam?: string;
    pax?: number;
    dat?: string;
    tim?: string;
    evt?: string;
    msg?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nam, pax, dat, tim, evt, msg } = body;

  // Validate required fields
  if (!nam || typeof nam !== "string" || nam.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!pax || typeof pax !== "number" || pax < 1 || pax > 50) {
    return NextResponse.json({ error: "Guests must be 1–50" }, { status: 400 });
  }
  if (!dat || !/^\d{4}-\d{2}-\d{2}$/.test(dat)) {
    return NextResponse.json({ error: "Invalid date (YYYY-MM-DD)" }, { status: 400 });
  }
  if (!tim || !/^\d{2}:\d{2}(:\d{2})?$/.test(tim)) {
    return NextResponse.json({ error: "Invalid time (HH:MM)" }, { status: 400 });
  }
  // Past date guard
  if (dat < new Date().toISOString().split("T")[0]) {
    return NextResponse.json({ error: "Date cannot be in the past" }, { status: 422 });
  }

  const evtVal = (evt && typeof evt === "string") ? evt.trim().slice(0, 50) : "casual";
  const msgVal = (msg && typeof msg === "string") ? msg.trim().slice(0, 500) : null;

  try {
    const [rsv] = await cDb`
      INSERT INTO rsv (nam, pax, dat, tim, evt, msg)
      VALUES (${nam.trim()}, ${pax}, ${dat}, ${tim.slice(0, 5)}, ${evtVal}, ${msgVal})
      RETURNING rid, sts, crt
    `;
    return NextResponse.json({ ok: true, rid: rsv.rid }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/reservations]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
