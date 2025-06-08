import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import CartItem from "@/lib/models/cartItem";
import User from "@/lib/models/user";
import { getCurrentUserType } from "@/lib/auth";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// ✅ GET: All Cart Items for Logged-in User
export async function GET(req: NextRequest) {
  await dbConnect();
  const { type, user } = getCurrentUserType(req);

  if (type === "local" || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cartItems = await CartItem.find({ userId: user._id });
  return NextResponse.json({ cart: cartItems });
}

// ✅ POST: Add Item to Cart
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    console.log("Connected to DB");

    const { productId, weight, quantity } = await req.json();
    console.log("Received:", { productId, weight, quantity });

    if (!productId || !weight || quantity < 1) {
      console.log("Invalid data");
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Get userId from JWT
    const authHeader = req.headers.get("authorization");
    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, SECRET_KEY) as any;
        userId = decoded.userId;
        console.log("Decoded userId:", userId);
      } catch (err) {
        console.error("JWT error:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!userId) {
      console.log("No userId");
      return NextResponse.json({ error: "Unauthorized: No userId" }, { status: 401 });
    }

    // Convert IDs to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    let existing;
    try {
      existing = await CartItem.findOne({ userId: userObjectId, productId: productObjectId, weight });
      console.log("Existing cart item:", existing);
    } catch (err) {
      console.error("Error finding cart item:", err);
      return NextResponse.json({ error: "DB error: findOne" }, { status: 500 });
    }

    if (existing) {
      try {
        existing.quantity = quantity;
        await existing.save();
        console.log("Updated existing cart item");
      } catch (err) {
        console.error("Error saving existing cart item:", err);
        return NextResponse.json({ error: "DB error: save" }, { status: 500 });
      }
    } else {
      try {
        await CartItem.create({ userId: userObjectId, productId: productObjectId, weight, quantity });
        console.log("Created new cart item");
      } catch (err) {
        console.error("Error creating new cart item:", err);
        if (
          typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as any).name &&
          ((err as any).name === "ValidationError" || (err as any).name === "CastError")
        ) {
          return NextResponse.json({ error: (err as any).message }, { status: 400 });
        }
        return NextResponse.json({ error: "DB error: create" }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Cart updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/user/cart:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ✅ DELETE: Remove Cart Item using SKU and Weight
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { type, user } = getCurrentUserType(req);
    if (type !== "user" || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, weight } = await req.json();

    if (!productId || !weight) {
      return NextResponse.json({ error: "Missing productId or weight" }, { status: 400 });
    }

    // Convert IDs to ObjectId for deletion
    const userObjectId = new mongoose.Types.ObjectId(user._id);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const deletedItem = await CartItem.findOneAndDelete({
      userId: userObjectId,
      productId: productObjectId,
      weight,
    });

    if (!deletedItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    await User.findByIdAndUpdate(user._id, {
      $pull: { cart: deletedItem._id },
    });

    return NextResponse.json({ message: "Cart item removed", deletedItem });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
