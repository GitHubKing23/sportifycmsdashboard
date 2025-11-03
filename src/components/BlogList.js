import { useState, useEffect } from "react";
import { fetchBlogs } from "../services/api";
import { useNavigate } from "react-router-dom";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        console.log("📡 Fetching blogs...");
        const data = await fetchBlogs();

        if (!Array.isArray(data)) {
          throw new Error("API response is not an array.");
        }

        setBlogs(data);
        console.log("✅ Blogs loaded successfully.");
      } catch (err) {
        console.error("❌ Error fetching blogs:", err);
        setError("❌ Failed to load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (loading) return <p>⏳ Loading blogs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (blogs.length === 0) return <p>📭 No blogs available.</p>;

  return (
    <div>
      <h2>📝 Blog Management</h2>
      {blogs.map((blog) => (
        <div
          key={blog._id}
          style={{
            border: "1px solid #ccc",
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {blog.feature_image && (
            <img
              src={blog.feature_image}
              alt={blog.title}
              style={{ width: "100px", height: "auto", borderRadius: "6px", objectFit: "cover" }}
            />
          )}

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 4px 0" }}>{blog.title}</h3>
            <p style={{ margin: 0 }}>
              <strong>📌 Category:</strong> {blog.category}
            </p>
          </div>

          <button onClick={() => navigate(`/blog/${blog._id}`)}>
            ✏️ Edit Blog
          </button>
        </div>
      ))}
    </div>
  );
};

export default BlogList;
