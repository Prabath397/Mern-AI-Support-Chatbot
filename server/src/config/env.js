import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  aiProvider: process.env.AI_PROVIDER || "mock",
  aiBaseUrl: process.env.AI_BASE_URL || "https://api.openai.com/v1",
  aiApiKey: process.env.AI_API_KEY || "",
  aiModel: process.env.AI_MODEL || "",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 8),
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

export function validateEnv() {
  if (env.isTest) return;

  const missing = requiredInProduction.filter((key) => !process.env[key]);
  const usingPlaceholders =
    env.mongoUri.includes("USERNAME:PASSWORD") ||
    env.jwtSecret === "replace_with_a_long_random_secret";

  if (env.isProduction && (missing.length || usingPlaceholders)) {
    throw new Error(
      `Missing or unsafe production environment values: ${missing.join(", ")}`,
    );
  }

  if (!env.mongoUri || env.mongoUri.includes("USERNAME:PASSWORD")) {
    console.warn(
      "MONGO_URI is using a placeholder. Add your MongoDB Atlas URI before using the live database.",
    );
  }
}
