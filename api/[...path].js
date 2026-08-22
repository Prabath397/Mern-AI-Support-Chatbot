import { app } from "../server/src/app.js";
import { connectDatabase } from "../server/src/config/db.js";
import { validateEnv } from "../server/src/config/env.js";

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

export default async function handler(req, res) {
  await ensureDatabase();
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
}
