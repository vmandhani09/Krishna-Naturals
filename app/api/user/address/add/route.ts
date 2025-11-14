import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findById(decoded.userId);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    const newAddress = {
      fullName: body.fullName,
      phone: body.phone,
      pincode: body.pincode,
      house: body.house,
      street: body.street,
      landmark: body.landmark,
      city: body.city,
      state: body.state,
      isDefault: user.addresses.length === 0,
    };

    user.addresses.push(newAddress);
    await user.save();

    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error("Add Address Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
