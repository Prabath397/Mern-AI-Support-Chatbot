import { env } from "../config/env.js";

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
        { role: "system", content: systemPrompt },
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
  return {
    content:
      data.choices?.[0]?.message?.content || "I could not generate a response.",
    tokenUsage: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
      total: data.usage?.total_tokens || 0,
    },
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
    return await callOpenAiCompatibleProvider({ messages: history, systemPrompt });
  } catch (error) {
    console.error("AI provider request failed, using fallback:", error.message);
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
      provider: `${env.aiProvider}-fallback`,
    };
  }
}
