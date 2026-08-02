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
    ...previousMessages.map((message) => {
      const previousAttachmentContext = attachmentContext(
        message.attachments || [],
      );
      return {
        role: message.role,
        content: previousAttachmentContext
          ? `${message.content}\n\nPrevious attachment context:\n${previousAttachmentContext}`
          : message.content,
      };
    }),
    { role: "user", content: augmentedUserContent },
  ];

  let aiResult;
  try {
    const setting = await getSystemSetting();
    aiResult = await generateAssistantReply({
      userMessage: augmentedUserContent,
      history: historyForAi,
      systemPrompt: setting.systemPrompt,
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
