import { api } from "../api/http.js";

export const chatService = {
  listConversations: () => api.get("/conversations"),
  createConversation: (title) => api.post("/conversations", { title }),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
  renameConversation: (id, title) => api.put(`/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
  sendMessage: ({ content, conversationId, files = [] }) => {
    if (!files.length) {
      return api.post("/chat", { content, conversationId });
    }

    const formData = new FormData();
    formData.append("content", content);
    if (conversationId) formData.append("conversationId", conversationId);
    files.forEach((file) => formData.append("attachments", file));

    return api.post("/chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  downloadAttachment: (messageId, attachmentId) =>
    api.get(`/attachments/messages/${messageId}/attachments/${attachmentId}`, {
      responseType: "blob",
    }),
};
