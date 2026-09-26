/**
 * GET   /api/admin/menu        — list all menu items from static data
 * PATCH /api/admin/menu        — update a menu item's name/price/signature flag
 *
 * Design: Menu data lives in src/data/menu.ts (static, version-controlled).
 * Overrides (admin edits) are stored in a lightweight `mnu` table in Coupon DB.
 * The GET merges static defaults with DB overrides — no data duplication.
 * Frontend always reads from /api/admin/menu which returns the merged view.
 *
 * This means: deleting a row from mnu reverts to the static default automatically.
 */
import { NextRequest, NextResponse } from "next/server";
import { cDb } from "@/lib/db";
import { menuItems, categories } from "@/data/menu";

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY;
function guard(req: NextRequest): boolean {
  return !ADMIN_KEY || req.headers.get("x-admin-key") !== ADMIN_KEY;
}

// ── GET — static defaults merged with DB overrides ────────────────
export async function GET(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Fetch all overrides from DB
    const overrides = await cDb`SELECT mid, nam, prc, sig FROM mnu`;
    const overrideMap = new Map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      overrides.map((r: any) => [r.mid as string, r])
    );

    // Merge: static item + any DB override
    const merged = menuItems.map(item => {
      const ov = overrideMap.get(item.id);
      return {
        id:          item.id,
        name:        ov ? ov.nam : item.name,
        category:    item.category,
        price:       ov ? Number(ov.prc) : item.price,
        isSignature: ov ? ov.sig : item.isSignature,
        characterId: item.characterId,
      };
    });

    return NextResponse.json({ categories, items: merged });
  } catch (err) {
    console.error("[GET /api/admin/menu]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ── PATCH — upsert override for one menu item ─────────────────────
export async function PATCH(req: NextRequest) {
  if (guard(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: string; name?: string; price?: number; isSignature?: boolean };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { id, name, price, isSignature } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  // Verify item exists in static data
  const base = menuItems.find(m => m.id === id);
  if (!base) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });

  if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
  }
  if (price !== undefined && (typeof price !== "number" || price <= 0)) {
    return NextResponse.json({ error: "price must be a positive number" }, { status: 400 });
  }

  // Resolve final values — fall back to static if not provided
  const finalName = (name?.trim()) ?? base.name;
  const finalPrice = price ?? base.price;
  const finalSig = isSignature ?? base.isSignature;

  try {
    await cDb`
      INSERT INTO mnu (mid, nam, prc, sig)
      VALUES (${id}, ${finalName}, ${finalPrice}, ${finalSig})
      ON CONFLICT (mid) DO UPDATE
        SET nam = EXCLUDED.nam,
            prc = EXCLUDED.prc,
            sig = EXCLUDED.sig,
            upd = NOW()
    `;
    return NextResponse.json({ ok: true, id, name: finalName, price: finalPrice, isSignature: finalSig });
  } catch (err) {
    console.error("[PATCH /api/admin/menu]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
