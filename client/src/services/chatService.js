import { api } from "../api/http.js";

export const chatService = {
  listConversations: () => api.get("/conversations"),
  createConversation: (title) => api.post("/conversations", { title }),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
  renameConversation: (id, title) => api.put(`/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
  sendMessage: (payload) => api.post("/chat", payload),
};
