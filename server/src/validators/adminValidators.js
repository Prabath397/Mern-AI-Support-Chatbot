import { body, param } from "express-validator";

export const userIdParam = [
  param("id").isMongoId().withMessage("Invalid user id."),
];

export const userStatusValidator = [
  param("id").isMongoId().withMessage("Invalid user id."),
  body("isActive").isBoolean().withMessage("isActive must be true or false."),
];

export const settingsValidator = [
  body("systemPrompt")
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage("System prompt must be 20-5000 characters."),
];
