import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    systemPrompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
      default:
        "You are SupportSphere AI, a concise and helpful customer support assistant. Ask clarifying questions when needed and give practical next steps.",
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
