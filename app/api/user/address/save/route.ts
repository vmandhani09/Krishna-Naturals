// app/api/user/address/save/route.ts
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

export async function POST(req: NextRequest) {
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

    const requiredFields = ["fullName", "phone", "pincode", "house", "street", "city", "state"] as const;
    const missingField = requiredFields.find(
      (field) => typeof body[field] !== "string" || body[field].trim().length === 0,
    );

    if (missingField) {
      return NextResponse.json({ error: `Missing field: ${missingField}` }, { status: 400 });
    }

    const newAddress = {
      fullName: body.fullName,
      phone: body.phone,
      pincode: body.pincode,
      house: body.house,
      street: body.street,
      landmark: body.landmark || "",
      city: body.city,
      state: body.state,
      isDefault: true,
    };

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.addresses = [newAddress];

    await user.save();

    return NextResponse.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (err) {
    console.error("Save Address Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
