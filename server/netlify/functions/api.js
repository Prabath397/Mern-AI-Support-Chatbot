import express from "express";
import serverless from "serverless-http";
import { app } from "../../src/app.js";
import { connectDatabase } from "../../src/config/db.js";
import { validateEnv } from "../../src/config/env.js";

const netlifyApp = express();

netlifyApp.use((req, _res, next) => {
  const functionPrefix = "/.netlify/functions/api";

  if (req.url.startsWith(functionPrefix)) {
    req.url = req.url.slice(functionPrefix.length) || "/";
  }

  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  next();
});

netlifyApp.use(app);

const expressHandler = serverless(netlifyApp);
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

export async function handler(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  await ensureDatabase();
  return expressHandler(event, context);
}
