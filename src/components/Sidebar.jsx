import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  // Styles
  const baseLinkStyle = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200";
  const activeLinkStyle = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30";
  const inactiveLinkStyle = "text-gray-400 hover:bg-gray-800 hover:text-white";

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen sticky top-0">
      
      {/* Logo Area */}
      <div className="p-6 mb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Dunkuloans
        </h2>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
          Loan Management
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <Link to="/dashboard" className={`${baseLinkStyle} ${isActive('/dashboard') ? activeLinkStyle : inactiveLinkStyle}`}>
          {/* Dashboard Icon */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          <span className="font-medium">Dashboard</span>
        </Link>

        {/* You can add logic to hide these for Borrowers if needed */}
        <Link to="/loans" className={`${baseLinkStyle} ${isActive('/loans') ? activeLinkStyle : inactiveLinkStyle}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <span className="font-medium">All Loans</span>
        </Link>

        <Link to="/agents" className={`${baseLinkStyle} ${isActive('/agents') ? activeLinkStyle : inactiveLinkStyle}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <span className="font-medium">Agents</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}