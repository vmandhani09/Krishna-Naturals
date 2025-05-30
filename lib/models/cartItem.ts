import mongoose, { Schema } from "mongoose";

interface ICartItem extends Document {
  userId: mongoose.Types.ObjectId;
  sku: string;
  productName: string;
  productImage: string;
  weight: string;
  price: number;
  quantity: number;
}

const CartItemSchema = new Schema<ICartItem>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sku: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  weight: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
});

export default mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", CartItemSchema);