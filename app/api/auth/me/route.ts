import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

export async function GET(req: NextRequest) {
  try {
    const headerToken = req.headers.get("authorization");
    const cookieToken = req.cookies.get("token")?.value;

    const token =
      headerToken?.startsWith("Bearer ")
        ? headerToken.slice(7)
        : cookieToken;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized: Invalid token payload" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          addresses: user.addresses ?? [],
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Auth Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}