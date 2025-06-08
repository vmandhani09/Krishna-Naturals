import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

export async function GET(req: NextRequest) {
  try {
    // Prefer Authorization header, fallback to cookie
    const authHeader = req.headers.get("Authorization");
    const cookieToken = req.cookies.get("token")?.value;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
      if (!decoded || typeof decoded !== "object" || !decoded.userId || !decoded.email) {
        return NextResponse.json({ error: "Unauthorized: Invalid token payload" }, { status: 403 });
      }

      // You can add more user fields here if needed
      return NextResponse.json({
        message: "User authenticated successfully",
        user: {
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name || "", // Add name if present in token
          role: decoded.role || "user",
        },
      }, { status: 200 });

    } catch (jwtError) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }
  } catch (err) {
    console.error("Auth Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}