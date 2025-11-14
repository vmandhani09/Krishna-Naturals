// app/api/user/address/delete/route.ts
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

export async function DELETE(req: NextRequest) {
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

    const body = await req.json();
    const index = typeof body.index === "number" ? body.index : parseInt(body.index, 10);

    if (Number.isNaN(index)) {
      return NextResponse.json({ error: "Invalid address index" }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (index < 0 || index >= user.addresses.length) {
      return NextResponse.json({ error: "Invalid address index" }, { status: 400 });
    }

    user.addresses.splice(index, 1);

    if (user.addresses.length === 0) {
      user.addresses = [];
    }

    await user.save();

    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
