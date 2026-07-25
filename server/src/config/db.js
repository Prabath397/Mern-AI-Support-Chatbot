import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri || env.mongoUri.includes("USERNAME:PASSWORD")) {
    throw new Error(
      "A valid MONGO_URI is required to connect to MongoDB Atlas.",
    );
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
