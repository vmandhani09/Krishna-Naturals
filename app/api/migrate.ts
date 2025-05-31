import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/user";

export async function GET() {
  await dbConnect();
  const result = await User.updateMany(
    { cart: { $exists: false } },
    { $set: { cart: [] } }
  );
  return NextResponse.json({ updatedUsers: result.modifiedCount });
}