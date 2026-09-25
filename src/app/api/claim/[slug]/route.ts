/**
 * POST /api/claim/[slug]
 * Issues a new coupon to the authenticated user.
 * Business rules:
 *  - User must be authenticated (Google session)
 *  - User must NOT already have any coupon (single-claim per account)
 *  - Increments lnk.clm (claim count)
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";
import { auth } from "@/auth";
import { genUniqueCode } from "@/lib/codes";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const uid = session.user.id;
  const { slug } = params;

  // Resolve link
  const [link] = await cDb`SELECT lid, dsc, typ FROM lnk WHERE ref = ${slug}`;
  if (!link) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

  // Single-claim guard
  const [already] = await cDb`SELECT cid FROM cpn WHERE uid = ${uid} LIMIT 1`;
  if (already) {
    return NextResponse.json(
      { error: "already_claimed", cpnId: already.cid },
      { status: 409 }
    );
  }

  // Generate unique 4-char secret code
  const sec = await genUniqueCode(async (code: string) => {
    const [row] = await cDb`SELECT cid FROM cpn WHERE sec = ${code} LIMIT 1`;
    return !!row;
  });

  // Insert coupon
  const [cpn] = await cDb`
    INSERT INTO cpn (uid, lid, sec, dsc, typ, sts)
    VALUES (${uid}, ${link.lid}, ${sec}, ${link.dsc}, ${link.typ}, 'A')
    RETURNING cid, sec, dsc, typ, sts
  `;

  // Increment claim counter
  await cDb`UPDATE lnk SET clm = clm + 1 WHERE lid = ${link.lid}`;

  return NextResponse.json({ cpnId: cpn.cid, sec: cpn.sec, dsc: cpn.dsc, typ: cpn.typ });
}
