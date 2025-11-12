import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "default-secret-key";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header or cookie
    const authHeader = req.headers.get("Authorization");
    const cookieToken = req.cookies.get("token")?.value;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
      if (!decoded || typeof decoded !== "object" || !decoded.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userId = decoded.userId;

      // Fetch user orders
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // Format orders for frontend
      const formattedOrders = orders.map((order) => ({
        id: order.orderId,
        date: order.createdAt.toISOString().split("T")[0],
        status: order.orderStatus || "pending",
        total: order.pricing?.total || 0,
        items: order.items.map((item: any) => `${item.productName} (${item.weight})`),
        paymentStatus: order.paymentStatus || "pending",
        shippingAddress: order.shippingAddress,
      }));

      return NextResponse.json({ orders: formattedOrders }, { status: 200 });
    } catch (jwtError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

