import { api } from "../api/http.js";

export const adminService = {
  dashboard: () => api.get("/admin/dashboard"),
  users: () => api.get("/admin/users"),
  setUserStatus: (id, isActive) =>
    api.patch(`/admin/users/${id}/status`, { isActive }),
  settings: () => api.get("/admin/settings"),
  updateSettings: (systemPrompt) =>
    api.put("/admin/settings", { systemPrompt }),
};
