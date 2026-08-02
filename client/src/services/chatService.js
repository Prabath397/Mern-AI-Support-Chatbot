import { api } from "../api/http.js";
import { generatePuterReply } from "./puterService.js";

const usePuter = import.meta.env.VITE_AI_PROVIDER === "puter";

export const chatService = {
  listConversations: () => api.get("/conversations"),
  createConversation: (title) => api.post("/conversations", { title }),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
  renameConversation: (id, title) => api.put(`/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
  sendMessage: ({ content, conversationId, files = [] }) => {
    if (usePuter && !files.length) {
      return chatService.sendPuterMessage({ content, conversationId });
    }

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
  async sendPuterMessage({ content, conversationId }) {
    const previous = conversationId
      ? (await chatService.getMessages(conversationId)).data.data.messages
      : [];
    const reply = await generatePuterReply({ content, history: previous });

    return api.post("/conversations/external-reply", {
      conversationId,
      userContent: content,
      assistantContent: reply.content,
      provider: reply.provider,
    });
  },
};
