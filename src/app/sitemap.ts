/**
 * app/sitemap.ts — Auto-generated sitemap served at /sitemap.xml
 * Next.js MetadataRoute.Sitemap format.
 *
 * Static routes only — /c/[slug] and /v/[sec] are excluded intentionally:
 *  - Coupon links are private/personal — indexing them serves no SEO purpose
 *  - Admin page is private — explicitly excluded
 */
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infinitycastledining.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
