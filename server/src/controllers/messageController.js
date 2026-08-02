import { Message } from "../models/Message.js";
import { findOwnedConversation } from "../middleware/ownership.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

export const listMessages = asyncHandler(async (req, res) => {
  const conversation = await findOwnedConversation(req.user._id, req.params.id);
  const messages = await Message.find({ conversation: conversation._id }).sort({
    createdAt: 1,
  });
  sendSuccess(res, { messages }, "Messages retrieved.");
});

export const createMessage = asyncHandler(async (req, res) => {
  const conversation = await findOwnedConversation(req.user._id, req.params.id);
  const message = await Message.create({
    conversation: conversation._id,
    role: "user",
    content: req.body.content,
  });
  conversation.updatedAt = new Date();
  await conversation.save();
  sendSuccess(res, { message }, "Message saved.", 201);
});
