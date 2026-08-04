import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ user: 1, pinned: -1, updatedAt: -1 });

conversationSchema.methods.toJSON = function toJSON() {
  const conversation = this.toObject();
  delete conversation.__v;
  return conversation;
};

export const Conversation = mongoose.model("Conversation", conversationSchema);
