import { NextRequest, NextResponse } from "next/server";
import CartItem from "@/lib/models/cartItem";
import { dbConnect } from "@/lib/dbConnect";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

// 🛒 Add or update cart
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { productId, weight, quantity } = await req.json();

    if (!productId || !weight || quantity < 1) {
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
      } catch (err) {
        console.error("JWT error:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: No userId" }, { status: 401 });
    }

    // Convert IDs to ObjectId for correct querying
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const existing = await CartItem.findOne({ userId: userObjectId, productId: productObjectId, weight });

    if (existing) {
      // SET the quantity instead of adding
      existing.quantity = quantity;
      await existing.save();
    } else {
      await CartItem.create({ userId: userObjectId, productId: productObjectId, weight, quantity });
    }

    return NextResponse.json({ message: "Cart updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/cart:", error);
    return NextResponse.json({ error: "Internal Server Errors" }, { status: 500 });
  }
}

// ❌ Remove from cart
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { productId, weight } = await req.json();

    // Get userId from JWT
    const authHeader = req.headers.get("authorization");
    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, SECRET_KEY) as any;
        userId = decoded.userId;
      } catch (err) {
        console.error("JWT error:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: No userId" }, { status: 401 });
    }

    if (!productId || !weight) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Convert IDs to ObjectId for correct deletion
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    await CartItem.deleteOne({ userId: userObjectId, productId: productObjectId, weight });

    return NextResponse.json({ message: "Item removed from cart" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
