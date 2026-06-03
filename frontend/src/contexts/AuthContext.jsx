import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { getAccessToken, setAccessToken } from "../services/api.js";
import * as authApi from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
      } catch {
        setUser(null);
        setLoading(false);
        return;
      }
    }
    try {
      const { data } = await api.get("/users/me");
      setUser(data);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      reload: loadMe,
      isAdmin: user?.role === "ADMIN",
      isTech: user?.role === "TECNICO" || user?.role === "ADMIN",
    }),
    [user, loading, loadMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
