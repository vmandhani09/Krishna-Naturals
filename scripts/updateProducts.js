// require("dotenv").config();
// const mongoose = require("mongoose"); // ✅ Ensure correct import

// // ✅ Define database connection logic directly
// const MONGODB_URI = process.env.MONGODB_URI ?? "";

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable");
// }

// const cached = global.mongoose ?? { conn: null, promise: null };

// async function dbConnect() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       bufferCommands: false,
//     }).then((mongooseInstance) => mongooseInstance.connection);
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// const ProductSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   slug: { type: String, required: true, unique: true },
//   image: { type: String, required: true },
//   description: { type: String, required: true },
//   category: { type: String, required: true },
//   sku: { type: String, required: true, unique: true },
//   discountPrice: { type: Number },
//   brand: { type: String },
//   tags: { type: String },
//   weights: [{ label: String, price: Number, quantity: Number }], // ✅ Includes quantity per weight
//   reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], 
//   isBranded: { type: Boolean, required: true, default: true },
//   averageRating: { type: Number, default: 0 },
//   isFeatured: { type: Boolean, required: true, default: false }, // ✅ Added featured flag
// });

// const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

// async function updateProducts() {
//   try {
//     await dbConnect(); // ✅ Ensure database connection
    
//     // 🔍 Update all products:
//     const result = await Product.updateMany(
//       { $or: [{ isFeatured: { $exists: false } }, { stockQuantity: { $exists: true } }] }, // Match products needing updates
//       {
//         $set: { isFeatured: false }, // ✅ Add `isFeatured` flag with default false
//         $unset: { stockQuantity: "" }, // ✅ Remove legacy `stockQuantity`
//         $push: { weights: { $each: [{ label: "Default", price: 0, quantity: 0 }] } }, // ✅ Ensure weight structure
//       }
//     );

//     console.log(`✅ Migration Complete: ${result.modifiedCount} products updated.`);
//     await mongoose.disconnect();
//   } catch (error) {
//     console.error("Migration error:", error);
//     process.exit(1);
//   }
// }

// // 🔥 Run migration
// updateProducts();