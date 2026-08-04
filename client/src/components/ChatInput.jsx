import { useState } from "react";

export default function ChatInput({ disabled, onSend, onStop }) {
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
      <label className="sr-only" htmlFor="message">
        Message
      </label>
      <textarea
        id="message"
        value={content}
        disabled={disabled}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Message Nexia AI"
        rows={3}
      />
      <div className="composer-actions">
        <div className="attachment-field">
          <label
            className="icon-button attachment-button"
            htmlFor="attachments"
            title="Attach files"
          >
            +
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
        {disabled ? (
          <button
            className="button button-secondary send-button"
            type="button"
            onClick={onStop}
          >
            Stop
          </button>
        ) : (
          <button
            className="button button-primary send-button"
            type="submit"
            disabled={!content.trim() && !files.length}
          >
            Send
          </button>
        )}
      </div>
    </form>
  );
}
