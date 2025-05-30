import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  mobile?: string;
  createdAt: Date;
  cart: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  mobile: { type: String },
  createdAt: { type: Date, default: Date.now },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }],
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);