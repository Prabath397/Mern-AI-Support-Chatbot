import mongoose from "mongoose";
import { Conversation } from "../models/Conversation.js";
import { ApiError } from "../utils/ApiError.js";

export async function findOwnedConversation(userId, conversationId) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation id.");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    user: userId,
  });
  if (!conversation) {
    throw new ApiError(404, "Conversation not found.");
  }

  return conversation;
}
