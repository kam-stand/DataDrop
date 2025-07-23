import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/navbar";
import "../styles.css/theme.css";

interface BaseUrl {
  id: number;
  baseUrl: string;
  file_type: string;
  status?: "active" | "inactive" | "pending";
  createdAt?: string;
  lastChecked?: string;
}

export function ViewUrls() {
  const [urls, setUrls] = useState<BaseUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/api/v1/url");
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Backend API not found. Make sure your Spring Boot server is running on port 8080."
          );
        }
        throw new Error(
          `Failed to fetch URLs: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      setUrls(data);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(
          "Cannot connect to backend server. Make sure your Spring Boot application is running on http://localhost:8080 and CORS is configured."
        );
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <span className="badge badge-success">🟢 Active</span>;
      case "pending":
        return <span className="badge badge-warning">⏳ Pending</span>;
      case "inactive":
        return <span className="badge badge-warning">🔴 Inactive</span>;
      default:
        return <span className="badge badge-info">❓ Unknown</span>;
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/url/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch URL details");
      }
      const data = await response.json();
      alert(`URL Details:\n${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      alert(
        "Error fetching URL details: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="loading">
            <span>🔄 Loading URLs...</span>
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
            <h1 className="page-title">📋 Base URLs</h1>
            <Link to="/add-url" className="btn btn-primary">
              <span>➕</span>
              Add New URL
            </Link>
          </div>
        </div>

        {error && <div className="error">⚠️ {error}</div>}

        <div className="card">
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: 0, color: "var(--text-primary)" }}>
              🔗 Registered URLs ({urls.length})
            </h3>
          </div>

          {urls.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "10px" }}>📋</div>
              <p>No URLs registered yet</p>
              <Link to="/add-url" className="btn btn-primary">
                Add Your First URL
              </Link>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Base URL</th>
                  <th>File Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.id}>
                    <td>#{url.id}</td>
                    <td>
                      <div
                        style={{
                          maxWidth: "300px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <a
                          href={url.baseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "var(--accent-green)",
                            textDecoration: "none",
                          }}
                        >
                          {url.baseUrl}
                        </a>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        📄 {url.file_type?.toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td>{getStatusBadge(url.status)}</td>
                    <td>
                      <button
                        onClick={() => handleViewDetails(url.id)}
                        className="btn btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
