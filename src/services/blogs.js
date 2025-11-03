import { blogApi } from "./api";

export const fetchBlogs = async () => {
  try {
    const res = await blogApi.get("/blogs");
    return res.data;
  } catch (err) {
    console.error("❌ fetchBlogs failed:", err?.message || err);
    throw err;
  }
};

export const fetchBlogById = async (id) => {
  try {
    const res = await blogApi.get(`/blogs/${id}`);
    return res.data.blog;
  } catch (err) {
    console.error(`❌ fetchBlogById ${id} failed:`, err?.message || err);
    throw err;
  }
};

export const uploadImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    const res = await blogApi.post("/upload/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.imageUrl;
  } catch (err) {
    console.error("❌ uploadImage failed:", err?.message || err);
    throw err;
  }
};

export const uploadVideo = async (videoFile) => {
  try {
    const formData = new FormData();
    formData.append("video", videoFile);
    const res = await blogApi.post("/upload/video", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.videoUrl;
  } catch (err) {
    console.error("❌ uploadVideo failed:", err?.message || err);
    throw err;
  }
};

export const createBlog = async (blogData) => {
  try {
    const res = await blogApi.post("/blogs", blogData);
    return res.data.blog;
  } catch (err) {
    console.error("❌ createBlog failed:", err?.message || err);
    throw err;
  }
};

export const updateBlog = async (id, blogData) => {
  try {
    const res = await blogApi.put(`/blogs/${id}`, blogData);
    return res.data.blog;
  } catch (err) {
    console.error(`❌ updateBlog ${id} failed:`, err?.message || err);
    throw err;
  }
};

export const toggleFeaturedBlog = async (id) => {
  try {
    const res = await blogApi.patch(`/blogs/${id}/feature`);
    return res.data.blog;
  } catch (err) {
    console.error(`❌ toggleFeaturedBlog ${id} failed:`, err?.message || err);
    throw err;
  }
};

export const deleteBlog = async (id) => {
  try {
    const res = await blogApi.delete(`/blogs/${id}`);
    return res.data;
  } catch (err) {
    console.error(`❌ deleteBlog ${id} failed:`, err?.message || err);
    throw err;
  }
};

export const regenerateSummary = async (id) => {
  try {
    const res = await blogApi.post(`/blogs/${id}/resummarize`);
    return res.data;
  } catch (err) {
    console.error(`❌ regenerateSummary ${id} failed:`, err?.message || err);
    throw err;
  }
};
