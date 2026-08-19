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
  "/seller/register",
];

function isSellerPublicPath(pathname: string): boolean {
  return SELLER_PUBLIC_PATHS.includes(pathname);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass middleware for API routes so Next.js or next.config.ts rewrites can handle them
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. If this request was already rewritten internally, pass through directly to page handler
  if (request.headers.get("x-seller-internal-rewrite") === "1") {
    return NextResponse.next();
  }

  const host = (request.headers.get("host") || "").toLowerCase();
  const isSellerSubdomain = host === SELLER_HOST || host.startsWith("seller.");

  // ──────────────────────────────────────────────────
  // Subdomain routing: seller.anga9.com / seller.localhost → /seller/*
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
  let shouldRewrite = false;

  if (isSellerSubdomain) {
    // If user directly browsed to /seller/* on the subdomain, 301 redirect to clean URL
    if (pathname === "/seller" || pathname.startsWith("/seller/")) {
      const subPath = pathname.replace(/^\/seller/, "") || "/";
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = isLocalhost ? "http" : "https";
      const targetHost = isLocalhost ? host : SELLER_HOST;
      return NextResponse.redirect(
        `${protocol}://${targetHost}${subPath}${request.nextUrl.search}`,
        301
      );
    }

    // Legal/policy pages live on main domain only — 301 redirect to main domain
    if (LEGAL_PATHS.includes(pathname)) {
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = isLocalhost ? "http" : "https";
      const targetHost = isLocalhost ? host.replace(/^seller\./, "") : "anga9.com";
      return NextResponse.redirect(
        `${protocol}://${targetHost}${pathname}${request.nextUrl.search}`,
        301
      );
    }

    // Map clean path to internal /seller/* route
    effectivePath = pathname === "/" ? "/seller/sell-on-anga9" : `/seller${pathname}`;
    shouldRewrite = true;
  } else {
    // On main host (anga9.com), redirect /seller/* to subdomain for SEO (except on localhost)
    const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
    if (!isLocalhost && (pathname === "/seller" || pathname.startsWith("/seller/"))) {
      const subPath = pathname.replace(/^\/seller/, "") || "/";
      return NextResponse.redirect(
        `https://${SELLER_HOST}${subPath}${request.nextUrl.search}`,
        301
      );
    }
  }

  // ──────────────────────────────────────────────────
  // Seller Portal Guard & Rewrite
  // ──────────────────────────────────────────────────
  if (effectivePath === "/seller" || effectivePath.startsWith("/seller/")) {
    // Public seller pages — no auth required
    if (isSellerPublicPath(effectivePath)) {
      if (shouldRewrite) {
        const nextUrl = request.nextUrl.clone();
        nextUrl.pathname = effectivePath;
        const reqHeaders = new Headers(request.headers);
        reqHeaders.set("x-seller-internal-rewrite", "1");
        return NextResponse.rewrite(nextUrl, { request: { headers: reqHeaders } });
      }
      return NextResponse.next();
    }

    // Protected seller routes (dashboard, onboarding, etc.)
    const portalCookie = request.cookies.get("portal");

    if (!portalCookie || portalCookie.value !== "seller") {
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = isLocalhost ? "http" : "https";
      const targetHost = isLocalhost ? host : SELLER_HOST;
      const loginUrl = isSellerSubdomain
        ? new URL("/login", `${protocol}://${targetHost}`)
        : new URL("/seller/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (shouldRewrite) {
      const nextUrl = request.nextUrl.clone();
      nextUrl.pathname = effectivePath;
      const reqHeaders = new Headers(request.headers);
      reqHeaders.set("x-seller-internal-rewrite", "1");
      return NextResponse.rewrite(nextUrl, { request: { headers: reqHeaders } });
    }

    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────
  // Admin Portal Guard
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
  // Customer portal — allow all root paths
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
