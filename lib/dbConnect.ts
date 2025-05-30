import mongoose from "mongoose";
import { env } from "process";

const MONGODB_URI = env.MONGODB_URI ?? ""; // ✅ Ensure it's always a string

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// ✅ Declare global type for mongoose caching
declare global {
  var mongoose: {
      Schema: any;
      models: any;
      model<T>(arg0: string, CartItemSchema: mongoose.Schema<ICartItem, mongoose.Model<ICartItem, any, any, any, mongoose.Document<unknown, any, ICartItem, any> & ICartItem & { _id: mongoose.Types.ObjectId; } & { __v: number; }, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, ICartItem, mongoose.Document<unknown, {}, mongoose.FlatRecord<ICartItem>, {}> & mongoose.FlatRecord<ICartItem> & { _id: mongoose.Types.ObjectId; } & { __v: number; }>): any; conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null 
};
}

// ✅ Properly extract `connection` and handle type safely
const cached: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null } =
  global.mongoose ?? { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongooseInstance) => mongooseInstance.connection); // ✅ Extract only `.connection`
  }

  cached.conn = await cached.promise;
  return cached.conn;
}