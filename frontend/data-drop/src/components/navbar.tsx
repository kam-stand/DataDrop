import { Link, useLocation } from "react-router-dom";
import "../styles.css/navbar.css";

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📊</span>
          DataDrop
        </Link>

        <div className="navbar-menu">
          <Link
            to="/dashboard"
            className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>

          <Link
            to="/urls"
            className={`navbar-link ${isActive("/urls") ? "active" : ""}`}
          >
            <span className="nav-icon">🔗</span>
            URLs
          </Link>

          <Link
            to="/add-url"
            className={`navbar-link ${isActive("/add-url") ? "active" : ""}`}
          >
            <span className="nav-icon">➕</span>
            Add URL
          </Link>

          <Link
            to="/files"
            className={`navbar-link ${isActive("/files") ? "active" : ""}`}
          >
            <span className="nav-icon">📁</span>
            Files
          </Link>

          <Link
            to="/upload"
            className={`navbar-link ${isActive("/upload") ? "active" : ""}`}
          >
            <span className="nav-icon">☁️</span>
            Upload
          </Link>
        </div>
      </div>
    </nav>
  );
}
