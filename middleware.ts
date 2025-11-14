import { NextResponse, NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/account", "/cart", "/wishlist", "/checkout"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all public routes
  if (!PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Read token from cookies (middleware CANNOT read localStorage)
  const token = req.cookies.get("token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/account/:path*",
    "/cart/:path*",
    "/wishlist/:path*",
    "/checkout/:path*",
  ],
};

