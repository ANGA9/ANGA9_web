import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/public-assets/**",
            search: "",
          },
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/product-images/**",
            search: "",
          },
        ]
      : [],
  },
  async rewrites() {
    // Dev only: proxy /api/* to the local backend so the browser can hit it
    // through Next.js (avoids PNA popups, no CORS setup needed).
    // In production, NEXT_PUBLIC_API_URL is set in Vercel and api.ts hits the
    // VPS directly — this rewrite would otherwise blackhole every API call.
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:4000/api/:path*",
        },
        {
          source: "/ws/:path*",
          destination: "http://localhost:4000/ws/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
