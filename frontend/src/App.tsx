import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Physio from "./pages/Physio";
import Recovery1 from "./pages/recovery1";
import Recovery2 from "./pages/recovery2";
import Recovery3 from "./pages/recovery3";
import UploadPage from "./pages/upload";

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

  if (path === "/dashboard") return <Dashboard />;
  if (path === "/upload") return <UploadPage />;
  if (path === "/physio") return <Physio />;
  if (path === "/recovery1") return <Recovery1 />;
  if (path === "/recovery2") return <Recovery2 />;
  if (path === "/recovery3") return <Recovery3 />;

  if (path === "/") return <Dashboard />;

  return <Dashboard />;
}

export default App;
