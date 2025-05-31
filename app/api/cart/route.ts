import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import CartItem from "@/lib/models/cartItem";
import User from "@/lib/models/user";
// 🛒 **POST: Add an Item to the Cart**
export async function GET(req: NextRequest, context: { params: { userId: string } }) {
  try {
    await dbConnect();
    const { userId } = context.params;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const cartItems = await CartItem.find({ userId });

    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { userId, sku, productName, productImage, weight, price, quantity } = await req.json();

    if (!userId || !sku || !productName || !productImage || !weight || !price || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cartItem = await CartItem.create({
      userId,
      sku,
      productName,
      productImage,
      weight,
      price,
      quantity,
    });

    // Add reference to user's cart
    await User.findByIdAndUpdate(userId, { $push: { cart: cartItem._id } });

    return NextResponse.json({ message: "Product added to cart", cartItem });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🛍️ **GET: Fetch All Cart Items for a User**

// ❌ **DELETE: Remove Item from Cart**
export async function DELETE(req: NextRequest, context: { params: { userId: string; sku: string } }) {
  try {
    await dbConnect();
    const { userId, sku } = context.params;

    if (!userId || !sku) {
      return NextResponse.json({ error: "Missing userId or sku" }, { status: 400 });
    }

    const deletedItem = await CartItem.findOneAndDelete({ userId, sku });

    if (!deletedItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // Remove reference from user's cart
    await User.findByIdAndUpdate(userId, { $pull: { cart: deletedItem._id } });

    return NextResponse.json({ message: "Cart item removed", deletedItem });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}