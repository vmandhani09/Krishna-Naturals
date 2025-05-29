import { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }
}, {
  timestamps: true,
});

// ✅ Ensuring Proper Model Initialization
export const User = models.User || model("User", UserSchema);
