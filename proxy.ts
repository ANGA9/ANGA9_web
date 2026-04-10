import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Don't protect the login page itself
  if (pathname === "/seller/login") {
    return NextResponse.next();
  }

  // Protect all /seller/* routes
  const portalCookie = request.cookies.get("portal");
  if (!portalCookie || portalCookie.value !== "seller") {
    const loginUrl = new URL("/seller/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/seller/:path*",
};
