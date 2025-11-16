import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { loginWithEmail, refreshSession } from "../services/auth";
import { authApi, blogApi } from "../services/api";
import { logError, flushQueuedLogs } from "../services/logger";

const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const ADMIN_ROLE = "admin";

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  const applyAuthHeader = useCallback((tokenValue) => {
    if (tokenValue) {
      authApi.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
      blogApi.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
    } else {
      delete authApi.defaults.headers.common["Authorization"];
      delete blogApi.defaults.headers.common["Authorization"];
    }
  }, []);

  const persistSession = useCallback(
    ({ token: nextToken, refreshToken: nextRefreshToken, user: nextUser } = {}) => {
      if (nextToken !== undefined) {
        if (nextToken) {
          setAccessToken(nextToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, nextToken);
          applyAuthHeader(nextToken);
        } else {
          setAccessToken(null);
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          applyAuthHeader(null);
        }
      }

      if (nextRefreshToken !== undefined) {
        if (nextRefreshToken) {
          setRefreshToken(nextRefreshToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, nextRefreshToken);
        } else {
          setRefreshToken(null);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }

      if (nextUser !== undefined) {
        setUser(nextUser);
        if (nextUser) {
          localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        } else {
          localStorage.removeItem(USER_KEY);
        }
      }
    },
    [applyAuthHeader]
  );

  const logout = useCallback(() => {
    persistSession({ token: null, refreshToken: null, user: null });
    setError(null);
  }, [persistSession]);

  const enforceAdmin = useCallback(
    (nextUser) => {
      if (!nextUser || nextUser.role !== ADMIN_ROLE) {
        logout();
        const err = new Error("Access restricted to administrators");
        err.code = "NOT_ADMIN";
        throw err;
      }
      return nextUser;
    },
    [logout]
  );

  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken) return null;

    try {
      const refreshed = await refreshSession(refreshToken);
      const nextUser = enforceAdmin(refreshed?.user ?? user ?? null);
      persistSession({
        token: refreshed?.accessToken ?? accessToken,
        refreshToken: refreshed?.refreshToken ?? refreshToken,
        user: nextUser,
      });
      return refreshed?.accessToken ?? accessToken;
    } catch (err) {
      console.error("❌ refreshAuthToken failed:", err?.message || err);
      try {
        await logError(err, { op: "refreshAuthToken" });
      } catch (logErr) {
        console.warn("logger failed during refresh", logErr);
      }
      logout();
      return null;
    }
  }, [refreshToken, enforceAdmin, persistSession, user, accessToken, logout]);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const savedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    const savedUserRaw = localStorage.getItem(USER_KEY);
    const parsedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

  persistSession({ token: savedToken || null, refreshToken: savedRefresh || null, user: parsedUser || null });

  // Clean up legacy MetaMask storage keys
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_address");

  flushQueuedLogs().catch((e) => console.warn("Flush logs failed:", e));

    setInitializing(false);

    if (savedRefresh) {
      refreshAuthToken().catch((err) => console.warn("refresh on init failed", err));
    }
  }, [persistSession, refreshAuthToken]);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const data = await loginWithEmail(email, password);
        const nextUser = enforceAdmin(data?.user);
        persistSession({
          token: data?.accessToken ?? null,
          refreshToken: data?.refreshToken ?? null,
          user: nextUser,
        });
        return nextUser;
      } catch (err) {
        let friendlyMessage = err?.friendlyMessage || err?.message || "Authentication failed";
        if (err?.response?.status === 401) {
          friendlyMessage = "Incorrect email or password";
        } else if (err?.code === "NOT_ADMIN") {
          friendlyMessage = "Access restricted to administrators";
        } else if (err?.code === "ERR_NETWORK") {
          friendlyMessage = "Authentication service unavailable";
        }
        setError(friendlyMessage);
        try {
          await logError(err, { op: "login", email });
        } catch (logErr) {
          console.warn("logger failed during login", logErr);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [enforceAdmin, persistSession]
  );

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    initializing,
    error,
    isAuthenticated: Boolean(accessToken && user),
    login,
    refreshAuthToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
