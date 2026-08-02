const PUTER_SCRIPT_URL = "https://js.puter.com/v2/";

let scriptPromise;

function loadPuterScript() {
  if (window.puter?.ai?.chat) return Promise.resolve(window.puter);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(
        `script[src="${PUTER_SCRIPT_URL}"]`,
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(window.puter));
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Puter.js.")),
        );
        return;
      }

      const script = document.createElement("script");
      script.src = PUTER_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.puter);
      script.onerror = () => reject(new Error("Failed to load Puter.js."));
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

function responseText(response) {
  if (typeof response === "string") return response;
  if (response?.text) return response.text;
  if (response?.message?.content) return response.message.content;
  return String(response || "");
}

export async function generatePuterReply({ content, history = [] }) {
  const puter = await loadPuterScript();
  const model = import.meta.env.VITE_PUTER_MODEL || "gpt-5.5";
  const useWebSearch = import.meta.env.VITE_PUTER_WEB_SEARCH === "true";
  const prompt = [
    "You are Nexia AI, a helpful general-purpose AI assistant.",
    "Use Markdown. For math, use LaTeX with $...$ for inline math and $$...$$ for display equations.",
    "",
    ...history.slice(-8).map((message) => {
      const speaker = message.role === "assistant" ? "Nexia AI" : "User";
      return `${speaker}: ${message.content}`;
    }),
    `User: ${content}`,
  ].join("\n");

  const response = await puter.ai.chat(prompt, {
    model,
    tools: useWebSearch ? [{ type: "web_search" }] : undefined,
  });

  return {
    content: responseText(response),
    provider: "puter",
  };
}
