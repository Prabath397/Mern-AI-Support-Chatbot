import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  "Design a study plan for this week",
  "Explain a hard topic simply",
  "Draft a polished professional email",
];

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const messagesRef = useRef(null);
  const activeRequestRef = useRef(null);

  useEffect(() => {
    loadConversations("", true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadConversations(searchQuery, false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useLayoutEffect(() => {
    const messageList = messagesRef.current;
    if (!messageList) return;

    requestAnimationFrame(() => {
      messageList.scrollTo({
        top: messageList.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [activeId, messages, sending]);

  function sortConversations(items) {
    return [...items].sort((first, second) => {
      if (first.pinned !== second.pinned) return first.pinned ? -1 : 1;
      return new Date(second.updatedAt) - new Date(first.updatedAt);
    });
  }

  function isCanceled(error) {
    return error?.code === "ERR_CANCELED" || error?.name === "CanceledError";
  }

  async function loadConversations(query = searchQuery, selectFirst = false) {
    setLoading(true);
    setError("");
    try {
      const res = await chatService.listConversations(query);
      const normalizedQuery = query.trim().toLowerCase();
      const searchWasApplied = res.data.data.searchApplied;
      const sourceItems = res.data.data.conversations;
      const items =
        normalizedQuery && !searchWasApplied
          ? sourceItems.filter((conversation) =>
              conversation.title.toLowerCase().includes(normalizedQuery),
            )
          : sourceItems;

      const sortedItems = sortConversations(items);
      setConversations(sortedItems);
      if (selectFirst && sortedItems[0]) {
        await selectConversation(sortedItems[0]._id);
      }
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

  async function send(content, files = []) {
    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    const optimisticId = `pending-${Date.now()}`;
    const optimisticContent =
      content ||
      `Attached ${files.length} file(s): ${files.map((file) => file.name).join(", ")}`;

    setSending(true);
    setError("");
    setMessages((current) => [
      ...current,
      {
        _id: optimisticId,
        role: "user",
        content: optimisticContent,
        createdAt: new Date().toISOString(),
      },
    ]);

    try {
      const res = await chatService.sendMessage({
        conversationId: activeId || undefined,
        content,
        files,
        signal: controller.signal,
      });
      const { conversation, messages: newMessages } = res.data.data;
      setActiveId(conversation._id);
      setMessages((current) => [
        ...current.filter((message) => message._id !== optimisticId),
        ...newMessages,
      ]);
      setConversations((current) => {
        const withoutCurrent = current.filter(
          (item) => item._id !== conversation._id,
        );
        return sortConversations([conversation, ...withoutCurrent]);
      });
    } catch (err) {
      setMessages((current) =>
        current.filter((message) => message._id !== optimisticId),
      );
      if (!isCanceled(err)) setError(friendlyError(err));
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
      setSending(false);
    }
  }

  async function regenerateLastResponse() {
    if (!activeId || sending) return;

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    const previousMessages = messages;

    setSending(true);
    setError("");
    setMessages((current) => {
      const next = [...current];
      const lastAssistantIndex = next.findLastIndex(
        (message) => message.role === "assistant",
      );
      if (lastAssistantIndex !== -1) next.splice(lastAssistantIndex, 1);
      return next;
    });

    try {
      const res = await chatService.regenerateMessage({
        conversationId: activeId,
        signal: controller.signal,
      });
      const { conversation, messages: newMessages } = res.data.data;
      setMessages((current) => [...current, ...newMessages]);
      setConversations((current) =>
        sortConversations(
          current.map((item) =>
            item._id === conversation._id ? conversation : item,
          ),
        ),
      );
    } catch (err) {
      setMessages(previousMessages);
      if (!isCanceled(err)) setError(friendlyError(err));
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null;
      }
      setSending(false);
    }
  }

  function stopGenerating() {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;
    setSending(false);
  }

  async function togglePin(conversation) {
    const res = await chatService.setPinned(
      conversation._id,
      !conversation.pinned,
    );
    const updated = res.data.data.conversation;
    setConversations((current) =>
      sortConversations(
        current.map((item) => (item._id === updated._id ? updated : item)),
      ),
    );
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

  const latestAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?._id;

  return (
    <div className="chat-layout">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        searchQuery={searchQuery}
        onNew={startNew}
        onSearch={setSearchQuery}
        onSelect={selectConversation}
        onRename={openRename}
        onDelete={setDeleteTarget}
        onPin={togglePin}
      />
      <section className="chat-panel" aria-label="Chat workspace">
        <div className="chat-header">
          <div>
            <span className="section-kicker">Nexia workspace</span>
            <h1>
              {activeId
                ? conversations.find((item) => item._id === activeId)?.title
                : "New chat"}
            </h1>
          </div>
          <div className="status-row" aria-label="Workspace status">
            <span>Live memory</span>
            <span>File-ready</span>
          </div>
        </div>
        <ErrorAlert message={error} />
        <div className="messages" aria-live="polite" ref={messagesRef}>
          {loading ? (
            <LoadingSpinner />
          ) : messages.length ? (
            messages.map((message) => (
              <ChatMessage
                key={message._id || `${message.role}-${message.createdAt}`}
                message={message}
                canRegenerate={
                  Boolean(activeId) &&
                  message.role === "assistant" &&
                  message._id === latestAssistantId
                }
                onRegenerate={regenerateLastResponse}
                regenerating={sending}
              />
            ))
          ) : (
            <EmptyState
              title="Start with a spark"
              message="Choose a prompt or ask what is on your mind."
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
        <ChatInput disabled={sending} onSend={send} onStop={stopGenerating} />
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
