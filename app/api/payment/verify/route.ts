import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentIntentId, orderId } = body as { paymentIntentId: string; orderId: string };
    if (!paymentIntentId || !orderId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status === "succeeded") {
      await dbConnect();
      await Order.updateOne(
        { orderId },
        {
          $set: {
            paymentStatus: "completed",
            orderStatus: "confirmed",
            "paymentDetails.method": "stripe",
            "paymentDetails.transactionId": pi.id,
            "paymentDetails.status": "completed",
          },
        }
      );
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false, status: pi.status });
  } catch (err) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}


