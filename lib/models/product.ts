import mongoose, { Schema } from "mongoose";

interface IProduct extends Document {
  name: string;
  slug: string;
  image: string;
  description: string;
  category: string;
  sku: string;
  stockQuantity: number;
  discountPrice?: number;
  tags?: string;
  brand?: string;
  weights: { label: string; price: number }[];
  reviews: mongoose.Types.ObjectId[];
  isBranded: boolean;
  averageRating: number;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  discountPrice: { type: Number },
  brand: { type: String },
  tags: { type: String },
  weights: [{ label: String, price: Number }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // **Linked reviews**
  isBranded: { type: Boolean, required: true, default: true },
  averageRating: { type: Number, default: 0 },
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);