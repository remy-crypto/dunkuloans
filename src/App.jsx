import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

// 1. IMPROVED PROTECTED ROUTE
// This prevents kicking you out while the app is still checking if you are logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show a loading screen while Supabase checks the session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  // If check is done and no user, THEN redirect
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          {/* We map ALL sidebar links to the Dashboard for now, or you can create specific pages later */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/investors" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/collateral" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/underwriting" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch-all: Redirect to dashboard if logged in, otherwise login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}