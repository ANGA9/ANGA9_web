import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Seller portal — all pages are public (no auth gate)
  if (pathname === "/seller" || pathname.startsWith("/seller/")) {
    return NextResponse.next();
  }

  // Admin portal
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

  // Customer portal — allow all root paths without auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/((?!_next|favicon\\.ico).*)",
  ],
};
