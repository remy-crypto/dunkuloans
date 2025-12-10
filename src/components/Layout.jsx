import React from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Layout({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 bg-gray-900 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar /> {/* Sidebar handles role-based menu display automatically */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}