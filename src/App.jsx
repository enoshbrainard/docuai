import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
// import { toast } from "sonner";
import "@/App.css";

// Components
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProjectConfig from "./pages/ProjectConfig";
import ContentEditor from "./pages/ContentEditor";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token
      axios
        .get(`${API}/auth/me`)
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      <div className="grain-overlay"></div>
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />
            }
          />

          <Route
            path="/projects/:projectId/config"
            element={
              isAuthenticated ? (
                <ProjectConfig />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/projects/:projectId/editor"
            element={
              isAuthenticated ? (
                <ContentEditor />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          <Route
            path="/"
            element={
              <Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />
            }
          />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
