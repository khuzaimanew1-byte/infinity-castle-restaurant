/**
 * Dynamic OpenGraph image for /c/[slug] coupon pages.
 * Generated at request time via Next.js ImageResponse (Edge runtime).
 * Output: 1200×630 PNG served at /c/[slug]/opengraph-image
 *
 * When a user shares their coupon link on WhatsApp, Twitter, etc.,
 * this image is fetched and shown as the link preview card.
 *
 * No external image service — runs on Cloudflare edge via @cloudflare/next-on-pages.
 */
import { ImageResponse } from "next/og";
import { cDb } from "@/lib/db";
import { fmtDsc } from "@/lib/constants";
import type { DscType } from "@/lib/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Infinity Castle Dining — Exclusive Dining Pass";

export default async function Image(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Fetch link data — only nam, dsc, typ needed for the preview
  let nam  = "Exclusive";
  let disc = "";
  try {
    const [link] = await cDb`
      SELECT nam, dsc, typ FROM lnk WHERE ref = ${slug} LIMIT 1
    `;
    if (link) {
      nam  = link.nam as string;
      disc = fmtDsc(Number(link.dsc), link.typ as DscType);
    }
  } catch {
    // If DB fails, fall back to generic card — OG image must never 500
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0B0906 0%, #1A1208 50%, #0F0C08 100%)",
          padding: "60px 80px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Wisteria top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #8961D9, transparent)",
          }}
        />

        {/* Brand + badge */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid rgba(137,97,217,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(137,97,217,0.12)",
              }}
            >
              <span style={{ color: "#8961D9", fontSize: "22px" }}>無</span>
            </div>
            <span
              style={{
                color: "rgba(237,232,224,0.6)",
                fontSize: "14px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
              }}
            >
              INFINITY CASTLE DINING
            </span>
          </div>
          <span
            style={{
              color: "rgba(160,140,100,0.6)",
              fontSize: "12px",
              letterSpacing: "0.2em",
            }}
          >
            Bahawalpur, Pakistan · Open Daily 10:00 – 23:30
          </span>
        </div>

        {/* Centre content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              color: "rgba(137,97,217,0.7)",
              fontSize: "13px",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
            }}
          >
            Exclusive Dining Pass — via {nam}
          </span>

          {/* Discount hero */}
          {disc ? (
            <span
              style={{
                color: "#D4935A",
                fontSize: "96px",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              {disc}
            </span>
          ) : (
            <span
              style={{
                color: "#D4935A",
                fontSize: "64px",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              Special Reward Unlocked
            </span>
          )}

          <span
            style={{
              color: "rgba(237,232,224,0.55)",
              fontSize: "20px",
              marginTop: "8px",
            }}
          >
            Claim your exclusive dining pass · Valid once at billing
          </span>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span
            style={{
              color: "rgba(160,140,100,0.5)",
              fontSize: "13px",
              letterSpacing: "0.15em",
            }}
          >
            Scan · Login with Google · Download Pass
          </span>
          <div
            style={{
              background: "rgba(137,97,217,0.2)",
              border: "1px solid rgba(137,97,217,0.4)",
              borderRadius: "24px",
              padding: "12px 28px",
              color: "#8961D9",
              fontSize: "14px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Claim Now →
          </div>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(137,97,217,0.4), transparent)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
