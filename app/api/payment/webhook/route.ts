import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

export const config = { api: { bodyParser: false } } as any;

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any });
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = (pi.metadata as any)?.orderId;
      if (orderId) {
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
      }
    }
  } catch (err) {
    // swallow
  }

  return NextResponse.json({ received: true });
}


