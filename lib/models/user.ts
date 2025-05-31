import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  mobile?: string;
  createdAt: Date;
  cart: mongoose.Types.ObjectId[];
  wishlist: mongoose.Types.ObjectId[];
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  mobile: { type: String },
  createdAt: { type: Date, default: Date.now },
  cart: { type: [mongoose.Schema.Types.ObjectId], ref: "CartItem", default: [] },
  wishlist: { type: [mongoose.Schema.Types.ObjectId], ref: "Product", default: [] },
});

// 🔄 Change CommonJS export to ES module export
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);