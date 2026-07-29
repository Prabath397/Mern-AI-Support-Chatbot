import { afterEach, describe, expect, it, vi } from "vitest";

async function loadEnv(overrides = {}) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("AI_PROVIDER", "");
  vi.stubEnv("AI_BASE_URL", "");
  vi.stubEnv("AI_API_KEY", "");
  vi.stubEnv("DEEPSEEK_API_KEY", "");
  vi.stubEnv("AI_MODEL", "");

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
});
