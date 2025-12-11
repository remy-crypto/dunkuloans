import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Layout({ children }) {
  const { user, loading } = useAuth();

  // Wait for auth check
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  
  // If not logged in, kick out
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar is HERE only. Do not put it in pages. */}
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}