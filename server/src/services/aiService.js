import { env } from "../config/env.js";

const MATH_FORMATTING_INSTRUCTIONS =
  "When writing mathematics, equations, formulas, or symbols, use LaTeX inside Markdown math delimiters. Use `$...$` for inline math and `$$...$$` for display equations. Use clear multi-line display equations for systems, matrices, fractions, roots, summations, integrals, limits, and boxed final answers.";
const WEB_SEARCH_INSTRUCTIONS =
  "You have access to live web search. Use it for current events, recent information, prices, schedules, or anything that may have changed. Do not say you cannot browse when web search is available.";
const AI_TIMEOUT_MS = 24000;
const SECRET_PATTERNS = [
  /sk-[A-Za-z0-9_-]+/g,
  /shuttle-[A-Za-z0-9_-]+/g,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
];

function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}

function mockReply(content) {
  return [
    "I'm Nexia AI, your general-purpose chat assistant.",
    "",
    `You asked: "${content}"`,
    "",
    "I can help explain topics, brainstorm ideas, draft text, summarize files, and work through code or study questions. Tell me what you want to do next, and I will keep it clear and practical.",
  ].join("\n");
}

function safeErrorMessage(error) {
  return SECRET_PATTERNS.reduce(
    (message, pattern) => message.replace(pattern, "[redacted]"),
    error?.message || "Unknown provider error.",
  ).slice(0, 500);
}

function providerFallbackReply(content, error) {
  const isTimeout =
    error?.name === "TimeoutError" ||
    /aborted|timeout/i.test(error?.message || "");

  if (env.aiProvider === "openai" && env.aiWebSearch && isTimeout) {
    return [
      "I tried to search the web, but the live search took too long for this deployment.",
      "",
      `You asked: "${content}"`,
      "",
      "Please try the same question again in a new message, or ask for a narrower search such as one country, topic, or source type.",
    ].join("\n");
  }

  if (env.aiProvider !== "mock") {
    return [
      "Nexia AI is connected to an external AI provider, but that provider request failed.",
      "",
      `Provider: ${env.aiProvider}`,
      `Model: ${env.aiModel || "not set"}`,
      `Error: ${safeErrorMessage(error)}`,
      "",
      "Check your Netlify AI environment variables, API key, model name, account plan, and provider rate limits.",
    ].join("\n");
  }

  return mockReply(content);
}

function buildTokenUsage(data, fallbackContent, userMessage) {
  return {
    prompt: data.usage?.prompt_tokens || data.usage?.input_tokens || 0,
    completion:
      data.usage?.completion_tokens || data.usage?.output_tokens || 0,
    total:
      data.usage?.total_tokens ||
      data.usage?.total ||
      estimateTokens(fallbackContent) + estimateTokens(userMessage),
  };
}

function responseOutputText(data) {
  if (data.output_text) return data.output_text;

  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((part) => part.type === "output_text" && part.text)
    .map((part) => part.text)
    .join("\n")
    .trim();
}

async function callOpenAiResponsesProvider({ messages, systemPrompt, userMessage }) {
  const baseUrl = env.aiBaseUrl.replace(/\/$/, "");
  const signal = AbortSignal.timeout(AI_TIMEOUT_MS);
  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.aiApiKey}`,
    },
    body: JSON.stringify({
      model: env.aiModel || "gpt-5",
      instructions: `${systemPrompt}\n\n${MATH_FORMATTING_INSTRUCTIONS}\n\n${WEB_SEARCH_INSTRUCTIONS}`,
      input: messages.slice(-6).map(({ role, content }) => ({ role, content })),
      tools: [{ type: "web_search", search_context_size: "low" }],
      tool_choice: "required",
      max_output_tokens: 700,
      truncation: "auto",
      store: false,
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI Responses request failed with ${response.status}: ${errorText.slice(0, 300)}`,
    );
  }

  const data = await response.json();
  const content = responseOutputText(data) || "I could not generate a response.";

  return {
    content,
    tokenUsage: buildTokenUsage(data, content, userMessage),
    provider: `${env.aiProvider}-web-search`,
  };
}

async function callOpenAiCompatibleProvider({ messages, systemPrompt }) {
  const baseUrl = env.aiBaseUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.aiApiKey}`,
    },
    body: JSON.stringify({
      model: env.aiModel || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\n${MATH_FORMATTING_INSTRUCTIONS}`,
        },
        ...messages.map(({ role, content }) => ({ role, content })),
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `AI provider request failed with ${response.status}: ${errorText.slice(0, 300)}`,
    );
  }

  const data = await response.json();
  const content =
    data.choices?.[0]?.message?.content || "I could not generate a response.";
  return {
    content,
    tokenUsage: buildTokenUsage(data, content, messages.at(-1)?.content || ""),
    provider: env.aiProvider,
  };
}

export async function generateAssistantReply({
  userMessage,
  history,
  systemPrompt,
}) {
  const useMock = env.aiProvider === "mock" || !env.aiApiKey;
  if (useMock) {
    const content = mockReply(userMessage);
    return {
      content,
      tokenUsage: {
        prompt: estimateTokens(
          `${systemPrompt}\n${history.map((item) => item.content).join("\n")}`,
        ),
        completion: estimateTokens(content),
        total: estimateTokens(content) + estimateTokens(userMessage),
      },
      provider: "mock",
    };
  }

  try {
    if (env.aiProvider === "openai" && env.aiWebSearch) {
      return await callOpenAiResponsesProvider({
        messages: history,
        systemPrompt,
        userMessage,
      });
    }

    return await callOpenAiCompatibleProvider({
      messages: history,
      systemPrompt,
    });
  } catch (error) {
    console.error("AI provider request failed, using fallback:", error.message);
    const content = providerFallbackReply(userMessage, error);
    return {
      content,
      tokenUsage: {
        prompt: estimateTokens(
          `${systemPrompt}\n${history.map((item) => item.content).join("\n")}`,
        ),
        completion: estimateTokens(content),
        total: estimateTokens(content) + estimateTokens(userMessage),
      },
      provider: `${env.aiProvider}-fallback`,
    };
  }
}
