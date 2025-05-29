import mongoose from "mongoose";
import { env } from "process";

const MONGODB_URI = env.MONGODB_URI ?? ""; // ✅ Ensure it's always a string

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// ✅ Declare global type for mongoose caching
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
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