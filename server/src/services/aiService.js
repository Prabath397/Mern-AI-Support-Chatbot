import fs from "fs/promises";
import { env } from "../config/env.js";

const MATH_FORMATTING_INSTRUCTIONS =
  "When writing mathematics, equations, formulas, or symbols, use LaTeX inside Markdown math delimiters. Use `$...$` for inline math and `$$...$$` for display equations. Use clear multi-line display equations for systems, matrices, fractions, roots, summations, integrals, limits, and boxed final answers.";
const MEMORY_INSTRUCTIONS =
  "Use the conversation history below as memory for this chat. Resolve short follow-up messages, corrections, dates, pronouns, and phrases like 'then', 'that', or 'what about it' by referring to earlier user messages in the same conversation. If a user appears to correct a typo or add missing detail, connect it to the previous question instead of treating it as a new unrelated request.";
const WEB_SEARCH_INSTRUCTIONS =
  "You have access to live web search. Use it for current events, recent information, prices, schedules, or anything that may have changed. Do not say you cannot browse when web search is available.";
const SECRET_PATTERNS = [/sk-[A-Za-z0-9_-]+/g, /Bearer\s+[A-Za-z0-9._-]+/gi];
const TOKEN_LIMIT_REASONS = new Set([
  "length",
  "max_tokens",
  "max_output_tokens",
]);
const GEMINI_TOKEN_LIMIT_REASONS = new Set(["MAX_TOKENS"]);
const MAX_CONTINUATION_ATTEMPTS = 2;
const CONTINUATION_PROMPT =
  "Continue the assistant answer exactly where it stopped. Do not restart, summarize, apologize, or repeat earlier content. Finish the remaining answer completely.";

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
  if (env.aiProvider === "openai" && env.aiWebSearch && isTimeoutError(error)) {
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
      "Check your AI environment variables, API key, model name, account plan, provider rate limits, and request timeout settings.",
    ].join("\n");
  }

  return mockReply(content);
}

