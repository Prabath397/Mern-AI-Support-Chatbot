import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { findOwnedConversation } from "../middleware/ownership.js";
import { generateTitle } from "../services/titleService.js";
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

export const saveExternalReply = asyncHandler(async (req, res) => {
  const { conversationId, userContent, assistantContent, provider } = req.body;
  let conversation;

  if (conversationId) {
    conversation = await findOwnedConversation(req.user._id, conversationId);
  } else {
    conversation = await Conversation.create({
      user: req.user._id,
      title: generateTitle(userContent),
    });
  }

  const userMessage = await Message.create({
    conversation: conversation._id,
    role: "user",
    content: userContent,
  });
  const assistantMessage = await Message.create({
    conversation: conversation._id,
    role: "assistant",
    content: assistantContent,
  });

  conversation.updatedAt = new Date();
  if (!conversationId) conversation.title = generateTitle(userContent);
  await conversation.save();

  sendSuccess(
    res,
    {
      conversation,
      messages: [userMessage, assistantMessage],
      provider: provider || "external",
    },
    "External assistant response saved.",
    201,
  );
});
