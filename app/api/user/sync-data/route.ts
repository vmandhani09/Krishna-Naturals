import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import CartItem from "@/lib/models/cartItem";
import User from "@/lib/models/user";
import { getCurrentUserType } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await dbConnect();
  const { type, user } = getCurrentUserType(req);

  if (type === "local" || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cartItems, wishlistItems } = await req.json();

  // Sync cart items
  for (const item of cartItems || []) {
    const existing = await CartItem.findOne({
      userId: user._id,
      sku: item.sku,
      weight: item.weight,
    });

    if (existing) {
      existing.quantity += item.quantity;
      await existing.save();
    } else {
      const newItem = await CartItem.create({
        ...item,
        userId: user._id,
      });
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { cart: newItem._id },
      });
    }
  }

  // Sync wishlist items
  if (wishlistItems?.length > 0) {
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { wishlist: { $each: wishlistItems } },
    });
  }

  return NextResponse.json({ message: "Data synced successfully" });
}
