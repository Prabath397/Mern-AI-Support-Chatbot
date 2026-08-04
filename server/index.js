import express from "express";
import { app } from "./src/app.js";
import { connectDatabase } from "./src/config/db.js";
import { validateEnv } from "./src/config/env.js";

const vercelApp = express();
let databasePromise;

async function ensureDatabase() {
  if (!databasePromise) {
    validateEnv();
    databasePromise = connectDatabase().catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }

  return databasePromise;
}

vercelApp.use(async (req, res, next) => {
  if (req.path === "/api/health") {
    return next();
  }

  try {
    await ensureDatabase();
    return next();
  } catch (error) {
    return next(error);
  }
});

vercelApp.use(app);

export default vercelApp;
