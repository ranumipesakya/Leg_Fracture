import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Physio from "./pages/Physio";
import Recovery1 from "./pages/recovery1";
import Recovery2 from "./pages/recovery2";
import Recovery3 from "./pages/recovery3";
import UploadPage from "./pages/upload";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import AdminDashboard from "./pages/AdminDashboard";
import UserAuth from "./pages/UserAuth";
import Profile from "./pages/Profile";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import HealingMonitoring from "./pages/HealingMonitoring";
import { Toaster } from "react-hot-toast";
import { auth } from "./utils/auth";

function getHashPath() {
  const hash = window.location.hash || "";
  const trimmed = hash.replace(/^#/, "");
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.length === 0) return "/";
  return `/${trimmed}`;
}

function App() {
  const [path, setPath] = useState(getHashPath);

  useEffect(() => {
    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  let page;



  if (path === "/dashboard" || path === "/home") page = <Dashboard />;
  else if (path === "/upload") page = <UploadPage />;
  else if (path === "/physio") page = <Physio />;
  else if (path === "/recovery1") page = <Recovery1 />;
  else if (path === "/recovery2") page = <Recovery2 />;
  else if (path === "/recovery3") page = <Recovery3 />;
  else if (path === "/analytics") page = <AnalyticsDashboard />;
  else if (path === "/admin" || path === "/admin/dashboard") {
    if (!auth.isAdmin()) {
      window.location.hash = "#/home";
      page = <Dashboard />;
    } else {
      page = <AdminDashboard />;
    }
  }
  else if (path === "/auth") page = <UserAuth />;
  else if (path === "/profile") page = <Profile />;
  else if (path === "/healing-monitoring") page = <HealingMonitoring />;
  else page = <Dashboard />;

  const hideChatbot = path === "/auth" || path === "/admin" || path === "/admin/dashboard";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
      {page}
      <Toaster position="top-center" reverseOrder={false} />
      <AccessibilityToolbar />
      <Footer />
      {!hideChatbot && <Chatbot />}
      </div>
    </div>
  );
}

export default App;