/**
 * GET  /api/admin/links        — list all promoter links with stats
 * POST /api/admin/links        — create a new promoter link
 * DELETE /api/admin/links/[lid] — remove a link (no coupons allowed)
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";
import { nanoid } from "nanoid"; // 21-char unreadable slug

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
function guard(req: NextRequest) {
  return req.headers.get("x-admin-key") !== ADMIN_KEY;
}

// ── GET — list all links ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const links = await cDb`
    SELECT lid, ref, nam, cnt, clm, com, crt
    FROM lnk ORDER BY crt DESC
  `;
  return NextResponse.json(links);
}

// ── POST — create link ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { nam, dsc, typ }: { nam: string; dsc: number; typ: "F" | "P" } = await req.json();
  if (!nam || dsc == null || !typ) {
    return NextResponse.json({ error: "Missing: nam, dsc, typ" }, { status: 400 });
  }

  // Generate short unreadable slug (10 chars)
  let ref: string;
  while (true) {
    ref = nanoid(10);
    const [exists] = await cDb`SELECT lid FROM lnk WHERE ref = ${ref} LIMIT 1`;
    if (!exists) break;
  }

  const [link] = await cDb`
    INSERT INTO lnk (ref, nam, dsc, typ) VALUES (${ref}, ${nam}, ${dsc}, ${typ})
    RETURNING lid, ref, nam
  `;
  return NextResponse.json(link, { status: 201 });
}
