import { useState } from "react";

export default function ChatInput({ disabled, onSend }) {
  const [content, setContent] = useState("");

  function submit(event) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setContent("");
  }

  return (
    <form className="chat-input" onSubmit={submit}>
      <label htmlFor="message">Message</label>
      <textarea
        id="message"
        value={content}
        disabled={disabled}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Describe the customer's issue..."
        rows={3}
      />
      <button
        className="button button-primary"
        type="submit"
        disabled={disabled || !content.trim()}
      >
        Send
      </button>
    </form>
  );
}
