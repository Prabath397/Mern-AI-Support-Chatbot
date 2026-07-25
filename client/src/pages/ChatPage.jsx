import { useEffect, useState } from "react";
import ChatInput from "../components/ChatInput.jsx";
import ChatMessage from "../components/ChatMessage.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Modal from "../components/Modal.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { chatService } from "../services/chatService.js";
import { friendlyError } from "../utils/format.js";

const suggestions = [
  "Draft a response for a delayed delivery complaint.",
  "Explain how to reset an account password.",
  "Create a calm refund policy response.",
];

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    setLoading(true);
    setError("");
    try {
      const res = await chatService.listConversations();
      const items = res.data.data.conversations;
      setConversations(items);
      if (items[0]) await selectConversation(items[0]._id);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }

  async function selectConversation(id) {
    setActiveId(id);
    const res = await chatService.getMessages(id);
    setMessages(res.data.data.messages);
  }

  async function startNew() {
    setActiveId("");
    setMessages([]);
  }

  async function send(content) {
    setSending(true);
    setError("");
    try {
      const res = await chatService.sendMessage({
        conversationId: activeId || undefined,
        content,
      });
      const { conversation, messages: newMessages } = res.data.data;
      setActiveId(conversation._id);
      setMessages((current) => [...current, ...newMessages]);
      setConversations((current) => {
        const withoutCurrent = current.filter(
          (item) => item._id !== conversation._id,
        );
        return [conversation, ...withoutCurrent];
      });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSending(false);
    }
  }

  async function renameConversation(event) {
    event.preventDefault();
    const res = await chatService.renameConversation(
      renameTarget._id,
      newTitle,
    );
    const updated = res.data.data.conversation;
    setConversations((current) =>
      current.map((item) => (item._id === updated._id ? updated : item)),
    );
    setRenameTarget(null);
  }

  async function deleteConversation() {
    await chatService.deleteConversation(deleteTarget._id);
    setConversations((current) =>
      current.filter((item) => item._id !== deleteTarget._id),
    );
    if (activeId === deleteTarget._id) {
      setActiveId("");
      setMessages([]);
    }
    setDeleteTarget(null);
  }

  function openRename(conversation) {
    setRenameTarget(conversation);
    setNewTitle(conversation.title);
  }

  return (
    <div className="chat-layout">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNew={startNew}
        onSelect={selectConversation}
        onRename={openRename}
        onDelete={setDeleteTarget}
      />
      <section className="chat-panel" aria-label="Chat workspace">
        <div className="chat-header">
          <div>
            <h1>
              {activeId
                ? conversations.find((item) => item._id === activeId)?.title
                : "New support chat"}
            </h1>
            <p>
              Backend AI provider: mock fallback unless configured on the
              server.
            </p>
          </div>
        </div>
        <ErrorAlert message={error} />
        <div className="messages" aria-live="polite">
          {loading ? (
            <LoadingSpinner />
          ) : messages.length ? (
            messages.map((message) => (
              <ChatMessage
                key={message._id || `${message.role}-${message.createdAt}`}
                message={message}
              />
            ))
          ) : (
            <EmptyState
              title="Ask a support question"
              message="Use a suggested prompt or write your own customer scenario."
            >
              <div className="suggestions">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => send(item)}
                    disabled={sending}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </EmptyState>
          )}
          {sending ? <LoadingSpinner label="Assistant is responding" /> : null}
        </div>
        <ChatInput disabled={sending} onSend={send} />
      </section>

      {renameTarget ? (
        <Modal
          title="Rename conversation"
          onClose={() => setRenameTarget(null)}
        >
          <form onSubmit={renameConversation}>
            <label htmlFor="conversation-title">Title</label>
            <input
              id="conversation-title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              required
            />
            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                Save
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <ConfirmDialog
          title="Delete conversation"
          message={`Delete "${deleteTarget.title}" and all saved messages?`}
          confirmLabel="Delete"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={deleteConversation}
        />
      ) : null}
    </div>
  );
}
