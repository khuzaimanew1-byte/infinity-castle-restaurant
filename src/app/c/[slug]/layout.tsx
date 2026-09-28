/**
 * /c/[slug]/layout.tsx — Server component that generates per-slug metadata.
 * The actual page.tsx stays "use client" — metadata cannot be exported
 * from a client component in Next.js App Router.
 *
 * This layout wraps the claim page and provides:
 *  - Dynamic <title> with promoter name
 *  - OG description mentioning discount (fetched from DB)
 *  - Canonical URL for each slug
 *  - Points og:image to the opengraph-image.tsx auto-route
 */
import type { Metadata } from "next";
import { cDb } from "@/lib/db";
import { fmtDsc } from "@/lib/constants";
import type { DscType } from "@/lib/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infinitycastledining.com";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  let title = "Exclusive Dining Pass";
  let description =
    "Claim your exclusive Infinity Castle Dining pass — a one-time discount awaits you.";

  try {
    const [link] = await cDb`
      SELECT nam, dsc, typ FROM lnk WHERE ref = ${slug} LIMIT 1
    `;
    if (link) {
      const disc = fmtDsc(Number(link.dsc), link.typ as DscType);
      title       = `${disc} OFF — Dining Pass via ${link.nam}`;
      description = `${link.nam} has shared an exclusive ${disc} dining pass at Infinity Castle. Login with Google to claim yours — valid once at billing.`;
    }
  } catch {
    // DB unreachable — fall back to generic metadata
  }

  const pageUrl = `${SITE_URL}/c/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${title} · Infinity Castle Dining`,
      description,
      url: pageUrl,
      type: "website",
      siteName: "Infinity Castle Dining",
      // og:image is auto-served by opengraph-image.tsx in the same directory
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · Infinity Castle Dining`,
      description,
    },
  };
}

// Pass-through layout — no visual changes, only metadata
export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
