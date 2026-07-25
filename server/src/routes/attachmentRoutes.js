import { Router } from "express";
import { downloadAttachment } from "../controllers/attachmentController.js";
import { protect } from "../middleware/auth.js";

export const attachmentRouter = Router();

attachmentRouter.get(
  "/messages/:messageId/attachments/:attachmentId",
  protect,
  downloadAttachment,
);
