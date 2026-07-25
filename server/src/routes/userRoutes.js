import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { updateProfileValidator } from "../validators/userValidators.js";

export const userRouter = Router();

userRouter.use(protect);
userRouter.get("/profile", getProfile);
userRouter.put(
  "/profile",
  updateProfileValidator,
  validateRequest,
  updateProfile,
);
