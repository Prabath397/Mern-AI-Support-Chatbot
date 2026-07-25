import { formatDate } from "../utils/format.js";

export default function ConversationItem({
  conversation,
  active,
  onSelect,
  onRename,
  onDelete,
}) {
  return (
    <article className={`conversation-item ${active ? "active" : ""}`}>
      <button type="button" onClick={onSelect} className="conversation-main">
        <strong>{conversation.title}</strong>
        <span>{formatDate(conversation.updatedAt)}</span>
      </button>
      <div className="conversation-actions">
        <button
          type="button"
          onClick={() => onRename(conversation)}
          aria-label={`Rename ${conversation.title}`}
        >
          Rename
        </button>
        <button
          type="button"
          onClick={() => onDelete(conversation)}
          aria-label={`Delete ${conversation.title}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
