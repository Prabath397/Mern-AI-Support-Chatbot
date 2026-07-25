import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be 2-80 characters."),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Za-z]/)
    .matches(/[0-9]/)
    .withMessage("Password must include letters and numbers."),
];

export const loginValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];
