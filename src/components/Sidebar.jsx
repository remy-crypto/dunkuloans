import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/SupabaseClient";

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("borrower"); // Default to borrower

  useEffect(() => {
    if (user) {
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => { if (data) setRole(data.role); });
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Styles
  const baseLinkStyle = "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium";
  const activeLinkStyle = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20";
  const inactiveLinkStyle = "text-gray-400 hover:bg-gray-800 hover:text-white";

  // Menu Configurations
  const adminMenu = [
    { name: "Dashboard", path: "/dashboard", icon: "M4 6h16M4 12h16M4 18h16" },
    { name: "Clients", path: "/clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Investors", path: "/investors", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Underwriting", path: "/underwriting", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  ];

  const borrowerMenu = [
    { name: "Dashboard", path: "/dashboard", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { name: "Apply for Loan", path: "/apply", icon: "M12 6v6l4 2" },
    { name: "Profile & Settings", path: "/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { name: "Support", path: "/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  const menuToRender = role === 'admin' ? adminMenu : borrowerMenu;

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen sticky top-0 overflow-y-auto">
      
      {/* Branding */}
      <div className="p-6 mb-2">
        <h2 className="text-xl font-bold text-white tracking-wider">DUNKU</h2>
        <div className="text-xs text-indigo-400 font-semibold tracking-widest">BUSINESS SOLUTIONS</div>
        <p className="text-[10px] text-gray-500 mt-1">Your idea home field with Hope</p>
      </div>

      <div className="px-6 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {role === 'admin' ? 'Admin Portal' : 'Borrower Portal'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuToRender.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`${baseLinkStyle} ${isActive(item.path) ? activeLinkStyle : inactiveLinkStyle}`}
          >
            <svg className="w-5 h-5 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
            </svg>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Support / Help Section (Matches Screenshot) */}
      <div className="px-6 mt-6 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Need Help?</p>
        <p className="text-xs text-gray-400">Contact support for loan inquiries.</p>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}