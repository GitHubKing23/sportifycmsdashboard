import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}>
        <p style={{ fontSize: 16, color: "#555" }}>Loading dashboard…</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
