import { afterEach, describe, expect, it, vi } from "vitest";

function jsonResponse(data) {
  return {
    ok: true,
    json: () => Promise.resolve(data),
  };
}

async function loadAiService(overrides = {}) {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("AI_PROVIDER", "groq");
  vi.stubEnv("AI_BASE_URL", "https://provider.example/v1");
  vi.stubEnv("AI_API_KEY", "test-key");
  vi.stubEnv("AI_MODEL", "test-model");
  vi.stubEnv("AI_WEB_SEARCH", "false");
  vi.stubEnv("AI_WEB_SEARCH_TIMEOUT_MS", "1000");
  vi.stubEnv("AI_TEXT_TIMEOUT_MS", "1000");
  vi.stubEnv("AI_MAX_OUTPUT_TOKENS", "8");

  Object.entries(overrides).forEach(([key, value]) => {
    vi.stubEnv(key, value);
  });

  return import("../src/services/aiService.js");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("AI service continuations", () => {
  it("continues OpenAI-compatible chat completions that hit the token limit", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [
            { message: { content: "First part" }, finish_reason: "length" },
          ],
          usage: { prompt_tokens: 12, completion_tokens: 8, total_tokens: 20 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          choices: [
            { message: { content: "second part" }, finish_reason: "stop" },
          ],
          usage: { prompt_tokens: 14, completion_tokens: 5, total_tokens: 19 },
        }),
      );
    vi.stubGlobal("fetch", fetch);

    const { generateAssistantReply } = await loadAiService();
    const result = await generateAssistantReply({
      userMessage: "Design a study plan",
      history: [{ role: "user", content: "Design a study plan" }],
      systemPrompt: "You are helpful.",
    });

    expect(result.content).toBe("First part\n\nsecond part");
    expect(fetch).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(fetch.mock.calls[1][1].body);
    expect(secondBody.messages.at(-2)).toMatchObject({
      role: "assistant",
      content: "First part",
    });
    expect(secondBody.messages.at(-1).content).toContain("Continue");
  });

  it("continues OpenAI Responses API replies that hit max output tokens", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          output_text: "First part",
          status: "incomplete",
          incomplete_details: { reason: "max_tokens" },
          usage: { input_tokens: 12, output_tokens: 8, total_tokens: 20 },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          output_text: "second part",
          status: "completed",
          incomplete_details: null,
          usage: { input_tokens: 14, output_tokens: 5, total_tokens: 19 },
        }),
      );
    vi.stubGlobal("fetch", fetch);

    const { generateAssistantReply } = await loadAiService({
      AI_PROVIDER: "openai",
      AI_WEB_SEARCH: "true",
    });
    const result = await generateAssistantReply({
      userMessage: "Design a study plan",
      history: [{ role: "user", content: "Design a study plan" }],
      systemPrompt: "You are helpful.",
    });

    expect(result.content).toBe("First part\n\nsecond part");
    expect(fetch).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(fetch.mock.calls[1][1].body);
    expect(secondBody.input.at(-2)).toMatchObject({
      role: "assistant",
      content: "First part",
    });
    expect(secondBody.input.at(-1).content).toContain("Continue");
  });

  it("calls Gemini generateContent with system instructions and history", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        candidates: [
          {
            content: {
              parts: [{ text: "Gemini reply" }],
            },
            finishReason: "STOP",
          },
        ],
        usageMetadata: {
          promptTokenCount: 10,
          candidatesTokenCount: 4,
          totalTokenCount: 14,
        },
      }),
    );
    vi.stubGlobal("fetch", fetch);

    const { generateAssistantReply } = await loadAiService({
      AI_PROVIDER: "gemini",
      AI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
      AI_MODEL: "gemini-test-model",
    });
    const result = await generateAssistantReply({
      userMessage: "Explain APIs",
      history: [{ role: "user", content: "Explain APIs" }],
      systemPrompt: "You are helpful.",
    });

    expect(result).toMatchObject({
      content: "Gemini reply",
      provider: "gemini",
      tokenUsage: { prompt: 10, completion: 4, total: 14 },
    });
    expect(fetch).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-test-model:generateContent",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "x-goog-api-key": "test-key",
        }),
      }),
    );

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.systemInstruction.parts[0].text).toContain("You are helpful.");
    expect(body.contents[0]).toMatchObject({
      role: "user",
      parts: [
        expect.objectContaining({
          text: expect.stringContaining("Explain APIs"),
        }),
      ],
    });
    expect(body.generationConfig.maxOutputTokens).toBe(8);
  });

  it("continues Gemini replies that hit max output tokens", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          candidates: [
            {
              content: { parts: [{ text: "First part" }] },
              finishReason: "MAX_TOKENS",
            },
          ],
          usageMetadata: {
            promptTokenCount: 12,
            candidatesTokenCount: 8,
            totalTokenCount: 20,
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          candidates: [
            {
              content: { parts: [{ text: "second part" }] },
              finishReason: "STOP",
            },
          ],
          usageMetadata: {
            promptTokenCount: 14,
            candidatesTokenCount: 5,
            totalTokenCount: 19,
          },
        }),
      );
    vi.stubGlobal("fetch", fetch);

    const { generateAssistantReply } = await loadAiService({
      AI_PROVIDER: "gemini",
      AI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
    });
    const result = await generateAssistantReply({
      userMessage: "Design a study plan",
      history: [{ role: "user", content: "Design a study plan" }],
      systemPrompt: "You are helpful.",
    });

    expect(result.content).toBe("First part\n\nsecond part");
    expect(fetch).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(fetch.mock.calls[1][1].body);
    expect(secondBody.contents.at(-2)).toMatchObject({
      role: "model",
      parts: [{ text: "First part" }],
    });
    expect(secondBody.contents.at(-1).parts[0].text).toContain("Continue");
  });
});
