import { useState } from "react";
import { createBlog, updateBlog, uploadImage } from "../services/api";

const BlogForm = ({ blogData = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: blogData?.title || "",
    category: blogData?.category || "Other",
    author: blogData?.author || "",
    feature_image: blogData?.feature_image || null,
    video_url: blogData?.video_url || "",
    sections: blogData?.sections || [{ heading: "", content: "", image: null }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Image Upload (Feature Image)
  const handleFeatureImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, feature_image: imageUrl }));
      console.log("✅ Feature image uploaded:", imageUrl);
    } catch (err) {
      console.error("❌ Error uploading feature image:", err);
      setError("Feature image upload failed.");
    }
  };

  // ✅ Handle Section Input Changes
  const handleSectionChange = (index, key, value) => {
    const updatedSections = formData.sections.map((section, i) =>
      i === index ? { ...section, [key]: value } : section
    );
    setFormData((prev) => ({ ...prev, sections: updatedSections }));
  };

  // ✅ Handle Section Image Upload
  const handleSectionImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      handleSectionChange(index, "image", imageUrl);
      console.log(`✅ Section image uploaded for section ${index}:`, imageUrl);
    } catch (err) {
      console.error("❌ Error uploading section image:", err);
      setError("Section image upload failed.");
    }
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (blogData) {
        console.log("✏️ Updating blog...");
        await updateBlog(blogData._id, formData);
      } else {
        console.log("📝 Creating new blog...");
        await createBlog(formData);
      }
      onSuccess();
    } catch (err) {
      console.error("❌ Error submitting blog:", err);
      setError("Failed to submit blog.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>Title:</label>
      <input type="text" name="title" value={formData.title} onChange={handleChange} required />

      <label>Category:</label>
      <select name="category" value={formData.category} onChange={handleChange}>
        <option value="NBA">NBA</option>
        <option value="NHL">NHL</option>
        <option value="NFL">NFL</option>
        <option value="MLB">MLB</option>
        <option value="Esports">Esports</option>
        <option value="Footy">Footy</option>
        <option value="Other">Other</option>
      </select>

      <label>Author:</label>
      <input type="text" name="author" value={formData.author} onChange={handleChange} />

      <label>Feature Image:</label>
      <input type="file" accept="image/*" onChange={handleFeatureImageUpload} />
      {formData.feature_image && <img src={formData.feature_image} alt="Feature" style={{ maxWidth: "100px" }} />}

      <label>Video URL:</label>
      <input type="url" name="video_url" value={formData.video_url} onChange={handleChange} />

      <h3>Sections</h3>
      {formData.sections.map((section, index) => (
        <div key={index}>
          <label>Heading:</label>
          <input type="text" value={section.heading} onChange={(e) => handleSectionChange(index, "heading", e.target.value)} required />

          <label>Content:</label>
          <textarea value={section.content} onChange={(e) => handleSectionChange(index, "content", e.target.value)} required />

          <label>Image:</label>
          <input type="file" accept="image/*" onChange={(e) => handleSectionImageUpload(e, index)} />
          {section.image && <img src={section.image} alt="Section" style={{ maxWidth: "100px" }} />}
        </div>
      ))}

      <button type="submit" disabled={loading}>{loading ? "Submitting..." : blogData ? "Update Blog" : "Create Blog"}</button>
    </form>
  );
};

export default BlogForm;
