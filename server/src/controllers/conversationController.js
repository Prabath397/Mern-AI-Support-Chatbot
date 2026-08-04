import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { findOwnedConversation } from "../middleware/ownership.js";
import { deleteAttachmentFiles } from "../services/attachmentService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const createConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.create({
    user: req.user._id,
    title: req.body.title || "New chat",
  });

  sendSuccess(res, { conversation }, "Conversation created.", 201);
});

export const listConversations = asyncHandler(async (req, res) => {
  const query = (req.query.q || "").trim();
  const filter = { user: req.user._id };

  if (query) {
    const pattern = new RegExp(escapeRegExp(query), "i");
    const matchingConversationIds = await Message.distinct("conversation", {
      content: pattern,
      conversation: {
        $in: await Conversation.distinct("_id", { user: req.user._id }),
      },
    });

    filter.$or = [
      { title: pattern },
      { _id: { $in: matchingConversationIds } },
    ];
  }

  const conversations = await Conversation.find(filter).sort({
    pinned: -1,
    updatedAt: -1,
  });
  sendSuccess(
    res,
    { conversations, searchApplied: Boolean(query) },
    "Conversations retrieved.",
  );
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

export const updateConversationPin = asyncHandler(async (req, res) => {
  const conversation = await findOwnedConversation(req.user._id, req.params.id);
  conversation.pinned = Boolean(req.body.pinned);
  await conversation.save();
  sendSuccess(
    res,
    { conversation },
    conversation.pinned ? "Conversation pinned." : "Conversation unpinned.",
  );
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await findOwnedConversation(req.user._id, req.params.id);
  const messages = await Message.find({ conversation: conversation._id });
  await deleteAttachmentFiles(
    messages.flatMap((message) => message.attachments || []),
  );
  await Message.deleteMany({ conversation: conversation._id });
  await conversation.deleteOne();
  sendSuccess(res, null, "Conversation deleted.");
});
