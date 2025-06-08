import mongoose, { Schema, Document } from "mongoose";

interface IProduct extends Document {
  name: string;
  slug: string;
  image: string;
  description: string;
  category: string;
  sku: string;
  discountPrice?: number;
  tags?: string;
  brand?: string;
  weights: { label: string; price: number; quantity: number }[]; // ✅ Quantity per weight
  reviews: mongoose.Types.ObjectId[];
  isBranded: boolean;
  averageRating: number;
  isFeatured: boolean; // ✅ Added featured flag
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  discountPrice: { type: Number },
  brand: { type: String },
  tags: { type: String },
  weights: [{ label: String, price: Number, quantity: Number }], // ✅ Updated structure
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  isBranded: { type: Boolean, required: true, default: true },
  averageRating: { type: Number, default: 0 },
  isFeatured: { type: Boolean, required: true, default: false }, // ✅ Added featured flag
});

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);