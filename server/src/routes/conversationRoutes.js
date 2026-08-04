import { Router } from "express";
import {
  createConversation,
  deleteConversation,
  getConversation,
  listConversations,
  updateConversation,
  updateConversationPin,
} from "../controllers/conversationController.js";
import {
  createMessage,
  listMessages,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import {
  conversationIdParam,
  createConversationValidator,
  createMessageValidator,
  updateConversationPinValidator,
  updateConversationValidator,
} from "../validators/conversationValidators.js";

export const conversationRouter = Router();

conversationRouter.use(protect);
conversationRouter.post(
  "/",
  createConversationValidator,
  validateRequest,
  createConversation,
);
conversationRouter.get("/", listConversations);
conversationRouter.get(
  "/:id",
  conversationIdParam,
  validateRequest,
  getConversation,
);
conversationRouter.put(
  "/:id",
  updateConversationValidator,
  validateRequest,
  updateConversation,
);
conversationRouter.patch(
  "/:id/pin",
  updateConversationPinValidator,
  validateRequest,
  updateConversationPin,
);
conversationRouter.delete(
  "/:id",
  conversationIdParam,
  validateRequest,
  deleteConversation,
);
conversationRouter.get(
  "/:id/messages",
  conversationIdParam,
  validateRequest,
  listMessages,
);
conversationRouter.post(
  "/:id/messages",
  createMessageValidator,
  validateRequest,
  createMessage,
);
