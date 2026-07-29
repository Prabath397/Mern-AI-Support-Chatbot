import ConversationItem from "./ConversationItem.jsx";
import EmptyState from "./EmptyState.jsx";

export default function Sidebar({
  conversations,
  activeId,
  onNew,
  onSelect,
  onRename,
  onDelete,
}) {
  return (
    <aside className="sidebar" aria-label="Conversations">
      <div className="sidebar-header">
        <h2>Conversations</h2>
        <button type="button" className="button button-primary" onClick={onNew}>
          New
        </button>
      </div>
      {conversations.length ? (
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              active={conversation._id === activeId}
              onSelect={() => onSelect(conversation._id)}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No chats yet" message="Start a new conversation." />
      )}
    </aside>
  );
}
