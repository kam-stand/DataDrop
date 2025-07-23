import { Navbar } from "../components/navbar";
import "../styles.css/theme.css";
import "../styles.css/dashboard.css";

export function Dashboard() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3 style={{ margin: "0 0 15px 0", color: "var(--text-primary)" }}>
              Quick Stats
            </h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total URLs</span>
                <span className="stat-value">12</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Processed Files</span>
                <span className="stat-value">8</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Jobs</span>
                <span className="stat-value">3</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 15px 0", color: "var(--text-primary)" }}>
              Recent Activity
            </h3>
            <div className="activity-list">
              <div className="activity-item">
                <span className="badge badge-success">✓ Completed</span>
                <span>File processed: data-export-2025.csv</span>
              </div>
              <div className="activity-item">
                <span className="badge badge-warning">⏳ Processing</span>
                <span>URL added: https://api.example.com/data</span>
              </div>
              <div className="activity-item">
                <span className="badge badge-info">📤 AWS Lambda</span>
                <span>File uploaded to processing queue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
