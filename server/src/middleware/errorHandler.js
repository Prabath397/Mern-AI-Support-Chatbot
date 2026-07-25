import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, "Validation failed", errors.array()));
  }
  next();
}

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal server error";
  let details = error.details || null;

  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists.";
    details = Object.keys(error.keyPattern || {});
  }

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource identifier.";
    details = null;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed.";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (statusCode === 500 && env.isProduction) {
    message = "Something went wrong. Please try again later.";
    details = null;
  }

  if (!env.isTest) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
  });
}
