import dotenv from "dotenv";

dotenv.config();

const requiredInProduction = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];
const aiProvider = (process.env.AI_PROVIDER || "mock").trim().toLowerCase();
const aiProviderDefaults = {
  mock: {
    baseUrl: "https://api.openai.com/v1",
    model: "",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1-mini",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: "",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-v4-flash",
  },
};

const selectedAiDefaults =
  aiProviderDefaults[aiProvider] || aiProviderDefaults.openai;

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl:
    process.env.CLIENT_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    "http://localhost:5173",
  aiProvider,
  aiBaseUrl: process.env.AI_BASE_URL || selectedAiDefaults.baseUrl,
  aiApiKey:
    process.env.AI_API_KEY ||
    (aiProvider === "deepseek" ? process.env.DEEPSEEK_API_KEY : "") ||
    "",
  aiModel: process.env.AI_MODEL || selectedAiDefaults.model,
  aiWebSearch: process.env.AI_WEB_SEARCH === "true",
  uploadDir:
    process.env.UPLOAD_DIR ||
    (process.env.NETLIFY ? "/tmp/nexia-ai-uploads" : "uploads"),
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
