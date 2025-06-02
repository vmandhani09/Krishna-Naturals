import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload, JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key"; // ✅ Fallback prevents undefined error
if (!SECRET_KEY) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export async function GET(req: NextRequest) {
  try {
    // 🔍 Extract token safely
    const authHeader = req.headers.get("Authorization");
    const cookieToken = req.cookies.get("token")?.value;
    const token = cookieToken || (authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    try {
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

    } catch (jwtError) {
      if (jwtError instanceof TokenExpiredError) {
        return NextResponse.json({ error: "Unauthorized: Token expired" }, { status: 401 });
      } else if (jwtError instanceof JsonWebTokenError) {
        return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 403 });
      } else {
        return NextResponse.json({ error: "Unauthorized: Token verification failed" }, { status: 403 });
      }
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}