import axios from "axios";
import { logError, flushQueuedLogs } from "./logger";

// Support two separate backends: auth and blog
// Accept multiple env var names to match different deploy setups:
// - REACT_APP_AUTH_API_BASE_URL (preferred)
// - REACT_APP_AUTH_API (legacy/alternate)
// - REACT_APP_API_BASE_URL (fallback common variable for both)
const AUTH_BASE =
  process.env.REACT_APP_AUTH_API ||
  process.env.REACT_APP_AUTH_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/";

// Blog API base: prefer specific blog var, then generic API_BASE
const BLOG_BASE = process.env.REACT_APP_BLOG_API_BASE_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5001/";

// Allow toggling credentials usage from env for easier debugging during CORS issues
const AUTH_WITH_CREDENTIALS = process.env.REACT_APP_AUTH_WITH_CREDENTIALS !== "false";
const authApi = axios.create({
  baseURL: AUTH_BASE,
  withCredentials: AUTH_WITH_CREDENTIALS,
  // increase timeout for initial debugging (was 10000ms)
  timeout: Number(process.env.REACT_APP_AUTH_TIMEOUT_MS) || 20000,
});

const blogApi = axios.create({
  baseURL: BLOG_BASE,
  withCredentials: true,
  timeout: 10000,
});

console.log("🌍 authApi ->", authApi.defaults.baseURL);
console.log("🌍 blogApi ->", blogApi.defaults.baseURL);

// Flush any queued logs (attempt) on init
flushQueuedLogs().catch((e) => console.warn("Failed to flush queued logs on init:", e));

// ✅ Fetch All Blogs
export const fetchBlogs = async () => {
  console.log("📡 Fetching all blogs...");
  try {
    const response = await blogApi.get("/blogs");
    const data = response.data;

    if (!Array.isArray(data)) {
      console.error("❌ Unexpected response format:", data);
      throw new Error("Unexpected response format: Expected an array.");
    }

    console.log("✅ Blogs fetched successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching blogs:", error.message);
    throw error;
  }
};

// ✅ Fetch Blog by ID
export const fetchBlogById = async (id) => {
  console.log(`📡 Fetching blog with ID: ${id}`);
  try {
    const response = await blogApi.get(`/blogs/${id}`);
    console.log("✅ Blog fetched successfully:", response.data.blog);
    return response.data.blog;
  } catch (error) {
    console.error(`❌ Error fetching blog ID ${id}:`, error.message);
    throw error;
  }
};

// ✅ Upload Image
export const uploadImage = async (imageFile) => {
  console.log("📤 Uploading image...");
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await blogApi.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Image uploaded successfully:", response.data.imageUrl);
    return response.data.imageUrl;
  } catch (error) {
    console.error("❌ Error uploading image:", error.message);
    throw error;
  }
};

// 🆕 Upload Video (if supported)
export const uploadVideo = async (videoFile) => {
  console.log("📤 Uploading video...");
  try {
    const formData = new FormData();
    formData.append("video", videoFile);

    const response = await blogApi.post("/upload/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Video uploaded successfully:", response.data.videoUrl);
    return response.data.videoUrl;
  } catch (error) {
    console.error("❌ Error uploading video:", error.message);
    throw error;
  }
};

// ✅ Create Blog
export const createBlog = async (blogData) => {
  console.log("📝 Creating blog:", blogData);
  try {
    const response = await blogApi.post("/blogs", blogData);
    console.log("✅ Blog created successfully:", response.data.blog);
    return response.data.blog;
  } catch (error) {
    console.error("❌ Error creating blog:", error.message);
    throw error;
  }
};

// ✅ Update Blog
export const updateBlog = async (id, blogData) => {
  console.log(`✏️ Updating blog ID: ${id}`, blogData);
  try {
    const response = await blogApi.put(`/blogs/${id}`, blogData);
    console.log("✅ Blog updated successfully:", response.data.blog);
    return response.data.blog;
  } catch (error) {
    console.error(`❌ Error updating blog ID ${id}:`, error.message);
    throw error;
  }
};

// ✅ Toggle Featured Blog
export const toggleFeaturedBlog = async (id) => {
  console.log(`🌟 Toggling featured status for blog ID: ${id}`);
  try {
    const response = await blogApi.patch(`/blogs/${id}/feature`);
    console.log("✅ Featured status toggled:", response.data.blog);
    return response.data.blog;
  } catch (error) {
    console.error(`❌ Error toggling featured status for blog ID ${id}:`, error.message);
    throw error;
  }
};

// ✅ Delete Blog
export const deleteBlog = async (id) => {
  console.log(`🗑️ Deleting blog ID: ${id}`);
  try {
    const response = await blogApi.delete(`/blogs/${id}`);
    console.log("✅ Blog deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error deleting blog ID ${id}:`, error.message);
    throw error;
  }
};

// 🧠 Regenerate AI Summary for Blog
export const regenerateSummary = async (id) => {
  console.log(`🔁 Regenerating summary for blog ID: ${id}`);
  try {
    const response = await blogApi.post(`/blogs/${id}/resummarize`);
    console.log("✅ Summary regenerated:", response.data.summary);
    return response.data;
  } catch (error) {
    console.error(`❌ Error regenerating summary for blog ID ${id}:`, error.message);
    throw error;
  }
};
// Attach response interceptors to both instances to log errors
function attachInterceptor(instance, name) {
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      try {
        const ctx = {
          service: name,
          url: error?.config?.url,
          method: error?.config?.method,
          status: error?.response?.status,
          data: error?.response?.data,
        };
        await logError(error, ctx);
      } catch (e) {
        console.warn("Failed to log API error:", e);
      }
      return Promise.reject(error);
    }
  );
}

attachInterceptor(authApi, "authApi");
attachInterceptor(blogApi, "blogApi");

export { authApi, blogApi };
const apiClients = { authApi, blogApi };
export default apiClients;

// Small helpers for runtime connectivity checks from the frontend
export const pingBlogRoot = async () => {
  try {
    return await blogApi.get("/");
  } catch (err) {
    throw err;
  }
};
