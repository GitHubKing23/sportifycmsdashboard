import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchBlogById } from "../services/api";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBlog = async () => {
      try {
        const response = await fetchBlogById(id);
        if (!response || Object.keys(response).length === 0) {
          throw new Error("Blog not found");
        }
        setBlog(response);
      } catch (err) {
        console.error("❌ Error fetching blog:", err);
        setError("❌ Blog not found");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id]);

  if (loading) return <p>⏳ Loading blog details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{blog.title}</h1>
      <p><strong>Category:</strong> {blog.category}</p>
      <p><strong>Author:</strong> {blog.author || "Anonymous"}</p>

      {/* ✅ Display Ethereum Tip Address if present */}
      {blog.tipAddress && (
        <p>
          <strong>💸 Tip the Author:</strong>{" "}
          <a
            href={`https://etherscan.io/address/${blog.tipAddress}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {blog.tipAddress}
          </a>
        </p>
      )}

      {blog.feature_image && (
        <img
          src={blog.feature_image}
          alt={blog.title}
          style={{ maxWidth: "100%" }}
        />
      )}

      {blog.sections?.map((section, index) => (
        <div key={index}>
          <h3>{section.heading}</h3>
          {section.image && (
            <img
              src={section.image}
              alt={section.heading}
              style={{ maxWidth: "100%", marginBottom: "10px" }}
            />
          )}
          <p>{section.content}</p>
          {section.caption && <p><em>{section.caption}</em></p>}
        </div>
      ))}
    </div>
  );
};

export default BlogDetail;
