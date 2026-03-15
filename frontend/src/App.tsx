import { useEffect, useState } from "react";
import LandingPage from "./pages/landing";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import Dashboard from "./pages/Dashboard";
import ViewProfile from "./pages/ViewProfile";
import EditProfile from "./pages/EditProfile";
import Physio from "./pages/Physio";
import Recovery1 from "./pages/recovery1";
import Recovery2 from "./pages/recovery2";
import Recovery3 from "./pages/recovery3";
import UploadPage from "./pages/upload";
import { useAuth } from "./auth/AuthContext";

function getHashPath() {
  const hash = window.location.hash || "";
  const trimmed = hash.replace(/^#/, "");
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.length === 0) return "/";
  return `/${trimmed}`;
}

function App() {
  const [path, setPath] = useState(getHashPath);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  // Protected routes - redirect to login if not logged in
  const protectedPaths = [
    "/dashboard",
    "/profile",
    "/edit-profile",
    "/upload",
    "/history",
    "/reports",
    "/physio",
    "/recovery1",
    "/recovery2",
    "/recovery3",
  ];
  const isProtectedPath = protectedPaths.includes(path);

  useEffect(() => {
    if (isLoading) return;
    if (isProtectedPath && !isAuthenticated) {
      try {
        window.sessionStorage.setItem("postLoginRedirect", path);
      } catch {
        // ignore
      }
      window.location.hash = "/login";
    }
  }, [isAuthenticated, isLoading, isProtectedPath, path]);

  if (isProtectedPath && isLoading) {
    return null;
  }
  if (isProtectedPath && !isAuthenticated) {
    return <LoginPage />;
  }

  if (path === "/login") return <LoginPage />;
  if (path === "/register") return <RegisterPage />;
  if (path === "/dashboard") return <Dashboard />;
  if (path === "/profile") return <ViewProfile />;
  if (path === "/edit-profile") return <EditProfile />;
  if (path === "/upload") return <UploadPage />;
  if (path === "/physio") return <Physio />;
  if (path === "/recovery1") return <Recovery1 />;
  if (path === "/recovery2") return <Recovery2 />;
  if (path === "/recovery3") return <Recovery3 />;

  // If logged in and at root, go to dashboard
  if (path === "/" && isAuthenticated) return <Dashboard />;

  return <LandingPage />;
}

export default App;
