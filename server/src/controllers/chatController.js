import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { findOwnedConversation } from "../middleware/ownership.js";
import { generateAssistantReply } from "../services/aiService.js";
import {
  attachmentContext,
  buildAttachmentMetadata,
} from "../services/attachmentService.js";
import { getSystemSetting } from "../services/systemSettingService.js";
import { generateTitle } from "../services/titleService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

function messageContentWithAttachmentContext(message, label) {
  const currentAttachmentContext = attachmentContext(message.attachments || []);
  return currentAttachmentContext
    ? `${message.content}\n\n${label}:\n${currentAttachmentContext}`
    : message.content;
}

export const sendChatMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;
  const attachments = await buildAttachmentMetadata(req.files || []);
  const attachmentNames = attachments
    .map((attachment) => attachment.originalName)
    .join(", ");
  const savedContent =
    content || `Attached ${attachments.length} file(s): ${attachmentNames}`;
  let conversation;

  if (conversationId) {
    conversation = await findOwnedConversation(req.user._id, conversationId);
  } else {
    conversation = await Conversation.create({
      user: req.user._id,
      title: generateTitle(savedContent),
    });
  }

  const previousMessages = await Message.find({
    conversation: conversation._id,
  })
    .sort({ createdAt: 1 })
    .limit(30);
  const userMessage = await Message.create({
    conversation: conversation._id,
    role: "user",
    content: savedContent,
    attachments,
  });

  const currentAttachmentContext = attachmentContext(attachments);
  const augmentedUserContent = currentAttachmentContext
    ? `${savedContent}\n\nUse the following uploaded attachment context when answering:\n${currentAttachmentContext}`
    : savedContent;

  const historyForAi = [
    ...previousMessages.map((message) => ({
      role: message.role,
      content: messageContentWithAttachmentContext(
        message,
        "Previous attachment context",
      ),
    })),
    { role: "user", content: augmentedUserContent },
  ];

  let aiResult;
  try {
    const setting = await getSystemSetting();
    aiResult = await generateAssistantReply({
      userMessage: augmentedUserContent,
      history: historyForAi,
      systemPrompt: setting.systemPrompt,
      attachments,
    });
  } catch (error) {
    console.error("AI provider error:", error.message);
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
    conversation.title = generateTitle(savedContent);
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

export const regenerateChatMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.body;
  const conversation = await findOwnedConversation(
    req.user._id,
    conversationId,
  );
  const existingMessages = await Message.find({
    conversation: conversation._id,
  }).sort({ createdAt: 1 });

  if (!existingMessages.length) {
    throw new ApiError(400, "This conversation has no messages to retry.");
  }

  const messagesForRetry = [...existingMessages];
  const lastMessage = messagesForRetry.at(-1);

  if (lastMessage?.role === "assistant") {
    messagesForRetry.pop();
    await lastMessage.deleteOne();
  }

  const latestUserMessage = [...messagesForRetry]
    .reverse()
    .find((message) => message.role === "user");

  if (!latestUserMessage) {
    throw new ApiError(400, "This conversation has no user message to retry.");
  }

  const historyForAi = messagesForRetry.slice(-30).map((message) => ({
    role: message.role,
    content: messageContentWithAttachmentContext(
      message,
      message === latestUserMessage
        ? "Use the following uploaded attachment context when answering"
        : "Previous attachment context",
    ),
  }));

  let aiResult;
  try {
    const setting = await getSystemSetting();
    aiResult = await generateAssistantReply({
      userMessage: messageContentWithAttachmentContext(
        latestUserMessage,
        "Use the following uploaded attachment context when answering",
      ),
      history: historyForAi,
      systemPrompt: setting.systemPrompt,
      attachments: latestUserMessage.attachments || [],
    });
  } catch (error) {
    console.error("AI provider error:", error.message);
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

  conversation.updatedAt = new Date();
  await conversation.save();

  sendSuccess(
    res,
    {
      conversation,
      messages: [assistantMessage],
      provider: aiResult.provider,
    },
    "Assistant response regenerated.",
  );
});
