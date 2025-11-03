import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// ✅ Navigation
import Navbar from "./components/Navbar";

// ✅ Pages
import Dashboard from "./pages/Dashboard";
import CreateBlogPage from "./pages/CreateBlogPage";
import EditBlog from "./pages/EditBlog";

// ✅ Blog Views
import BlogList from "./components/BlogList";
import BlogDetail from "./components/BlogDetails";
import FeaturedBlog from "./components/FeaturedBlog";

function App() {
  console.log("🚀 App.js Loaded - Initializing Routes");

  return (
    <AuthProvider>
      <Router>
        {/* ✅ Global Navigation Bar */}
        <Navbar />

        {/* ✅ Main App Content */}
        <div style={{ padding: "20px" }}>
          <Routes>
          {/* ✅ Admin Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* ✅ Create Blog */}
          <Route path="/create" element={<CreateBlogPage />} />

          {/* ✅ Edit Blog */}
          <Route path="/edit/:id" element={<EditBlog />} />

          {/* ✅ Blog Details */}
          <Route path="/blog/:id" element={<BlogDetail />} />

          {/* ✅ All Blogs */}
          <Route path="/blogs" element={<BlogList />} />

          {/* ✅ Featured Blogs */}
          <Route path="/featured-blogs" element={<FeaturedBlog />} />

          {/* ✅ Fallback to Dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
