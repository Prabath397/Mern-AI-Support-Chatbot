import mongoose from "mongoose";
import { env } from "./env.js";

const MAX_CONNECT_ATTEMPTS = 3;
const CONNECT_RETRY_DELAY_MS = 2000;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function connectDatabase() {
  if (!env.mongoUri || env.mongoUri.includes("USERNAME:PASSWORD")) {
    throw new Error(
      "A valid MONGO_URI is required to connect to MongoDB Atlas.",
    );
  }

  mongoose.set("strictQuery", true);

  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      return;
    } catch (error) {
      if (attempt === MAX_CONNECT_ATTEMPTS) throw error;

      console.warn(
        `MongoDB connection failed on attempt ${attempt}/${MAX_CONNECT_ATTEMPTS}. Retrying in ${CONNECT_RETRY_DELAY_MS / 1000}s: ${error.message}`,
      );
      await wait(CONNECT_RETRY_DELAY_MS);
    }
  }
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
