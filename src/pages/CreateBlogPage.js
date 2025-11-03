import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog, uploadImage } from "../services/api";
import { CATEGORIES } from "../constants/categories"; // ✅ Centralized categories

const CreateBlogPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "SportifyInsider",
    video_url: "",
    tipAddress: "",
    sections: [{ heading: "", content: "", image: null, caption: "" }],
  });

  const [featureImage, setFeatureImage] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFeatureImageChange = (e) => {
    setFeatureImage(e.target.files[0]);
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index][field] = value;
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleSectionImageChange = (index, file) => {
    const updatedSections = [...formData.sections];
    updatedSections[index].image = file;
    setFormData({ ...formData, sections: updatedSections });
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { heading: "", content: "", image: null, caption: "" }],
    });
  };

  const removeSection = (index) => {
    if (formData.sections.length > 1) {
      setFormData({
        ...formData,
        sections: formData.sections.filter((_, i) => i !== index),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (
      formData.tipAddress &&
      !/^0x[a-fA-F0-9]{40}$/.test(formData.tipAddress)
    ) {
      setError("❌ Invalid Ethereum tip address.");
      setIsSubmitting(false);
      return;
    }

    try {
      let featureImageUrl = "";

      if (featureImage) {
        const uploadResponse = await uploadImage(featureImage);
        featureImageUrl = uploadResponse;
      }

      const uploadedSections = await Promise.all(
        formData.sections.map(async (section) => {
          if (section.image) {
            const uploadResponse = await uploadImage(section.image);
            return {
              ...section,
              image: uploadResponse,
            };
          }
          return section;
        })
      );

      const blogData = {
        ...formData,
        feature_image: featureImageUrl || "",
        sections: uploadedSections,
      };

      await createBlog(blogData);
      alert("✅ Blog created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error creating blog:", err);
      setError("❌ Failed to create blog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>📝 Create Blog Post</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />

        <p><strong>Feature Image:</strong></p>
        <input type="file" accept="image/*" onChange={handleFeatureImageChange} />
        {featureImage && (
          <img
            src={URL.createObjectURL(featureImage)}
            alt="Feature Preview"
            style={{ maxWidth: "100%", height: "auto", marginTop: "10px", borderRadius: "5px" }}
          />
        )}

        <input
          type="text"
          name="video_url"
          placeholder="YouTube Video URL"
          value={formData.video_url}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="tipAddress"
          placeholder="Ethereum Tip Address (optional)"
          value={formData.tipAddress}
          onChange={handleInputChange}
        />

        <select name="category" value={formData.category} onChange={handleInputChange} required>
          <option value="" disabled>Select Category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <h3>📝 Blog Sections</h3>
        {formData.sections.map((section, index) => (
          <div key={index} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Section Heading"
              value={section.heading}
              onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
              required
            />
            <textarea
              placeholder="Section Content"
              value={section.content}
              onChange={(e) => handleSectionChange(index, "content", e.target.value)}
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleSectionImageChange(index, e.target.files[0])}
            />
            {section.image && (
              <img
                src={URL.createObjectURL(section.image)}
                alt="Section Preview"
                style={{ maxWidth: "100%", height: "auto", marginTop: "5px", borderRadius: "5px" }}
              />
            )}
            <input
              type="text"
              placeholder="Image Caption (optional)"
              value={section.caption}
              onChange={(e) => handleSectionChange(index, "caption", e.target.value)}
            />
            {formData.sections.length > 1 && (
              <button type="button" onClick={() => removeSection(index)}>❌ Remove Section</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addSection}>➕ Add Section</button>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "⏳ Publishing..." : "📢 Publish Blog"}
        </button>
      </form>
    </div>
  );
};

export default CreateBlogPage;
