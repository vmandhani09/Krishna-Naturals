import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  date: { type: Date, default: Date.now },
});

const weightSchema = new mongoose.Schema({
  label: { type: String, required: true },
  price: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number },
    brand: { type: String, default: "Krishna Naturals" },
    tags: { type: String },
    weights: { type: [weightSchema], required: true },
    reviews: { type: [reviewSchema], default: [] },
    averageRating: { type: Number, default: 0 },
    isBranded: { type: Boolean, required: true, default: true }, // ✅ Added isBranded field
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);