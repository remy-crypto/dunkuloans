import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Page Imports
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ApplyLoan from "./pages/ApplyLoan";

// ==========================================
// PROTECTED ROUTE WRAPPER
// ==========================================
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  // 1. Show Loading Screen (Dark Theme) while Supabase checks session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-400">Loading Dunkuloans...</p>
        </div>
      </div>
    );
  }

  // 2. If no user found after loading, redirect to Login
  if (!user) return <Navigate to="/login" replace />;
  
  // 3. If authenticated, render the page
  return children;
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- PROTECTED ROUTES --- */}
          
          {/* 1. Main Dashboard (Handles Admin & Borrower Views) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* 2. Specific Loan Application Page (Borrowers) */}
          <Route path="/apply" element={<ProtectedRoute><ApplyLoan /></ProtectedRoute>} />

          {/* 3. Admin Sub-Pages (These load Dashboard, which then handles the specific view internally) */}
          <Route path="/clients" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/investors" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/collateral" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/underwriting" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* --- REDIRECTS --- */}
          {/* Default to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}