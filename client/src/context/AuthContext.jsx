import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, attachAuthToken } from "../api/http.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "nexia_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    attachAuthToken(token);
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.data.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        attachAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(credentials) {
    const res = await api.post("/auth/login", credentials);
    const nextToken = res.data.data.token;
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(res.data.data.user);
    attachAuthToken(nextToken);
    return res.data.data.user;
  }

  async function register(payload) {
    const res = await api.post("/auth/register", payload);
    const nextToken = res.data.data.token;
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(res.data.data.user);
    attachAuthToken(nextToken);
    return res.data.data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    attachAuthToken(null);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      updateUser,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
