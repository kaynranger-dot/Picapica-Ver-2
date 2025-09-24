// src/App.js
import "./App.css";
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ dummy context
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import PhotoBooth from "./components/PhotoBooth";
import PhotoPreview from "./components/PhotoPreview";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [capturedImages, setCapturedImages] = useState([]);

  return (
    {/* ✅ Wrap everything with AuthProvider */}
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/photobooth"
            element={<PhotoBooth setCapturedImages={setCapturedImages} />}
          />
          <Route
            path="/preview"
            element={<PhotoPreview capturedImages={capturedImages} />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
