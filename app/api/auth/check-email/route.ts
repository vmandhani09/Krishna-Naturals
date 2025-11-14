import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email } = await req.json();

    if (!email)
      return NextResponse.json({ exists: false });

    const user = await User.findOne({ email });

    return NextResponse.json({ exists: !!user });
  } catch (err) {
    return NextResponse.json({ exists: false });
  }
}
