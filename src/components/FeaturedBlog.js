import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBlogs } from '../services/api';

const FeaturedBlog = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ Helper to handle both local and external image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http')
      ? imagePath
      : `http://localhost:5000${imagePath}`; // Adjust if deployed elsewhere
  };

  useEffect(() => {
    const loadFeaturedBlogs = async () => {
      try {
        console.log("📡 Fetching all blogs...");
        const blogs = await fetchBlogs();

        if (!Array.isArray(blogs)) {
          throw new Error("Invalid response format: Expected an array.");
        }

        const filteredBlogs = blogs.filter((blog) => blog.featured);
        setFeaturedBlogs(filteredBlogs);
        console.log("✅ Featured blogs loaded:", filteredBlogs);
      } catch (err) {
        console.error('❌ Failed to fetch featured blogs:', err);
        setError('❌ Error loading featured blogs. Please check the backend.');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedBlogs();
  }, []);

  if (loading) return <p>⏳ Loading featured blogs...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>🌟 Featured Blogs</h2>
      {featuredBlogs.length === 0 ? (
        <p>🚫 No featured blogs available.</p>
      ) : (
        featuredBlogs.map((blog) => (
          <div
            key={blog._id}
            style={{
              border: '1px solid #ccc',
              margin: '10px',
              padding: '10px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              backgroundColor: '#f9f9f9'
            }}
          >
            {/* ✅ Display Feature Image */}
            {blog.feature_image ? (
              <img
                src={getImageUrl(blog.feature_image)}
                alt={blog.title}
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: '5px'
                }}
              />
            ) : (
              <p>📸 No Image</p>
            )}

            {/* ✅ Optional YouTube Video Preview */}
            {blog.video_url && (
              <iframe
                width="100%"
                height="200"
                src={blog.video_url.replace('watch?v=', 'embed/')}
                title={blog.title}
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ borderRadius: '5px' }}
              />
            )}

            <div>
              <h3>{blog.title}</h3>
              <p><strong>Category:</strong> {blog.category}</p>
              <p><strong>Author:</strong> {blog.author || "Anonymous"}</p>

              {/* ✅ Ethereum Tip Address */}
              {blog.tipAddress && (
                <p>
                  <strong>💸 Tip the Author:</strong>{' '}
                  <a
                    href={`https://etherscan.io/address/${blog.tipAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {blog.tipAddress}
                  </a>
                </p>
              )}

              {/* ✅ Preview first section */}
              <p>
                {blog.sections?.[0]?.content
                  ? blog.sections[0].content.substring(0, 120) + '...'
                  : '📄 No preview available'}
              </p>

              {/* ✅ Read More Button */}
              <button
                onClick={() => navigate(`/blog/${blog._id}`)}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                📖 Read Article
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FeaturedBlog;
