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

export const createMessageValidator = [
  param("id").isMongoId().withMessage("Invalid conversation id."),
  body("content")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("Message content is required."),
];

export const externalReplyValidator = [
  body("conversationId")
    .optional()
    .isMongoId()
    .withMessage("Invalid conversation id."),
  body("userContent")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("User message content is required."),
  body("assistantContent")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("Assistant message content is required."),
  body("provider")
    .optional()
    .trim()
    .isLength({ min: 1, max: 80 })
    .withMessage("Provider must be 1-80 characters."),
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

export function requireChatContent(req, _res, next) {
  req.body.content = (req.body.content || "").trim();
  if (!req.body.content && !req.files?.length) {
    return next(
      new ApiError(400, "Message content or an attachment is required."),
    );
  }
  next();
}
