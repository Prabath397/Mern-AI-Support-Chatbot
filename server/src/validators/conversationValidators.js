import { body, param } from "express-validator";

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

export const chatValidator = [
  body("conversationId")
    .optional()
    .isMongoId()
    .withMessage("Invalid conversation id."),
  body("content")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("Message content is required."),
];
