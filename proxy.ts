import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SELLER_HOST = "seller.anga9.com";

const SELLER_PUBLIC_PATHS = [
  "/seller",
  "/seller/sell-on-anga9",
  "/seller/how-to-sell",
  "/seller/shipping",
  "/seller/grow-business",
  "/seller/login",
];

function isSellerPublicPath(pathname: string): boolean {
  return SELLER_PUBLIC_PATHS.includes(pathname);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass middleware for API routes so Next.js or next.config.ts rewrites can handle them
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const host = (request.headers.get("host") || "").toLowerCase();
  const isSellerSubdomain = host === SELLER_HOST || host.startsWith("seller.");
  const url = request.nextUrl.clone();

  // ──────────────────────────────────────────────────
  // Subdomain routing: seller.anga9.com → /seller/*
  // ──────────────────────────────────────────────────
  const LEGAL_PATHS = [
    "/terms",
    "/privacy",
    "/faq",
    "/shipping-policy",
    "/returns",
    "/cancellation",
    "/contact",
  ];

  let effectivePath = pathname;
  let rewroteForSubdomain = false;
  if (isSellerSubdomain) {
    if (pathname === "/seller" || pathname.startsWith("/seller/")) {
      // 301 ugly /seller/* paths on the subdomain to clean URLs
      const subPath = pathname.replace(/^\/seller/, "") || "/";
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = isLocalhost ? "http" : "https";
      const targetHost = isLocalhost ? host : SELLER_HOST;
      return NextResponse.redirect(
        `${protocol}://${targetHost}${subPath}${url.search}`,
        301
      );
    }
    // Legal/policy pages live on main domain only — 301 to anga9.com
    if (LEGAL_PATHS.includes(pathname)) {
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = isLocalhost ? "http" : "https";
      const targetHost = isLocalhost ? host.replace(/^seller\./, "") : "anga9.com";
      return NextResponse.redirect(
        `${protocol}://${targetHost}${pathname}${url.search}`,
        301
      );
    }
    // Clean path → rewrite to internal /seller/* without changing URL bar
    effectivePath = pathname === "/" ? "/seller/sell-on-anga9" : `/seller${pathname}`;
    url.pathname = effectivePath;
    rewroteForSubdomain = true;
  } else {
    // On main host (anga9.com) — redirect /seller/* to subdomain for SEO consolidation
    // Bypass this redirect on localhost for local development testing
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    if (!isLocalhost && (pathname === "/seller" || pathname.startsWith("/seller/"))) {
      const subPath = pathname.replace(/^\/seller/, "") || "/";
      return NextResponse.redirect(
        `https://${SELLER_HOST}${subPath}${url.search}`,
        301
      );
    }
  }

  // ──────────────────────────────────────────────────
  // Seller portal
  // ──────────────────────────────────────────────────
  if (effectivePath === "/seller" || effectivePath.startsWith("/seller/")) {
    // Public seller pages — no auth required
    if (isSellerPublicPath(effectivePath)) {
      return rewroteForSubdomain ? NextResponse.rewrite(url) : NextResponse.next();
    }

    // Protected seller routes (dashboard, onboarding, etc.)
    const portalCookie = request.cookies.get("portal");

    if (!portalCookie) {
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = isLocalhost ? "http" : "https";
      const targetHost = isLocalhost ? host : SELLER_HOST;
      const loginUrl = isSellerSubdomain
        ? new URL("/login", `${protocol}://${targetHost}`)
        : new URL("/seller/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return rewroteForSubdomain ? NextResponse.rewrite(url) : NextResponse.next();
  }

  // ──────────────────────────────────────────────────
  // Admin portal
  // ──────────────────────────────────────────────────
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const portalCookie = request.cookies.get("portal");
    if (!portalCookie || portalCookie.value !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────
  // Customer portal — allow all root paths without auth
  // ──────────────────────────────────────────────────
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/((?!_next|favicon\\.ico).*)",
  ],
};
