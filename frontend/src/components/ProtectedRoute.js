// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route → check role (fallback demo role: user.name === "Admin")
  if (adminOnly && user.name !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the requested page
  return children;
}
