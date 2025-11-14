import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";

type JwtPayload = { userId: string };

const SECRET = process.env.JWT_SECRET || "default-secret-key";

function getToken(req: NextRequest) {
  const cookieToken = req.cookies.get("token")?.value;
  const headerToken = req.headers.get("authorization");

  if (headerToken?.startsWith("Bearer ")) {
    return headerToken.slice(7);
  }

  return headerToken ?? cookieToken ?? null;
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { name } = await req.json();

    if (typeof name !== "string" || name.trim().length < 3) {
      return NextResponse.json({ error: "Name must be at least 3 characters" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { name: name.trim() },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        addresses: updatedUser.addresses ?? [],
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

