import mongoose from "mongoose";

export const DEFAULT_SYSTEM_PROMPT =
  "You are Nexia AI, a helpful general-purpose AI assistant. Answer questions clearly, reason step by step when useful, ask clarifying questions when the request is ambiguous, and adapt your tone to the user's needs.";

export const LEGACY_SUPPORT_SYSTEM_PROMPT = [
  "You are ",
  "Support",
  "Sphere AI, a concise and helpful customer support assistant. Ask clarifying questions when needed and give practical next steps.",
].join("");

const systemSettingSchema = new mongoose.Schema(
  {
    systemPrompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
      default: DEFAULT_SYSTEM_PROMPT,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export const SystemSetting = mongoose.model(
  "SystemSetting",
  systemSettingSchema,
);
