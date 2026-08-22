import { api } from "../api/http.js";

export const chatService = {
  listConversations: (query = "") =>
    api.get("/conversations", { params: query ? { q: query } : {} }),
  createConversation: (title) => api.post("/conversations", { title }),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
  renameConversation: (id, title) => api.put(`/conversations/${id}`, { title }),
  setPinned: (id, pinned) => api.patch(`/conversations/${id}/pin`, { pinned }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
  regenerateMessage: ({ conversationId, signal }) =>
    api.post("/chat/regenerate", { conversationId }, { signal }),
  sendMessage: ({ content, conversationId, files = [], signal }) => {
    if (!files.length) {
      return api.post("/chat", { content, conversationId }, { signal });
    }

    const formData = new FormData();
    formData.append("content", content);
    if (conversationId) formData.append("conversationId", conversationId);
    files.forEach((file) => formData.append("attachments", file));

    return api.post("/chat", formData, { signal });
  },
  downloadAttachment: (messageId, attachmentId) =>
    api.get(`/attachments/messages/${messageId}/attachments/${attachmentId}`, {
      responseType: "blob",
    }),
};
