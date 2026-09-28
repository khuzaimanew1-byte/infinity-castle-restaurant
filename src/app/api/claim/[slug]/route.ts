/**
 * GET  /api/claim/[slug]
 * Resolves promoter slug → returns link info + user's coupon state.
 * Increments visit counter (cnt) on lnk.
 *
 * GET  /api/claim/[slug]
 * POST /api/claim/[slug]  — both handlers in this single file.
 *
 * Why in one file: Next.js App Router requires all HTTP methods for
 * a single route to be exported from the same route.ts file.
 * (Previously they were split into two files — the GET was overwritten.)
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";
import { auth } from "@/auth";
import { genUniqueCode } from "@/lib/codes";

// ── GET — resolve link + check session coupon state ───────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  try {
    // Increment visit counter atomically, return link meta
    const [link] = await cDb`
      UPDATE lnk SET cnt = cnt + 1
      WHERE ref = ${slug}
      RETURNING lid, nam
    `;
    if (!link) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

    const session = await auth();
    if (!session?.user?.id) {
      // Unauthenticated — return link info only
      return NextResponse.json({ lid: link.lid, nam: link.nam });
    }

    const uid = session.user.id;

    // Check if user already has any coupon (single-claim across platform)
    const [existing] = await cDb`
      SELECT cid, lid, dsc, typ, sts, sec
      FROM cpn WHERE uid = ${uid}
      LIMIT 1
    `;

    if (existing) {
      return NextResponse.json({
        lid:     link.lid,
        nam:     link.nam,
        claimed: true,
        sameLid: existing.lid === link.lid,
        cpnId:   existing.cid,
        dsc:     existing.dsc,
        typ:     existing.typ,
        sts:     existing.sts,
        sec:     existing.sec,
      });
    }

    return NextResponse.json({ lid: link.lid, nam: link.nam, claimed: false });
  } catch (err) {
    console.error("[GET /api/claim]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── POST — issue coupon to authenticated user ─────────────────────
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const uid = session.user.id;
  const { slug } = await params;

  try {
    // Resolve link — fetch dsc + typ so coupon inherits them
    const [link] = await cDb`SELECT lid, dsc, typ FROM lnk WHERE ref = ${slug}`;
    if (!link) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

    // Single-claim guard: one coupon per Google account ever
    const [already] = await cDb`SELECT cid FROM cpn WHERE uid = ${uid} LIMIT 1`;
    if (already) {
      return NextResponse.json(
        { error: "already_claimed", cpnId: already.cid },
        { status: 409 }
      );
    }

    // Generate unique 4-char secret code (max 20 retry attempts)
    const sec = await genUniqueCode(async (code: string) => {
      const [row] = await cDb`SELECT cid FROM cpn WHERE sec = ${code} LIMIT 1`;
      return !!row;
    });

    // Insert coupon — discount inherited from the promoter link
    const [cpn] = await cDb`
      INSERT INTO cpn (uid, lid, sec, dsc, typ, sts)
      VALUES (${uid}, ${link.lid}, ${sec}, ${link.dsc}, ${link.typ}, 'A')
      RETURNING cid, sec, dsc, typ, sts
    `;

    // Increment promoter claim counter
    await cDb`UPDATE lnk SET clm = clm + 1 WHERE lid = ${link.lid}`;

    return NextResponse.json({
      cpnId: cpn.cid,
      sec:   cpn.sec,
      dsc:   cpn.dsc,
      typ:   cpn.typ,
      sts:   cpn.sts,
    });
  } catch (err) {
    console.error("[POST /api/claim]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
