import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { findOwnedConversation } from "../middleware/ownership.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

export const createConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.create({
    user: req.user._id,
    title: req.body.title || "New support chat",
  });

  sendSuccess(res, { conversation }, "Conversation created.", 201);
});

export const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ user: req.user._id }).sort({
    updatedAt: -1,
  });
  sendSuccess(res, { conversations }, "Conversations retrieved.");
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await findOwnedConversation(req.user._id, req.params.id);
  sendSuccess(res, { conversation }, "Conversation retrieved.");
});

export const updateConversation = asyncHandler(async (req, res) => {
  const conversation = await findOwnedConversation(req.user._id, req.params.id);
  conversation.title = req.body.title;
  await conversation.save();
  sendSuccess(res, { conversation }, "Conversation renamed.");
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await findOwnedConversation(req.user._id, req.params.id);
  await Message.deleteMany({ conversation: conversation._id });
  await conversation.deleteOne();
  sendSuccess(res, null, "Conversation deleted.");
});