function buildTokenUsage(data, fallbackContent, userMessage) {
  const usage = data.usage || data.usageMetadata || {};

  return {
    prompt:
      usage.prompt_tokens || usage.input_tokens || usage.promptTokenCount || 0,
    completion:
      usage.completion_tokens ||
      usage.output_tokens ||
      usage.candidatesTokenCount ||
      0,
    total:
      usage.total_tokens ||
      usage.total ||
      usage.totalTokenCount ||
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

function combineResponseParts(parts) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}

function buildHistoryTranscript(messages) {
  return messages
    .slice(-20)
    .map((message) => {
      const speaker = message.role === "assistant" ? "Assistant" : "User";
      return `${speaker}: ${message.content}`;
    })
    .join("\n");
}

function isResponsesTokenLimit(data) {
  const reason =
    data.incomplete_details?.reason || data.status_details?.reason || "";
  return data.status === "incomplete" && TOKEN_LIMIT_REASONS.has(reason);
}

function isChatCompletionTokenLimit(data) {
  const reason = data.choices?.[0]?.finish_reason || "";
  return TOKEN_LIMIT_REASONS.has(reason);
}

function isGeminiTokenLimit(data) {
  const reason = data.candidates?.[0]?.finishReason || "";
  return GEMINI_TOKEN_LIMIT_REASONS.has(reason);
}

function isTimeoutError(error) {
  return (
    error?.name === "TimeoutError" ||
    error?.name === "AbortError" ||
    /aborted|timeout/i.test(error?.message || "")
  );
}

function geminiOutputText(data) {
  return (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .filter((part) => part.text)
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function geminiModelPath(model) {
  const selectedModel = model || "gemini-3.1-flash-lite";
  return selectedModel.startsWith("models/")
    ? selectedModel
    : `models/${selectedModel}`;
}

function canSendGeminiInlineData(attachment) {
  return (
    attachment?.path &&
    (attachment.mimeType === "application/pdf" ||
      attachment.mimeType?.startsWith("image/") ||
      attachment.mimeType?.startsWith("audio/") ||
      attachment.mimeType?.startsWith("video/"))
  );
}

function canSendOpenAiImageData(attachment) {
  return attachment?.path && attachment.mimeType?.startsWith("image/");
}

async function buildGeminiAttachmentParts(attachments = []) {
  const supportedAttachments = attachments.filter(canSendGeminiInlineData);

  return Promise.all(
    supportedAttachments.map(async (attachment) => {
      const data = await fs.readFile(attachment.path, "base64");
      return {
        inlineData: {
          mimeType: attachment.mimeType,
          data,
        },
      };
    }),
  );
}

async function buildOpenAiImageParts(attachments = []) {
  const supportedAttachments = attachments.filter(canSendOpenAiImageData);

  return Promise.all(
    supportedAttachments.map(async (attachment) => {
      const data = await fs.readFile(attachment.path, "base64");
      return {
        type: "input_image",
        image_url: `data:${attachment.mimeType};base64,${data}`,
        detail: "auto",
      };
    }),
  );
}

async function buildOpenAiResponsesInput(messages, attachments = []) {
  const input = messages.slice(-8).map(({ role, content }) => ({
    role,
    content,
  }));
  const imageParts = await buildOpenAiImageParts(attachments);

  if (imageParts.length) {
    const latestUserMessage = [...input]
      .reverse()
      .find((message) => message.role === "user");

    if (latestUserMessage) {
      latestUserMessage.content = [
        {
          type: "input_text",
          text: latestUserMessage.content || "Please inspect the uploaded image.",
        },
        ...imageParts,
      ];
    }
  }

  return input;
}

async function fetchOpenAiResponses({
  messages,
  systemPrompt,
  attachments = [],
  includeWebSearch = false,
  timeoutMs,
}) {
  const baseUrl = env.aiBaseUrl.replace(/\/$/, "");
  const body = {
    model: env.aiModel || "gpt-5",
    instructions: `${systemPrompt}\n\n${MEMORY_INSTRUCTIONS}\n\n${MATH_FORMATTING_INSTRUCTIONS}${
      includeWebSearch ? `\n\n${WEB_SEARCH_INSTRUCTIONS}` : ""
    }`,
    input: await buildOpenAiResponsesInput(messages, attachments),
    max_output_tokens: env.aiMaxOutputTokens,
    truncation: "auto",
    store: false,
  };

  if (includeWebSearch) {
    body.tools = [{ type: "web_search", search_context_size: "low" }];
    body.tool_choice = "auto";
  }

  const response = await fetch(`${baseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.aiApiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI Responses request failed with ${response.status}: ${errorText.slice(0, 300)}`,
    );
  }

  return response.json();
}

async function callOpenAiResponsesProvider({
  messages,
  systemPrompt,
  userMessage,
  attachments = [],
}) {
  const parts = [];
  let requestMessages = messages;
  let data = null;

  for (let attempt = 0; attempt <= MAX_CONTINUATION_ATTEMPTS; attempt += 1) {
    data = await fetchOpenAiResponses({
      messages: requestMessages,
      systemPrompt,
      attachments: attempt === 0 ? attachments : [],
      includeWebSearch: true,
      timeoutMs: env.aiWebSearchTimeoutMs,
    });

    const content = responseOutputText(data);
    if (content) parts.push(content);
    if (!isResponsesTokenLimit(data)) break;

    requestMessages = [
      ...messages.slice(-6),
      { role: "assistant", content: combineResponseParts(parts) },
      { role: "user", content: CONTINUATION_PROMPT },
    ];
  }

  const content =
    combineResponseParts(parts) || "I could not generate a response.";

  return {
    content,
    tokenUsage: buildTokenUsage(data, content, userMessage),
    provider: `${env.aiProvider}-web-search`,
  };
}

async function callOpenAiResponsesTextProvider({
  messages,
  systemPrompt,
  userMessage,
  attachments = [],
}) {
  const parts = [];
  let requestMessages = messages;
  let data = null;

  for (let attempt = 0; attempt <= MAX_CONTINUATION_ATTEMPTS; attempt += 1) {
    data = await fetchOpenAiResponses({
      messages: requestMessages,
      systemPrompt,
      attachments: attempt === 0 ? attachments : [],
      timeoutMs: env.aiTextTimeoutMs,
    });

    const content = responseOutputText(data);
    if (content) parts.push(content);
    if (!isResponsesTokenLimit(data)) break;

    requestMessages = [
      ...messages.slice(-6),
      { role: "assistant", content: combineResponseParts(parts) },
      { role: "user", content: CONTINUATION_PROMPT },
    ];
  }

  const content =
    combineResponseParts(parts) || "I could not generate a response.";

  return {
    content,
    tokenUsage: buildTokenUsage(data, content, userMessage),
    provider: `${env.aiProvider}-text-fallback`,
  };
}

async function callOpenAiCompatibleProvider({ messages, systemPrompt }) {
  const baseUrl = env.aiBaseUrl.replace(/\/$/, "");
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content || "";
  const transcript = buildHistoryTranscript(messages);
  const baseMessages = [
    {
      role: "system",
      content: `${systemPrompt}\n\n${MEMORY_INSTRUCTIONS}\n\n${MATH_FORMATTING_INSTRUCTIONS}`,
    },
    {
      role: "user",
      content: `Conversation transcript:\n${transcript}\n\nAnswer the latest user message using the transcript as context.\nLatest user message: ${latestUserMessage}`,
    },
  ];
  const parts = [];
  let data = null;
  let requestMessages = baseMessages;

  for (let attempt = 0; attempt <= MAX_CONTINUATION_ATTEMPTS; attempt += 1) {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.aiApiKey}`,
      },
      body: JSON.stringify({
        model: env.aiModel || "gpt-4.1-mini",
        messages: requestMessages,
        temperature: 0.3,
        max_tokens: env.aiMaxOutputTokens,
      }),
      signal: AbortSignal.timeout(env.aiTextTimeoutMs),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `AI provider request failed with ${response.status}: ${errorText.slice(0, 300)}`,
      );
    }

    data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    if (content) parts.push(content);
    if (!isChatCompletionTokenLimit(data)) break;

    requestMessages = [
      ...baseMessages,
      { role: "assistant", content: combineResponseParts(parts) },
      { role: "user", content: CONTINUATION_PROMPT },
    ];
  }

  const content =
    combineResponseParts(parts) || "I could not generate a response.";
  return {
    content,
    tokenUsage: buildTokenUsage(
      data || {},
      content,
      messages.at(-1)?.content || "",
    ),
    provider: env.aiProvider,
  };
}

async function callGeminiProvider({
  messages,
  systemPrompt,
  attachments = [],
}) {
  const baseUrl = env.aiBaseUrl.replace(/\/$/, "");
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content || "";
  const transcript = buildHistoryTranscript(messages);
  const attachmentParts = await buildGeminiAttachmentParts(attachments);
  const systemInstruction = {
    parts: [
      {
        text: `${systemPrompt}\n\n${MEMORY_INSTRUCTIONS}\n\n${MATH_FORMATTING_INSTRUCTIONS}`,
      },
    ],
  };
  const baseContents = [
    {
      role: "user",
      parts: [
        {
          text: `Conversation transcript:\n${transcript}\n\nAnswer the latest user message using the transcript as context.\nLatest user message: ${latestUserMessage}`,
        },
        ...attachmentParts,
      ],
    },
  ];
  const parts = [];
  let data = null;
  let requestContents = baseContents;

  for (let attempt = 0; attempt <= MAX_CONTINUATION_ATTEMPTS; attempt += 1) {
    const response = await fetch(
      `${baseUrl}/${geminiModelPath(env.aiModel)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": env.aiApiKey,
        },
        body: JSON.stringify({
          systemInstruction,
          contents: requestContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: env.aiMaxOutputTokens,
          },
        }),
        signal: AbortSignal.timeout(env.aiTextTimeoutMs),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Gemini request failed with ${response.status}: ${errorText.slice(0, 300)}`,
      );
    }

    data = await response.json();
    const content = geminiOutputText(data);
    if (content) parts.push(content);
    if (!isGeminiTokenLimit(data)) break;

    requestContents = [
      ...baseContents,
      {
        role: "model",
        parts: [{ text: combineResponseParts(parts) }],
      },
      {
        role: "user",
        parts: [{ text: CONTINUATION_PROMPT }],
      },
    ];
  }

  const content =
    combineResponseParts(parts) || "I could not generate a response.";

  return {
    content,
    tokenUsage: buildTokenUsage(
      data || {},
      content,
      messages.at(-1)?.content || "",
    ),
    provider: env.aiProvider,
  };
}

export async function generateAssistantReply({
  userMessage,
  history,
  systemPrompt,
  attachments = [],
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
    if (
      env.aiProvider === "openai" &&
      (env.aiWebSearch || attachments.some(canSendOpenAiImageData))
    ) {
      try {
        if (env.aiWebSearch) {
          return await callOpenAiResponsesProvider({
            messages: history,
            systemPrompt,
            userMessage,
            attachments,
          });
        }

        return await callOpenAiResponsesTextProvider({
          messages: history,
          systemPrompt,
          userMessage,
          attachments,
        });
      } catch (webSearchError) {
        if (!isTimeoutError(webSearchError)) throw webSearchError;

        console.warn(
          "OpenAI web search timed out, retrying without web search:",
          webSearchError.message,
        );
        return await callOpenAiResponsesTextProvider({
          messages: history,
          systemPrompt: `${systemPrompt}\n\nLive web search was attempted but timed out. Answer from general knowledge and clearly say if current information may need checking.`,
          userMessage,
          attachments,
        });
      }
    }

    if (env.aiProvider === "gemini") {
      return await callGeminiProvider({
        messages: history,
        systemPrompt,
        attachments,
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
