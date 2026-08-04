import { Router } from "express";
import {
  regenerateChatMessage,
  sendChatMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { chatLimiter } from "../middleware/rateLimiters.js";
import { chatUpload } from "../middleware/upload.js";
import {
  chatValidator,
  regenerateValidator,
  requireChatContent,
} from "../validators/conversationValidators.js";

export const chatRouter = Router();

chatRouter.post(
  "/",
  protect,
  chatLimiter,
  chatUpload.array("attachments", 3),
  chatValidator,
  validateRequest,
  requireChatContent,
  sendChatMessage,
);

chatRouter.post(
  "/regenerate",
  protect,
  chatLimiter,
  regenerateValidator,
  validateRequest,
  regenerateChatMessage,
);
