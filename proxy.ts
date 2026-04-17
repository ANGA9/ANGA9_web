import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTAL_CONFIG: Record<string, string> = {
  "/admin": "admin",
  "/seller": "seller",
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin & Seller portals
  for (const [prefix, portalName] of Object.entries(PORTAL_CONFIG)) {
    // Only match if the path is exactly the prefix or starts with prefix + '/'
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) continue;

    // Allow login page and seller landing page without auth
    if (pathname === `${prefix}/login` || pathname === prefix) {
      return NextResponse.next();
    }

    const portalCookie = request.cookies.get("portal");
    if (!portalCookie || portalCookie.value !== portalName) {
      const loginUrl = new URL(`${prefix}/login`, request.url);
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
