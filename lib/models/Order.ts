import mongoose, { Schema, Document } from "mongoose";

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  weight: string;
  price: number;
  quantity: number;
}

interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
  paymentMethod: string;
  shippingAddress: string;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: { type: String, required: true },
        weight: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: { type: String },
    shippingAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
