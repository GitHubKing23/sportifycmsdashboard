import { useState, useEffect } from "react";
import {
  fetchBlogs,
  toggleFeaturedBlog,
  deleteBlog,
  regenerateSummary
} from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const [loadingSummaryId, setLoadingSummaryId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const data = await fetchBlogs();
        if (!Array.isArray(data)) {
          console.error("❌ API did not return an array:", data);
          setError("❌ Unexpected API response format.");
          setBlogs([]);
          return;
        }
        console.log("✅ Blogs loaded into Dashboard:", data);
        setBlogs(data);
        setError("");
      } catch (err) {
        console.error("❌ Error fetching blogs:", err.message);
        setError("❌ Failed to load blogs.");
        setBlogs([]);
      }
    };
    loadBlogs();
  }, []);

  const handleToggleFeatured = async (blogId) => {
    try {
      const updatedBlog = await toggleFeaturedBlog(blogId);
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === updatedBlog._id ? updatedBlog : blog
        )
      );
      alert(`✅ Blog "${updatedBlog.title}" featured status updated!`);
    } catch (err) {
      console.error("❌ Error toggling featured status:", err);
      alert("❌ Failed to update featured status.");
    }
  };

  const handleDeleteBlog = async (blogId, blogTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteBlog(blogId);
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== blogId));
      alert(`✅ Blog "${blogTitle}" deleted successfully!`);
    } catch (err) {
      console.error("❌ Error deleting blog:", err);
      alert("❌ Failed to delete blog.");
    }
  };

  const handleResummarize = async (blogId) => {
    try {
      setLoadingSummaryId(blogId);
      const res = await regenerateSummary(blogId);
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === blogId ? { ...blog, summary: res.summary } : blog
        )
      );
      alert("✅ Summary regenerated!");
    } catch (err) {
      console.error("❌ Error regenerating summary:", err.message);
      alert("❌ Failed to regenerate summary.");
    } finally {
      setLoadingSummaryId(null);
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!Array.isArray(blogs) || blogs.length === 0) return <p>No blogs available.</p>;

  return (
    <div>
      <h2>📊 Blog Management Dashboard</h2>
      {blogs.map((blog) => (
        <div
          key={blog._id}
          style={{
            border: "1px solid black",
            padding: "15px",
            marginBottom: "10px",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9"
          }}
        >
          <h3>{blog.title}</h3>
          <p><strong>📌 Category:</strong> {blog.category}</p>
          <p><strong>👤 Author:</strong> {blog.author || "Anonymous"}</p>
          <p><strong>⭐ Featured:</strong> {blog.featured ? "Yes" : "No"}</p>

          {blog.tipAddress && (
            <p><strong>💸 Tip Address:</strong> {blog.tipAddress}</p>
          )}

          {blog.feature_image && (
            <img
              src={blog.feature_image.startsWith("http") ? blog.feature_image : `http://localhost:5000${blog.feature_image}`}
              alt="Feature"
              style={{
                width: "120px",
                height: "auto",
                borderRadius: "5px",
                marginTop: "10px"
              }}
            />
          )}

          {/* ✅ AI Summary Display */}
          <div
            style={{
              backgroundColor: "#fff9c4",
              padding: "10px",
              marginTop: "10px",
              borderLeft: "4px solid #fbc02d"
            }}
          >
            <p>
              <strong>🧠 AI Summary:</strong><br />
              {blog.summary || "No summary available"}
            </p>
            <button
              onClick={() => handleResummarize(blog._id)}
              disabled={loadingSummaryId === blog._id}
              style={{
                marginTop: "6px",
                backgroundColor: "#4caf50",
                color: "white",
                padding: "6px 10px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {loadingSummaryId === blog._id ? "Regenerating..." : "🔁 Regenerate Summary"}
            </button>
          </div>

          <div style={{ marginTop: "10px" }}>
            <button
              style={{ marginRight: "10px" }}
              onClick={() => navigate(`/blog/${blog._id}`)}
            >
              🔍 View
            </button>

            <button
              style={{ marginRight: "10px" }}
              onClick={() => navigate(`/edit-blog/${blog._id}`)}
            >
              ✏️ Edit
            </button>

            <button
              style={{ marginRight: "10px" }}
              onClick={() => handleToggleFeatured(blog._id)}
            >
              {blog.featured ? "⭐ Unfeature" : "🌟 Feature"}
            </button>

            <button
              style={{ marginRight: "10px", backgroundColor: "#ff4444", color: "white" }}
              onClick={() => handleDeleteBlog(blog._id, blog.title)}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
