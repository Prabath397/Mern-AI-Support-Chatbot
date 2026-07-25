import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/responses.js";
import { signToken } from "../utils/token.js";

function authPayload(user) {
  return { user: user.toJSON(), token: signToken(user) };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email is already registered.");

  const user = await User.create({ name, email, password });
  sendSuccess(res, authPayload(user), "Account created successfully.", 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated.");
  }

  sendSuccess(res, authPayload(user), "Signed in successfully.");
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user }, "Current user retrieved.");
});
