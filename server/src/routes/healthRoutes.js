import { Router } from "express";
import { sendSuccess } from "../utils/responses.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  sendSuccess(
    res,
    {
      status: "ok",
      service: "Nexia AI API",
      timestamp: new Date().toISOString(),
    },
    "API healthy.",
  );
});
