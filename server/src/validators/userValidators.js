import { body } from "express-validator";

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be 2-80 characters."),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required."),
];
