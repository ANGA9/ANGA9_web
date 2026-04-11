import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTAL_CONFIG: Record<string, string> = {
  "/admin": "admin",
  "/seller": "seller",
  "/customer": "customer",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine which portal this request belongs to
  for (const [prefix, portalName] of Object.entries(PORTAL_CONFIG)) {
    if (!pathname.startsWith(prefix)) continue;

    // Don't protect login pages
    if (pathname === `${prefix}/login`) {
      return NextResponse.next();
    }

    // Check for portal cookie
    const portalCookie = request.cookies.get("portal");
    if (!portalCookie || portalCookie.value !== portalName) {
      const loginUrl = new URL(`${prefix}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/customer/:path*"],
};
