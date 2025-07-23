import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/navbar";
import "../styles.css/theme.css";
import "../styles.css/upload.css";

export function UploadFile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supportedTypes = [
    "text/csv",
    "application/json",
    "text/xml",
    "application/xml",
    "text/plain",
    "application/pdf",
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    if (!supportedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
      setError(
        "Unsupported file type. Please upload CSV, JSON, XML, TXT, or PDF files."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", selectedFile);

      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(
        "http://localhost:8080/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          navigate("/files");
        }, 2000);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

  if (success) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div
            className="card"
            style={{ textAlign: "center", marginTop: "50px" }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🚀</div>
            <h2 style={{ color: "var(--success-green)", marginBottom: "10px" }}>
              Upload Successful!
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              File has been uploaded and sent to AWS Lambda for processing.
            </p>
            <div style={{ marginBottom: "20px" }}>
              <span className="badge badge-info">☁️ AWS Lambda Processing</span>
            </div>
            <span className="badge badge-success">
              🔄 Redirecting to Files page...
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
          <h1 className="page-title">☁️ Upload File</h1>
        </div>

        <div className="upload-grid">
          <div className="card">
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ margin: 0, color: "var(--text-primary)" }}>
                📤 Upload for AWS Lambda Processing
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginTop: "5px",
                  marginBottom: 0,
                }}
              >
                Upload your data files to be processed through our serverless
                AWS Lambda pipeline
              </p>
            </div>

            {error && <div className="error">⚠️ {error}</div>}

            <div
              className={`drop-zone ${dragActive ? "active" : ""} ${
                selectedFile ? "has-file" : ""
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                accept=".csv,.json,.xml,.txt,.pdf"
                style={{ display: "none" }}
                disabled={uploading}
              />

              {selectedFile ? (
                <div className="file-preview">
                  <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                    {getFileIcon(selectedFile.name)}
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      marginBottom: "5px",
                    }}
                  >
                    {selectedFile.name}
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {formatFileSize(selectedFile.size)}
                  </div>
                  {!uploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="btn btn-secondary"
                      style={{
                        marginTop: "10px",
                        padding: "5px 10px",
                        fontSize: "0.8rem",
                      }}
                    >
                      ❌ Remove
                    </button>
                  )}
                </div>
              ) : (
                <div className="drop-message">
                  <div style={{ fontSize: "3rem", marginBottom: "15px" }}>
                    📤
                  </div>
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "10px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Drop your file here or click to browse
                  </div>
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Supports CSV, JSON, XML, TXT, PDF (max 10MB)
                  </div>
                </div>
              )}
            </div>

            {uploading && (
              <div style={{ marginTop: "20px" }}>
                <div
                  style={{
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "var(--text-primary)" }}>
                    Uploading...
                  </span>
                  <span style={{ color: "var(--accent-green)" }}>
                    {uploadProgress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {selectedFile && !uploading && (
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  gap: "15px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setSelectedFile(null)}
                  className="btn btn-secondary"
                >
                  ❌ Cancel
                </button>
                <button onClick={handleUpload} className="btn btn-primary">
                  🚀 Upload & Process
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 15px 0", color: "var(--text-primary)" }}>
              ☁️ AWS Lambda Processing Pipeline
            </h3>

            <div className="pipeline-step">
              <span className="step-icon">📤</span>
              <div>
                <strong>1. Upload</strong>
                <p>File uploaded to secure S3 storage</p>
              </div>
            </div>

            <div className="pipeline-step">
              <span className="step-icon">⚙️</span>
              <div>
                <strong>2. Processing</strong>
                <p>AWS Lambda functions analyze and transform your data</p>
              </div>
            </div>

            <div className="pipeline-step">
              <span className="step-icon">✅</span>
              <div>
                <strong>3. Complete</strong>
                <p>Processed data available for download</p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "rgba(74, 222, 128, 0.1)",
                border: "1px solid rgba(74, 222, 128, 0.3)",
                borderRadius: "8px",
                padding: "15px",
                marginTop: "20px",
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
                <span>⚡</span>
                <strong style={{ color: "var(--accent-green)" }}>
                  Serverless & Scalable
                </strong>
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  margin: 0,
                  fontSize: "0.9rem",
                }}
              >
                Processing is handled by AWS Lambda, ensuring fast, reliable,
                and cost-effective data transformation without managing servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
