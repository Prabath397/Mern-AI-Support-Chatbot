import { afterEach, describe, expect, it, vi } from "vitest";

async function loadEnv(overrides = {}) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("AI_PROVIDER", "");
  vi.stubEnv("AI_BASE_URL", "");
  vi.stubEnv("AI_API_KEY", "");
  vi.stubEnv("DEEPSEEK_API_KEY", "");
  vi.stubEnv("AI_MODEL", "");
  vi.stubEnv("AI_WEB_SEARCH_TIMEOUT_MS", "");
  vi.stubEnv("AI_TEXT_TIMEOUT_MS", "");
  vi.stubEnv("AI_MAX_OUTPUT_TOKENS", "");

  Object.entries(overrides).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });

  return import("../src/config/env.js");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("AI provider environment defaults", () => {
  it("uses DeepSeek defaults when the DeepSeek provider is selected", async () => {
    const { env } = await loadEnv({
      AI_PROVIDER: "deepseek",
      DEEPSEEK_API_KEY: "deepseek-test-key",
    });

    expect(env.aiProvider).toBe("deepseek");
    expect(env.aiBaseUrl).toBe("https://api.deepseek.com");
    expect(env.aiApiKey).toBe("deepseek-test-key");
    expect(env.aiModel).toBe("deepseek-v4-flash");
  });

  it("lets generic AI settings override provider presets", async () => {
    const { env } = await loadEnv({
      AI_PROVIDER: "deepseek",
      AI_BASE_URL: "https://custom.example/v1",
      AI_API_KEY: "generic-key",
      AI_MODEL: "custom-model",
    });

    expect(env.aiBaseUrl).toBe("https://custom.example/v1");
    expect(env.aiApiKey).toBe("generic-key");
    expect(env.aiModel).toBe("custom-model");
  });

  it("uses serverless-friendly AI timeout defaults", async () => {
    const { env } = await loadEnv();

    expect(env.aiWebSearchTimeoutMs).toBe(10000);
    expect(env.aiTextTimeoutMs).toBe(8000);
    expect(env.aiMaxOutputTokens).toBe(650);
  });

  it("lets AI timeout and output settings be overridden", async () => {
    const { env } = await loadEnv({
      AI_WEB_SEARCH_TIMEOUT_MS: "7000",
      AI_TEXT_TIMEOUT_MS: "5000",
      AI_MAX_OUTPUT_TOKENS: "400",
    });

    expect(env.aiWebSearchTimeoutMs).toBe(7000);
    expect(env.aiTextTimeoutMs).toBe(5000);
    expect(env.aiMaxOutputTokens).toBe(400);
  });
});
