import mongoose from "mongoose";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { env, validateEnv } from "./config/env.js";

let server;

async function start() {
  try {
    validateEnv();
    await connectDatabase();
    server = app.listen(env.port, () => {
      console.info(`SupportSphere AI API listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.info(`${signal} received. Shutting down gracefully.`);
  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  } else if (mongoose.connection.readyState !== 0) {
    await disconnectDatabase();
    process.exit(0);
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
