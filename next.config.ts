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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anga9.com http://localhost:* ws://localhost:* https://firestore.googleapis.com https://*.firebase.io wss://*.firebaseio.com" }
        ],
      },
    ];
  },
};

export default nextConfig;
