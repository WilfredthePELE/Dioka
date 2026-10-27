import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles its own output tracing; standalone currently conflicts with
  // the Next.js 16.3 Vercel build adapter. Keep it for Truehost/Docker hosts.
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }, { source: "/api/:path((?!products$|content$).*)", headers: [{ key: "Cache-Control", value: "no-store" }] }];
  },
};

export default nextConfig;
