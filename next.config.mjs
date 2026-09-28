/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR mode — required for API routes, next-auth, and Neon DB calls.
  // Deploy via Cloudflare Pages + @cloudflare/next-on-pages adapter.
  trailingSlash: false,
  images: {
    // Cloudflare Pages does not support Next.js image optimization natively
    unoptimized: true,
  },
  // Next 15 top-level server external packages config
  serverExternalPackages: ["@neondatabase/serverless"],
};

export default nextConfig;
