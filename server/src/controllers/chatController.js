import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { findOwnedConversation } from "../middleware/ownership.js";
import { generateAssistantReply } from "../services/aiService.js";
import { getSystemSetting } from "../services/systemSettingService.js";
import { generateTitle } from "../services/titleService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

export const sendChatMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  let conversation;

  if (conversationId) {
    conversation = await findOwnedConversation(req.user._id, conversationId);
  } else {
    conversation = await Conversation.create({
      user: req.user._id,
      title: generateTitle(content),
    });
  }

  const previousMessages = await Message.find({
    conversation: conversation._id,
  })
    .sort({ createdAt: 1 })
    .limit(12);
  const userMessage = await Message.create({
    conversation: conversation._id,
    role: "user",
    content,
  });

  let aiResult;
  try {
    const setting = await getSystemSetting();
    aiResult = await generateAssistantReply({
      userMessage: content,
      history: [...previousMessages, userMessage],
      systemPrompt: setting.systemPrompt,
    });
  } catch {
    throw new ApiError(
      502,
      "The assistant is temporarily unavailable. Please try again.",
    );
  }

  const assistantMessage = await Message.create({
    conversation: conversation._id,
    role: "assistant",
    content: aiResult.content,
    tokenUsage: aiResult.tokenUsage,
  });

  if (previousMessages.length === 0) {
    conversation.title = generateTitle(content);
  }
  conversation.updatedAt = new Date();
  await conversation.save();

  sendSuccess(
    res,
    {
      conversation,
      messages: [userMessage, assistantMessage],
      provider: aiResult.provider,
    },
    "Assistant response generated.",
    201,
  );
});
