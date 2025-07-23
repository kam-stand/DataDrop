import { Navbar } from "../components/navbar";
import "../styles.css/theme.css";

export function MainPage() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Welcome to DataDrop</h1>
        </div>

        <div className="card">
          <h3 style={{ margin: "0 0 15px 0", color: "var(--text-primary)" }}>
            Getting Started
          </h3>
          <p style={{ color: "var(--text-secondary)" }}>
            Use the navigation menu to manage your URLs, upload files, and view
            processed data.
          </p>
        </div>
      </div>
    </div>
  );
}
