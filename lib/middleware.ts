import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload; // 🔍 Explicitly typing as JwtPayload
    
    if (!decoded.userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid token structure" }, { status: 403 });
    }

    req.nextUrl.searchParams.set("userId", decoded.userId); // ✅ Now correctly typed
    return NextResponse.next();

  } catch (error) {
    return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 403 });
  }
}

export const config = {
  matcher: ["/api/protected-route", "/cart", "/wishlist"],
};