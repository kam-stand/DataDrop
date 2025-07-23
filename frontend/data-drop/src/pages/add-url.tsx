import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/navbar";
import "../styles.css/theme.css";

interface AddUrlFormData {
  url: string;
  file_type: string;
  description?: string;
}

export function AddUrl() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AddUrlFormData>({
    url: "",
    file_type: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url.trim()) {
      setError("URL is required");
      return;
    }

    if (!formData.file_type.trim()) {
      setError("File type is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:8080/api/v1/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.url.trim(),
          file_type: formData.file_type,
          description: formData.description?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Backend API not found. Make sure your Spring Boot server is running on port 8080."
          );
        }
        throw new Error(
          `Failed to add URL: ${response.status} ${response.statusText}`
        );
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/urls");
      }, 2000);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Cannot connect to backend server. Make sure your Spring Boot application is running and CORS is configured."
        );
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (success) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div
            className="card"
            style={{ textAlign: "center", marginTop: "50px" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✅</div>
            <h2 style={{ color: "var(--success-green)", marginBottom: "10px" }}>
              Success!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              URL has been successfully added to the system.
            </p>
            <span className="badge badge-info">
              🔄 Redirecting to URLs page...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">➕ Add New Base URL</h1>
        </div>

        <div className="card">
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "var(--text-primary)" }}>
              🔗 Register a new data source URL
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                marginTop: "5px",
                marginBottom: 0,
              }}
            >
              Add a URL that will be monitored and processed for data extraction
            </p>
          </div>

          {error && <div className="error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                🌐 URL <span style={{ color: "var(--danger-red)" }}>*</span>
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://api.example.com/data"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                📄 File Type{" "}
                <span style={{ color: "var(--danger-red)" }}>*</span>
              </label>
              <select
                name="file_type"
                value={formData.file_type}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={loading}
              >
                <option value="">Select file type</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="txt">TXT</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">📝 Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of what this URL provides..."
                className="form-input"
                rows={3}
                disabled={loading}
              />
            </div>

            <div
              style={{
                backgroundColor: "rgba(74, 222, 128, 0.1)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>💡</span>
                <strong style={{ color: "var(--accent-green)" }}>
                  Pro Tip
                </strong>
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  margin: 0,
                  fontSize: "0.9rem",
                }}
              >
                Make sure your URL is accessible and returns data in a supported
                format (JSON, CSV, XML). The system will automatically detect
                the data format and process it accordingly.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/urls")}
                className="btn btn-secondary"
                disabled={loading}
              >
                ❌ Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? <>🔄 Adding...</> : <>✅ Add URL</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
