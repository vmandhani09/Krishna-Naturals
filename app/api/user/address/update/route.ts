// app/api/user/address/update/route.ts
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

    const body = await req.json();
    const { index, address } = body;

    if (typeof index !== "number") {
      return NextResponse.json({ error: "Index required" }, { status: 400 });
    }

    if (!address || typeof address !== "object") {
      return NextResponse.json({ error: "Address payload required" }, { status: 400 });
    }

    const payload = address as {
      fullName: string;
      phone: string;
      pincode: string;
      house: string;
      street: string;
      landmark?: string;
      city: string;
      state: string;
    };

    const requiredFields = ["fullName", "phone", "pincode", "house", "street", "city", "state"] as const;
    const missingField = requiredFields.find(
      (field) => typeof payload[field] !== "string" || payload[field].trim().length === 0,
    );

    if (missingField) {
      return NextResponse.json({ error: `Missing field: ${missingField}` }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (index < 0 || index >= user.addresses.length) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 });
    }

    user.addresses[index] = {
      fullName: payload.fullName,
      phone: payload.phone,
      pincode: payload.pincode,
      house: payload.house,
      street: payload.street,
      landmark: payload.landmark || "",
      city: payload.city,
      state: payload.state,
      isDefault: true,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
