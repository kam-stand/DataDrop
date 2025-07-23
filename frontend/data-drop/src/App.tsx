import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "./styles.css/theme.css";
import { AuthPage } from "./pages/auth";
import { Dashboard } from "./pages/dashboard";
import { ViewUrls } from "./pages/view-urls";
import { AddUrl } from "./pages/add-url";
import { ViewFiles } from "./pages/view-files";
import { UploadFile } from "./pages/upload-file";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/urls" element={<ViewUrls />} />
        <Route path="/add-url" element={<AddUrl />} />
        <Route path="/files" element={<ViewFiles />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
