import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import { appName } from "../assets/brand.js";
import { chatService } from "../services/chatService.js";

function CodeBlock({ className, children, ...props }) {
  const language = /language-(\w+)/.exec(className || "")?.[1];
  const code = String(children).replace(/\n$/, "");
  const highlighted =
    language && hljs.getLanguage(language)
      ? hljs.highlight(code, { language }).value
      : hljs.highlightAuto(code).value;

  return (
    <code
      className={className}
      dangerouslySetInnerHTML={{ __html: highlighted }}
      {...props}
    />
  );
}

function normalizeMathMarkdown(content) {
  return (content || "")
    .replace(/\\\[((?:.|\n)*?)\\\]/g, (_match, math) => {
      return `\n\n$$\n${math.trim()}\n$$\n\n`;
    })
    .replace(/\\\(((?:.|\n)*?)\\\)/g, (_match, math) => `$${math.trim()}$`)
    .replace(
      /(^|\n)\s*\[\s*([^\]\n]*(?:\\begin|\\frac|\\boxed|\\sqrt|\\sum|\\int|\\Longrightarrow|\\rightarrow)[\s\S]*?)\s*\](?=\n|$)/g,
      (_match, prefix, math) => `${prefix}\n$$\n${math.trim()}\n$$\n`,
    );
}

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === "assistant";

  async function copy() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function downloadAttachment(attachment) {
    const response = await chatService.downloadAttachment(
      message._id,
      attachment._id,
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.originalName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <article className={`chat-message ${message.role}`}>
      <div className="message-meta">
        <strong>{isAssistant ? appName : "You"}</strong>
        {isAssistant ? (
          <button type="button" onClick={copy} className="copy-button">
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </div>
      <div className="markdown-body">
        {isAssistant ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
            components={{ code: CodeBlock }}
          >
            {normalizeMathMarkdown(message.content)}
          </ReactMarkdown>
        ) : (
          <p>{message.content}</p>
        )}
      </div>
      {message.attachments?.length ? (
        <div className="attachment-list" aria-label="Message attachments">
          {message.attachments.map((attachment) => (
            <button
              key={attachment._id}
              type="button"
              onClick={() => downloadAttachment(attachment)}
              className="attachment-chip"
              title={
                attachment.hasExtractedText
                  ? "Text was extracted for AI context"
                  : "Download attachment"
              }
            >
              {attachment.originalName}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
