import mongoose, { Schema, Document } from "mongoose";

interface Address {
  fullName: string;
  phone: string;
  pincode: string;
  house: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  cart: mongoose.Types.ObjectId[];
  wishlist: mongoose.Types.ObjectId[];
  orders: mongoose.Types.ObjectId[];
  addresses: Address[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    pincode: { type: String, required: true },
    house: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    addresses: {
      type: [AddressSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
