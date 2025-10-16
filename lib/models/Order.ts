import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  weight: string;
  price: number;
  quantity: number;
}

interface IOrder extends Document {
  orderId: string;
  userId?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    zip: string;
    country?: string;
  };
  pricing: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  paymentDetails?: {
    method?: string;
    transactionId?: string;
    status?: "pending" | "completed" | "failed" | "refunded";
  };
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address1: { type: String, required: true },
      address2: { type: String },
      city: { type: String, required: true },
      state: { type: String },
      zip: { type: String, required: true },
      country: { type: String },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true },
      tax: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    paymentDetails: {
      method: { type: String },
      transactionId: { type: String },
      status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    },
    orderStatus: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
