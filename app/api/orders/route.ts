import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Order from "@/lib/models/Order";
import { dbConnect } from "@/lib/dbConnect";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    // Read JWT from Authorization header
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

    // If not logged in, userId will be null (guest order)

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    if (!body.totalAmount || body.totalAmount < 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    if (!body.shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Prepare the order document
    const orderDoc = {
      userId: userId
        ? new mongoose.Types.ObjectId(userId)
        : undefined,
      items: body.items.map((item: any) => ({
        productId: new mongoose.Types.ObjectId(item.productId),
        productName: item.productName,
        weight: item.weight,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      shippingAddress: body.shippingAddress,
      status: "Pending",
    };

    const createdOrder = await Order.create(orderDoc);

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderId: createdOrder._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error placing order:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
