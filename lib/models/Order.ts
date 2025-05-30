import mongoose, { Schema } from "mongoose";

interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  items: mongoose.Types.ObjectId[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    name: string;
    email: string;
    mobile: string;
    address: string;
    city: string;
    pincode: string;
  };
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerMobile: { type: String, required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }],
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);