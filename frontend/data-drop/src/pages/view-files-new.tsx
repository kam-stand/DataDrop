import { useState, useEffect } from "react";
import { Navbar } from "../components/navbar";
import "../styles.css/theme.css";

interface ProcessedFile {
  key: string;
  size: number;
  lastModified: string;
  storageClass: string;
}

export function ViewFiles() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/v1/files");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Backend API not found. Make sure your Spring Boot server is running on port 8080."
          );
        }
        throw new Error(
          `Failed to fetch files: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setFiles(data);
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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "csv":
        return "📊";
      case "json":
        return "📋";
      case "xml":
        return "📄";
      case "pdf":
        return "📕";
      case "txt":
        return "📝";
      default:
        return "📁";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = (file: ProcessedFile) => {
    // Generate download URL for S3 object - you might need to implement this endpoint in your backend
    const downloadUrl = `http://localhost:8080/api/v1/files/download/${encodeURIComponent(
      file.key
    )}`;
    window.open(downloadUrl, "_blank");
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">
            <span>🔄 Loading processed files...</span>
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1 className="page-title">📁 Processed Files</h1>
            <button onClick={fetchFiles} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && <div className="error">⚠️ {error}</div>}

        <div className="card">
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "var(--text-primary)" }}>
              ☁️ AWS S3 Stored Files ({files.length})
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                marginTop: "5px",
                marginBottom: 0,
              }}
            >
              Files that have been uploaded and stored in AWS S3
            </p>
          </div>

          {files.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📂</div>
              <p>No files found in S3 bucket</p>
              <div
                style={{
                  backgroundColor: "rgba(74, 222, 128, 0.1)",
                  border: "1px solid rgba(74, 222, 128, 0.3)",
                  borderRadius: "8px",
                  padding: "15px",
                  marginTop: "20px",
                }}
              >
                <span className="badge badge-info">💡 Tip</span>
                <p style={{ margin: "10px 0 0 0", fontSize: "0.9rem" }}>
                  Upload files to start populating your S3 storage
                </p>
              </div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Size</th>
                  <th>Storage Class</th>
                  <th>Last Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, index) => (
                  <tr key={index}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>
                          {getFileIcon(file.key)}
                        </span>
                        <div>
                          <div
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: "500",
                            }}
                          >
                            {file.key}
                          </div>
                          <div
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.8rem",
                            }}
                          >
                            {file.key.split(".").pop()?.toUpperCase() ||
                              "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{formatFileSize(file.size)}</td>
                    <td>
                      <span className="badge badge-info">
                        {file.storageClass}
                      </span>
                    </td>
                    <td>{new Date(file.lastModified).toLocaleString()}</td>
                    <td>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleDownload(file)}
                          className="btn btn-primary"
                          style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                        >
                          ⬇️ Download
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                          onClick={() =>
                            alert(
                              `File: ${file.key}\nSize: ${formatFileSize(
                                file.size
                              )}\nStorage: ${file.storageClass}\nModified: ${
                                file.lastModified
                              }`
                            )
                          }
                        >
                          👁️ Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ marginTop: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "10px",
              backgroundColor: "rgba(74, 222, 128, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(74, 222, 128, 0.3)",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>☁️</span>
            <div>
              <strong style={{ color: "var(--accent-green)" }}>
                AWS S3 Storage
              </strong>
              <p
                style={{
                  color: "var(--text-secondary)",
                  margin: "5px 0 0 0",
                  fontSize: "0.9rem",
                }}
              >
                All files are securely stored in AWS S3 with different storage
                classes for cost optimization. Files can be downloaded directly
                from the cloud storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
