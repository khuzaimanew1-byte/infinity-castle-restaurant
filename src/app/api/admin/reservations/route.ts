/**
 * GET    /api/admin/reservations  — list reservations with optional filters
 * PATCH  /api/admin/reservations  — update a reservation's status
 *
 * Filter params (GET): ?sts=P|C|X, ?from=YYYY-MM-DD, ?to=YYYY-MM-DD
 *
 * Neon tagged template approach: build four specific query variants
 * rather than dynamic string construction. This keeps full TypeScript
 * safety and avoids the neon(url).query() raw-string API which
 * requires a different import pattern.
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
function guard(req: NextRequest): boolean {
  return !ADMIN_KEY || req.headers.get("x-admin-key") !== ADMIN_KEY;
}

// Validate date string format YYYY-MM-DD
function isValidDate(d: string | null): d is string {
  return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

// ── GET — list with optional filters ─────────────────────────────
export async function GET(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sts  = searchParams.get("sts");
  const from = searchParams.get("from");
  const to   = searchParams.get("to");

  // Sanitise filter values
  const validSts  = ["P", "C", "X"].includes(sts ?? "") ? sts! : null;
  const validFrom = isValidDate(from) ? from : null;
  const validTo   = isValidDate(to)   ? to   : null;

  try {
    // Use tagged template with runtime branching on filter combos.
    // All 8 combinations covered; most common (no filter, sts-only) are fast paths.
    let rows;
    if (!validSts && !validFrom && !validTo) {
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv ORDER BY dat ASC, tim ASC
      `;
    } else if (validSts && !validFrom && !validTo) {
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv WHERE sts = ${validSts} ORDER BY dat ASC, tim ASC
      `;
    } else if (!validSts && validFrom && !validTo) {
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv WHERE dat >= ${validFrom}::DATE ORDER BY dat ASC, tim ASC
      `;
    } else if (!validSts && !validFrom && validTo) {
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv WHERE dat <= ${validTo}::DATE ORDER BY dat ASC, tim ASC
      `;
    } else if (validSts && validFrom && !validTo) {
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv WHERE sts = ${validSts} AND dat >= ${validFrom}::DATE ORDER BY dat ASC, tim ASC
      `;
    } else if (validSts && !validFrom && validTo) {
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv WHERE sts = ${validSts} AND dat <= ${validTo}::DATE ORDER BY dat ASC, tim ASC
      `;
    } else if (!validSts && validFrom && validTo) {
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv WHERE dat >= ${validFrom}::DATE AND dat <= ${validTo}::DATE ORDER BY dat ASC, tim ASC
      `;
    } else {
      // All three filters
      rows = await cDb`
        SELECT rid, nam, pax,
               to_char(dat,'YYYY-MM-DD') AS dat,
               to_char(tim,'HH24:MI')    AS tim,
               evt, msg, sts, crt
        FROM rsv
        WHERE sts = ${validSts!}
          AND dat >= ${validFrom!}::DATE
          AND dat <= ${validTo!}::DATE
        ORDER BY dat ASC, tim ASC
      `;
    }

    return NextResponse.json(rows);
  } catch (err) {
    console.error("[GET /api/admin/reservations]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── PATCH — update status ─────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { rid?: string; sts?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { rid, sts } = body;
  if (!rid || typeof rid !== "string" || rid.trim().length === 0) {
    return NextResponse.json({ error: "rid required" }, { status: 400 });
  }
  if (sts !== "C" && sts !== "X" && sts !== "P") {
    return NextResponse.json({ error: "sts must be P, C, or X" }, { status: 400 });
  }

  try {
    const [updated] = await cDb`
      UPDATE rsv SET sts = ${sts} WHERE rid = ${rid.trim()} RETURNING rid, sts
    `;
    if (!updated) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    return NextResponse.json({ ok: true, rid: updated.rid, sts: updated.sts });
  } catch (err) {
    console.error("[PATCH /api/admin/reservations]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
