import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import mongoose from "mongoose";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" as any });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body as { orderId: string };
    if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });

    await dbConnect();
    const order = await Order.findOne({ orderId });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.pricing.total * 100),
      currency: process.env.STRIPE_CURRENCY || "inr",
      metadata: { orderId: order.orderId },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}


