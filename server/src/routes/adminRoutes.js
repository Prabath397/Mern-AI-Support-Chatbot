import { Router } from "express";
import {
  dashboard,
  getSettings,
  listUsers,
  updateSettings,
  updateUserStatus,
} from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import {
  settingsValidator,
  userStatusValidator,
} from "../validators/adminValidators.js";

export const adminRouter = Router();

adminRouter.use(protect, requireAdmin);
adminRouter.get("/dashboard", dashboard);
adminRouter.get("/users", listUsers);
adminRouter.patch(
  "/users/:id/status",
  userStatusValidator,
  validateRequest,
  updateUserStatus,
);
adminRouter.get("/settings", getSettings);
adminRouter.put(
  "/settings",
  settingsValidator,
  validateRequest,
  updateSettings,
);
