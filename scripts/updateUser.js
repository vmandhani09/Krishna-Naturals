require("dotenv").config();
const mongoose = require("mongoose"); // ✅ Ensure correct import

// ✅ Define database connection logic directly
const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const cached = global.mongoose ?? { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongooseInstance) => mongooseInstance.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ Define User schema directly
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

// ✅ Define User model directly
const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function updateUsers() {
  try {
    await dbConnect(); // ✅ Ensure database is connected

    // 🔍 Update existing users to include both `wishlist` and `cart` fields
    const result = await User.updateMany(
      { $or: [{ wishlist: { $exists: false } }, { cart: { $exists: false } }] },
      { $set: { wishlist: [], cart: [] } }
    );

    console.log(`✅ Migration Complete: ${result.modifiedCount} users updated.`);
    await mongoose.disconnect();
  } catch (error)  {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

// 🔥 Run migration
updateUsers();