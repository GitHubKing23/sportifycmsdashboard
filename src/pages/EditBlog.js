import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBlogById, updateBlog, uploadImage } from "../services/api";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    author: "SportifyInsider",
    feature_image: "",
    video_url: "",
    tipAddress: "",
    sections: [{ heading: "", content: "", image: "", caption: "" }],
  });

  const [featureImageFile, setFeatureImageFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBlogById(id);
        if (!data) throw new Error("Blog data not found.");

        setFormData({
          title: data.title || "",
          category: data.category || "",
          author: data.author || "SportifyInsider",
          feature_image: data.feature_image || "",
          video_url: data.video_url || "",
          tipAddress: data.tipAddress || "",
          sections: Array.isArray(data.sections) && data.sections.length > 0
            ? data.sections.map(section => ({
                heading: section.heading || "",
                content: section.content || "",
                image: section.image || "",
                caption: section.caption || ""
              }))
            : [{ heading: "", content: "", image: "", caption: "" }],
        });
      } catch (err) {
        console.error("❌ Error fetching blog:", err);
        setError("Failed to load blog.");
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index][field] = value;
    setFormData((prev) => ({ ...prev, sections: updatedSections }));
  };

  const handleSectionImageChange = async (index, file) => {
    if (!file) return;
    try {
      const uploadResponse = await uploadImage(file);
      const updatedSections = [...formData.sections];
      updatedSections[index].image = uploadResponse;
      setFormData((prev) => ({ ...prev, sections: updatedSections }));
    } catch (err) {
      console.error("❌ Failed to upload section image:", err);
      setError("Failed to upload section image.");
    }
  };

  const handleFeatureImageChange = (e) => {
    setFeatureImageFile(e.target.files[0]);
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, { heading: "", content: "", image: "", caption: "" }],
    }));
  };

  const removeSection = (index) => {
    if (formData.sections.length > 1) {
      setFormData((prev) => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index),
      }));
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
      setError("❌ Invalid Ethereum address.");
      setIsSubmitting(false);
      return;
    }

    try {
      let updatedFeatureImageUrl = formData.feature_image;

      if (featureImageFile) {
        const uploadResponse = await uploadImage(featureImageFile);
        updatedFeatureImageUrl = uploadResponse;
      }

      const updatedBlog = {
        ...formData,
        feature_image: updatedFeatureImageUrl,
      };

      await updateBlog(id, updatedBlog);
      alert("✅ Blog updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error updating blog:", err);
      setError("Failed to update blog.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `http://localhost:5000${path}`;
  };

  return (
    <div>
      <h2>✏️ Edit Blog</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          name="title"
          placeholder="Blog Title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />

        <p><strong>Feature Image:</strong></p>
        <input type="file" accept="image/*" onChange={handleFeatureImageChange} />
        {formData.feature_image && (
          <img
            src={getImageUrl(formData.feature_image)}
            alt="Feature"
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
          placeholder="Ethereum Tip Address"
          value={formData.tipAddress}
          onChange={handleInputChange}
        />

        <select name="category" value={formData.category} onChange={handleInputChange} required>
          <option value="" disabled>Select Category</option>
          <option value="NBA">NBA</option>
          <option value="NHL">NHL</option>
          <option value="NFL">NFL</option>
          <option value="MLB">MLB</option>
          <option value="Esports">Esports</option>
          <option value="FIFA">FIFA</option>
          <option value="Wrestling">Wrestling</option>
          <option value="WNBA">WNBA</option>
          <option value="PGA">PGA</option>
          <option value="Other">Other</option>
        </select>

        <h3>📚 Sections</h3>
        {formData.sections.map((section, index) => (
          <div key={index} style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Heading"
              value={section.heading}
              onChange={(e) => handleSectionChange(index, "heading", e.target.value)}
              required
            />
            <textarea
              placeholder="Content"
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
                src={getImageUrl(section.image)}
                alt={`Section ${index + 1}`}
                style={{ maxWidth: "100%", height: "auto", marginTop: "5px", borderRadius: "5px" }}
              />
            )}
            <input
              type="text"
              placeholder="Caption (optional)"
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
          {isSubmitting ? "⏳ Updating..." : "✅ Update Blog"}
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
