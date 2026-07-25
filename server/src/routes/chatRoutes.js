import { Router } from "express";
import { sendChatMessage } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { chatLimiter } from "../middleware/rateLimiters.js";
import { chatValidator } from "../validators/conversationValidators.js";

export const chatRouter = Router();

chatRouter.post(
  "/",
  protect,
  chatLimiter,
  chatValidator,
  validateRequest,
  sendChatMessage,
);
