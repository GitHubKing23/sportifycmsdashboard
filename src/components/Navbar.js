import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const getActiveStyle = (path) => ({
    fontWeight: location.pathname === path ? "bold" : "normal",
    color: location.pathname === path ? "#0070f3" : "#333",
    textDecoration: location.pathname === path ? "underline" : "none",
    backgroundColor: location.pathname === path ? "#e6f0ff" : "transparent",
    padding: "6px 12px",
    borderRadius: "6px",
    transition: "all 0.2s ease-in-out"
  });

  return (
    <nav style={{
      padding: "15px",
      borderBottom: "2px solid black",
      backgroundColor: "#f8f8f8",
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: "15px"
    }}>
      <ul style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        listStyle: "none",
        padding: 0,
        margin: 0,
        alignItems: "center"
      }}>
        <li>
          <Link to="/" style={getActiveStyle("/")}>🏠 Dashboard</Link>
        </li>
        <li>
          <Link to="/create" style={getActiveStyle("/create")}>📝 Create Blog</Link>
        </li>
        <li>
          <Link to="/manage-blogs" style={getActiveStyle("/manage-blogs")}>📌 Manage Blogs</Link>
        </li>
        <li>
          <Link to="/blogs" style={getActiveStyle("/blogs")}>📖 View Blogs</Link>
        </li>
        <li>
          <Link to="/featured-blogs" style={getActiveStyle("/featured-blogs")}>🌟 Featured Blogs</Link>
        </li>
        {/* 🔒 Optional: Profile */}
        <li>
          <Link to="/profile" style={getActiveStyle("/profile")}>👤 Profile</Link>
        </li>
        <li style={{ marginLeft: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "#333" }}>{user?.email}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
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
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
