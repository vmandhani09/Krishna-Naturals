import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/lib/models/user";
import { dbConnect } from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);

    const user = await User.findById(decoded.userId);
    const { index } = await req.json();

    user.addresses.forEach((a: any, i: number) => (a.isDefault = i === index));

    await user.save();

    return NextResponse.json({ success: true, addresses: user.addresses });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
