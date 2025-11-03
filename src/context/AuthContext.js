import React, { createContext, useContext, useEffect, useState } from "react";
import { requestNonce, verifySignature } from "../services/auth";
import { authApi, blogApi } from "../services/api";
import { logError, flushQueuedLogs } from "../services/logger";
import { ethers } from "ethers";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    const savedAddress = localStorage.getItem("auth_address");
    if (saved) {
      setToken(saved);
      authApi.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
      blogApi.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
    }
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAddress) setAddress(savedAddress);
    // Try to flush any queued logs from previous offline/network errors
    flushQueuedLogs().catch((e) => console.warn("Flush logs failed:", e));
  }, []);

  const logout = () => {
    setToken(null);
    setUser(null);
    setAddress(null);
  delete authApi.defaults.headers.common["Authorization"];
  delete blogApi.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_address");
  };

  const loginWithMetaMask = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      // Request account access
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const acct = await signer.getAddress();

      // Request nonce from backend
      const nonceRes = await requestNonce(acct);
      const nonce = nonceRes?.nonce || nonceRes?.message || nonceRes?.data || nonceRes;
      const message = typeof nonce === "string" ? nonce : `Sign this message to authenticate: ${JSON.stringify(nonce)}`;

      // Sign the nonce/message
      const signature = await signer.signMessage(message);

      // Send signature to backend for verification
      const verifyRes = await verifySignature(acct, signature);

      const receivedToken = verifyRes?.token;
      const receivedUser = verifyRes?.user || verifyRes?.profile || null;

      if (!receivedToken) {
        throw new Error("No token returned from backend");
      }

  // Persist and set axios header
      setToken(receivedToken);
      setUser(receivedUser);
      setAddress(acct);
  authApi.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
  blogApi.defaults.headers.common["Authorization"] = `Bearer ${receivedToken}`;
      localStorage.setItem("auth_token", receivedToken);
      if (receivedUser) localStorage.setItem("auth_user", JSON.stringify(receivedUser));
      localStorage.setItem("auth_address", acct);

      setLoading(false);
      return { token: receivedToken, user: receivedUser };
    } catch (err) {
      console.error("❌ MetaMask login failed:", err.message || err);
      try { await logError(err, { op: 'loginWithMetaMask' }); } catch(e) { console.warn('logger failed', e); }
      setLoading(false);
      throw err;
    }
  };

  const value = {
    address,
    user,
    token,
    loading,
    loginWithMetaMask,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
