import { NextResponse } from "next/server";

export function middleware(req : any) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.pathname;

  const protectedRoutes = [
    "/checkout",
    "/account",
    "/orders",
    "/admin"
  ];

  if (protectedRoutes.some((route) => url.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/checkout",
    "/account/:path*",
    "/orders/:path*",
    "/admin/:path*",
  ],
};
