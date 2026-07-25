import { api } from "../api/http.js";

export const authService = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (payload) => api.put("/users/profile", payload),
};
