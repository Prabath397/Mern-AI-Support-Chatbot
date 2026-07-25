import { Router } from "express";
import { login, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validateRequest } from "../middleware/errorHandler.js";
import { loginLimiter } from "../middleware/rateLimiters.js";
import {
  loginValidator,
  registerValidator,
} from "../validators/authValidators.js";

export const authRouter = Router();

authRouter.post("/register", registerValidator, validateRequest, register);
authRouter.post("/login", loginLimiter, loginValidator, validateRequest, login);
authRouter.get("/me", protect, me);
