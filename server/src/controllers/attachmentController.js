import fs from "fs";
import path from "path";
import { Message } from "../models/Message.js";
import { findOwnedConversation } from "../middleware/ownership.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const downloadAttachment = asyncHandler(async (req, res) => {
  const { messageId, attachmentId } = req.params;
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found.");

  await findOwnedConversation(req.user._id, message.conversation);

  const attachment = message.attachments.id(attachmentId);
  if (!attachment) throw new ApiError(404, "Attachment not found.");

  const filePath = path.resolve(attachment.path);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, "Attachment file is no longer available.");
  }

  res.download(filePath, attachment.originalName);
});
