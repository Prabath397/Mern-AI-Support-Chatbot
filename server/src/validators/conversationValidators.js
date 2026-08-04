import { body, param } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export const conversationIdParam = [
  param("id").isMongoId().withMessage("Invalid conversation id."),
];

export const createConversationValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Title must be 1-120 characters."),
];

export const updateConversationValidator = [
  param("id").isMongoId().withMessage("Invalid conversation id."),
  body("title")
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Title must be 1-120 characters."),
];

export const updateConversationPinValidator = [
  param("id").isMongoId().withMessage("Invalid conversation id."),
  body("pinned").isBoolean().withMessage("Pinned must be true or false."),
];

export const createMessageValidator = [
  param("id").isMongoId().withMessage("Invalid conversation id."),
  body("content")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("Message content is required."),
];

export const chatValidator = [
  body("conversationId")
    .optional()
    .isMongoId()
    .withMessage("Invalid conversation id."),
  body("content")
    .optional()
    .trim()
    .isLength({ max: 20000 })
    .withMessage("Message content must be 20,000 characters or less."),
];

export const regenerateValidator = [
  body("conversationId").isMongoId().withMessage("Invalid conversation id."),
];

export function requireChatContent(req, _res, next) {
  req.body.content = (req.body.content || "").trim();
  if (!req.body.content && !req.files?.length) {
    return next(
      new ApiError(400, "Message content or an attachment is required."),
    );
  }
  next();
}
