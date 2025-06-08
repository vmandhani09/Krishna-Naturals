import mongoose, { Schema } from "mongoose";

const CartItemSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    weight: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.CartItem || mongoose.model("CartItem", CartItemSchema);