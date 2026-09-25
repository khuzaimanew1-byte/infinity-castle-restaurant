/**
 * GET  /api/admin/links  — list all promoter links with stats
 * POST /api/admin/links  — create a new promoter link with pre-assigned discount
 *
 * Fix: while(true) loop for slug uniqueness had no max attempts —
 * replaced with bounded retry (10 attempts max). nanoid(10) has
 * 70^10 combinations, collision is astronomically unlikely.
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";
import { nanoid } from "nanoid";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
function guard(req: NextRequest): boolean {
  return !ADMIN_KEY || req.headers.get("x-admin-key") !== ADMIN_KEY;
}

// ── GET ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const links = await cDb`
      SELECT lid, ref, nam, dsc, typ, cnt, clm, com, crt
      FROM lnk ORDER BY crt DESC
    `;
    return NextResponse.json(links);
  } catch (err) {
    console.error("[GET /api/admin/links]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { nam?: string; dsc?: number; typ?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { nam, dsc, typ } = body;

  if (!nam || typeof nam !== "string" || nam.trim().length === 0) {
    return NextResponse.json({ error: "nam is required" }, { status: 400 });
  }
  if (dsc == null || typeof dsc !== "number" || dsc <= 0) {
    return NextResponse.json({ error: "dsc must be a positive number" }, { status: 400 });
  }
  if (typ !== "F" && typ !== "P") {
    return NextResponse.json({ error: "typ must be 'F' or 'P'" }, { status: 400 });
  }

  try {
    // Generate unique slug — bounded to 10 attempts (collision probability negligible)
    let ref: string | null = null;
    for (let i = 0; i < 10; i++) {
      const candidate = nanoid(10);
      const [exists] = await cDb`SELECT lid FROM lnk WHERE ref = ${candidate} LIMIT 1`;
      if (!exists) { ref = candidate; break; }
    }
    if (!ref) {
      return NextResponse.json({ error: "Could not generate unique slug" }, { status: 500 });
    }

    const [link] = await cDb`
      INSERT INTO lnk (ref, nam, dsc, typ)
      VALUES (${ref}, ${nam.trim()}, ${dsc}, ${typ})
      RETURNING lid, ref, nam, dsc, typ
    `;
    return NextResponse.json(link, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/links]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
