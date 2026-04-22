import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Seller landing pages that should always be public (no auth gate).
 * These are marketing/information pages, not seller dashboard pages.
 */
const SELLER_PUBLIC_PATHS = [
  "/seller",
  "/seller/sell-on-anga9",
  "/seller/how-to-sell",
  "/seller/shipping",
  "/seller/grow-business",
  "/seller/login",
];

/**
 * Check if a path is a seller public page.
 */
function isSellerPublicPath(pathname: string): boolean {
  return SELLER_PUBLIC_PATHS.includes(pathname);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ──────────────────────────────────────────────────
  // Seller portal
  // ──────────────────────────────────────────────────
  if (pathname === "/seller" || pathname.startsWith("/seller/")) {
    // Public seller pages — no auth required
    if (isSellerPublicPath(pathname)) {
      return NextResponse.next();
    }

    // Protected seller routes (dashboard, onboarding, etc.)
    // Check for portal cookie (set by AuthContext on login)
    const portalCookie = request.cookies.get("portal");

    if (!portalCookie) {
      // No session → redirect to seller login
      const loginUrl = new URL("/seller/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists → allow through
    // Note: Role-based access (seller vs customer) is enforced
    // on the client side and backend API layer, not in middleware.
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────
  // Admin portal
  // ──────────────────────────────────────────────────
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login" || pathname === "/admin") {
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
