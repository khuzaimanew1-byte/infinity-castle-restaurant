/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR mode — required for API routes, next-auth, and Neon DB calls.
  // Deploy via Cloudflare Pages + @cloudflare/next-on-pages adapter.
  // (Static export removed — incompatible with server-side API routes)
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
