import mongoose, { Schema, Document } from "mongoose";

interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    date: { type: Date, default: Date.now },
  }
);

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
