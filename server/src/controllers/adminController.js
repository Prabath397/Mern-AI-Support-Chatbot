import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { SystemSetting } from "../models/SystemSetting.js";
import { User } from "../models/User.js";
import { getSystemSetting } from "../services/systemSettingService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

export const dashboard = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalConversations,
    totalMessages,
    recentUsers,
    activeUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Conversation.countDocuments(),
    Message.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5),
    User.countDocuments({ isActive: true }),
  ]);

  sendSuccess(res, {
    totals: {
      users: totalUsers,
      conversations: totalConversations,
      messages: totalMessages,
    },
    recentUsers,
    analytics: {
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      averageMessagesPerConversation: totalConversations
        ? Number((totalMessages / totalConversations).toFixed(2))
        : 0,
    },
  });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  sendSuccess(res, { users }, "Users retrieved.");
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id && req.body.isActive === false) {
    throw new ApiError(400, "Admins cannot deactivate their own account.");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true, runValidators: true },
  );

  if (!user) throw new ApiError(404, "User not found.");
  sendSuccess(res, { user }, "User status updated.");
});

export const getSettings = asyncHandler(async (_req, res) => {
  const setting = await getSystemSetting();
  sendSuccess(res, { setting }, "Settings retrieved.");
});

export const updateSettings = asyncHandler(async (req, res) => {
  const setting = await SystemSetting.findOneAndUpdate(
    {},
    { systemPrompt: req.body.systemPrompt, updatedBy: req.user._id },
    { upsert: true, new: true, runValidators: true },
  );
  sendSuccess(res, { setting }, "Settings updated.");
});
