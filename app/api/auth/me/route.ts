import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    // 🔍 Get token from cookies or Authorization header
    const token =
      req.cookies.get("token")?.value || req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    // 🔑 Verify JWT token
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

    // 🔍 Validate decoded data properly
    const userId = decoded?.userId as string;
    const email = decoded?.email as string;

    if (!userId || !email) {
      return NextResponse.json({ error: "Unauthorized: Invalid token data" }, { status: 403 });
    }

    // ✅ Return user details
    return NextResponse.json({
      message: "User authenticated",
      user: { id: userId, email },
    });

  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Unauthorized: Invalid token or expired" }, { status: 403 });
  }
}