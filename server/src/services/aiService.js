import { env } from "../config/env.js";

function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}

function mockReply(content) {
  return [
    "I'm running in mock AI mode, so no paid provider key is required.",
    "",
    `You asked: "${content}"`,
    "",
    "Here is a support-ready response:",
    "- I understand the issue and would confirm the exact symptoms.",
    "- I would check account, billing, or product context before taking action.",
    "- I would provide a clear next step and escalation path if needed.",
  ].join("\n");
}

async function callOpenAiCompatibleProvider({ messages, systemPrompt }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    throw new Error("AI provider request failed.");
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

  return callOpenAiCompatibleProvider({ messages: history, systemPrompt });
}
