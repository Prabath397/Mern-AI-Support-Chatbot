import { useState } from "react";

export default function ChatInput({ disabled, onSend }) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  function submit(event) {
    event.preventDefault();
    const trimmed = content.trim();
    if ((!trimmed && !files.length) || disabled) return;
    onSend(trimmed, files);
    setContent("");
    setFiles([]);
    event.currentTarget.reset();
  }

  function updateFiles(event) {
    setFiles(Array.from(event.target.files || []).slice(0, 3));
  }

  return (
    <form className="chat-input" onSubmit={submit}>
      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        value={content}
        disabled={disabled}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Ask anything..."
        rows={3}
      />
      <div className="attachment-field">
        <label className="button button-secondary" htmlFor="attachments">
          Attach files
        </label>
        <input
          id="attachments"
          type="file"
          multiple
          disabled={disabled}
          onChange={updateFiles}
          accept=".txt,.md,.csv,.json,.pdf,.docx,image/png,image/jpeg,image/webp"
        />
        {files.length ? (
          <div className="attachment-preview" aria-live="polite">
            {files.map((file) => (
              <span key={`${file.name}-${file.size}`}>{file.name}</span>
            ))}
          </div>
        ) : null}
      </div>
      <button
        className="button button-primary"
        type="submit"
        disabled={disabled || (!content.trim() && !files.length)}
      >
        Send
      </button>
    </form>
  );
}
