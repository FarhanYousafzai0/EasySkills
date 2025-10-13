// /lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("❌ Add MONGODB_URI to .env.local");

let cached = globalThis.__mongoCache;
if (!cached) {
  cached = globalThis.__mongoCache = { conn: null, promise: null, isConnected: false };
}

export async function connectDB() {
  // 1) Reuse live connection
  if (cached.conn && cached.isConnected) return cached.conn;

  // 2) Reuse in-flight promise (avoid parallel connects)
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { dbName: "EasySkills" })
      .then((mongooseInstance) => {
        cached.conn = mongooseInstance;
        cached.isConnected = true; // <-- here is your "false → true" flip, but cached
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null; // reset so next attempt can retry
        throw err;
      });
  }

  // 3) Await connect (or reuse the same promise)
  return cached.promise;
}
