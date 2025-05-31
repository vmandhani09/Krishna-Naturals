import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI ?? "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// ✅ Declare global type for Mongoose caching
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// ✅ Explicitly define `global.mongoose` as `MongooseCache`
declare global {
  var mongooseCache: MongooseCache;
}

// ✅ Use global storage for caching
global.mongooseCache = global.mongooseCache ?? { conn: null, promise: null };

export async function dbConnect() {
  if (global.mongooseCache.conn) return global.mongooseCache.conn;

  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m.connection);
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}