import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import CreateBlogPage from "./pages/CreateBlogPage";
import EditBlog from "./pages/EditBlog";
import Login from "./pages/Login";

import BlogList from "./components/BlogList";
import BlogDetail from "./components/BlogDetails";
import FeaturedBlog from "./components/FeaturedBlog";

function App() {
  console.log("🚀 App.js Loaded - Initializing Routes");

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <CreateBlogPage />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <EditBlog />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/blog/:id"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <BlogDetail />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <BlogList />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-blogs"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <BlogList />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/featured-blogs"
            element={
              <ProtectedRoute>
                <div style={{ padding: "20px" }}>
                  <FeaturedBlog />
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
