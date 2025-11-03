import React from "react";
import { useAuth } from "../context/AuthContext";

const shortAddress = (addr) => {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const MetamaskLogin = () => {
  const { address, loading, loginWithMetaMask, logout } = useAuth();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {address ? (
        <>
          <div style={{ fontSize: 14, color: "#222" }}>🔐 {shortAddress(address)}</div>
          <button
            onClick={logout}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={loginWithMetaMask}
          disabled={loading}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #0070f3",
            background: "#0070f3",
            color: "white",
            cursor: "pointer",
          }}
        >
          {loading ? "Connecting..." : "Connect MetaMask"}
        </button>
      )}
    </div>
  );
};

export default MetamaskLogin;
