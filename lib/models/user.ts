import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  avatar?: string;
  authProvider: "local";
  isVerified: boolean;
  verificationToken?: string;
  createdAt: Date;
  updatedAt: Date;
  cart: mongoose.Types.ObjectId[];
  wishlist: mongoose.Types.ObjectId[];
  orders: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    avatar: { type: String },
    authProvider: { type: String, enum: ["local"], default: "local" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
