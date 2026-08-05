import ConversationItem from "./ConversationItem.jsx";
import EmptyState from "./EmptyState.jsx";

export default function Sidebar({
  conversations,
  activeId,
  searchQuery,
  mobileOpen = false,
  onNew,
  onSearch,
  onSelect,
  onRename,
  onDelete,
  onPin,
  onClose,
}) {
  return (
    <aside
      id="conversation-sidebar"
      className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}
      aria-label="Conversations"
    >
      <div className="sidebar-header">
        <div>
          <span className="section-kicker">Workspace</span>
          <h2>Conversations</h2>
        </div>
        <div className="sidebar-header-actions">
          <button
            type="button"
            className="button button-secondary mobile-sidebar-close"
            onClick={onClose}
          >
            Hide
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={onNew}
          >
            + New
          </button>
        </div>
      </div>
      <label className="sr-only" htmlFor="conversation-search">
        Search conversations
      </label>
      <input
        id="conversation-search"
        className="conversation-search"
        type="search"
        value={searchQuery}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search chats"
      />
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
              onPin={onPin}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? "No matches" : "No chats yet"}
          message={
            searchQuery
              ? "Try another title or message keyword."
              : "Start a new conversation."
          }
        />
      )}
    </aside>
  );
}
