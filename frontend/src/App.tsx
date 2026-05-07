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
import AdminAuth from "./pages/AdminAuth";
import UserAuth from "./pages/UserAuth";
import PortalSelection from "./pages/PortalSelection";

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

  if (path === "/dashboard") page = <Dashboard />;
  else if (path === "/upload") page = <UploadPage />;
  else if (path === "/physio") page = <Physio />;
  else if (path === "/recovery1") page = <Recovery1 />;
  else if (path === "/recovery2") page = <Recovery2 />;
  else if (path === "/recovery3") page = <Recovery3 />;
  else if (path === "/admin-auth") page = <AdminAuth />;
  else if (path === "/admin") {
    if (!localStorage.getItem('adminToken')) {
      page = <AdminAuth />;
    } else {
      page = <AdminDashboard />;
    }
  }
  else if (path === "/auth") page = <UserAuth />;
  else if (path === "/portal") page = <PortalSelection />;
  else page = <Dashboard />;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {page}
      </div>
      <AccessibilityToolbar />
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;