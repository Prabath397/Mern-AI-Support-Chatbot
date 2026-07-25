import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";

export const getProfile = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user }, "Profile retrieved.");
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.email) {
    const existing = await User.findOne({
      email: req.body.email,
      _id: { $ne: req.user._id },
    });
    if (existing) throw new ApiError(409, "Email is already in use.");
    updates.email = req.body.email;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, { user }, "Profile updated.");
});
