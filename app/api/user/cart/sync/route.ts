import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { getCurrentUserType } from "@/lib/auth";
import CartItem from "@/lib/models/cartItem";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { type, user } = getCurrentUserType(req);

  if (type === "local" || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json();
  if (!Array.isArray(items)) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  for (const item of items) {
    await CartItem.findOneAndUpdate(
      { userId: user._id, sku: item.sku },
      { ...item, userId: user._id },
      { upsert: true }
    );
  }

  return NextResponse.json({ message: "Cart synced" });
}
