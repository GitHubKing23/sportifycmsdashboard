import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    try {
      await login(email.trim(), password);
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const fallback = err?.code === "NOT_ADMIN"
        ? "Access restricted to administrators"
        : err?.response?.status === 401
          ? "Incorrect email or password"
          : err?.code === "ERR_NETWORK"
            ? "Authentication service unavailable"
            : err?.message || "Unable to sign in";
      setFormError(fallback);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.10)",
          padding: "48px 40px",
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, letterSpacing: 2, color: "#6b7280", textTransform: "uppercase" }}>Sportify CMS</p>
          <h1 style={{ margin: "8px 0 0", fontSize: 28, color: "#111827" }}>Administrator Login</h1>
          <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: 14 }}>
            Sign in with your work email to manage the content studio.
          </p>
        </div>

        {formError || error ? (
          <div
            role="alert"
            style={{
              background: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            {formError || error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "#374151" }}>
            Email address
            <input
              type="email"
              required
              placeholder="admin@sportifyinsider.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 15,
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "#374151" }}>
            Password
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 15,
                outline: "none",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: loading ? "#bfdbfe" : "#2563eb",
              color: "white",
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 10px 30px rgba(37, 99, 235, 0.35)",
              transition: "transform 0.2s ease",
            }}
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
