/**
 * app/robots.ts — Auto-generated robots.txt served at /robots.txt
 */
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infinitycastledining.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/c/"],
        // Disallow admin panel, API routes, and private verify pages
        disallow: ["/admin", "/api/", "/v/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
