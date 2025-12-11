import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/SupabaseClient";

export default function Sidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("borrower");

  useEffect(() => {
    if (user) {
      const fetchRole = async () => {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data) setRole(data.role);
      };
      fetchRole();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Helper to check active state
  const isActive = (path) => {
    if (path === '/partner' && location.pathname === '/partner') return true;
    if (path !== '/partner' && location.pathname.startsWith(path)) return true;
    
    // Admin/Client checks
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    if (path === '/client' && location.pathname === '/client') return true;
    if (path !== '/client' && location.pathname.startsWith(path)) return true;
    
    return false;
  };

  // Styles
  const baseLinkStyle = "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium";
  const activeLinkStyle = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20";
  const inactiveLinkStyle = "text-gray-400 hover:bg-gray-800 hover:text-white";

  // --- MENU CONFIGURATIONS ---

  // 1. ADMIN MENU
  const adminMenu = [
    { name: "Dashboard", path: "/admin", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
    { name: "Clients", path: "/admin/clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Investors", path: "/admin/investors", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" },
    { name: "KYC Queue", path: "/admin/kyc", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414" },
    { name: "Collateral", path: "/admin/review", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Underwriting", path: "/admin/underwriting", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
    { name: "Support", path: "/admin/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636" },
  ];

  // 2. SUPER ADMIN MENU
  const superAdminMenu = [
    { name: "Dashboard", path: "/admin", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
    { name: "Loans Details", path: "/admin/loans-details", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "Monitoring", path: "/admin/monitoring", icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" },
    { name: "Worker's Pad", path: "/admin/workers-pad", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
    { name: "Uploads", path: "/admin/uploads", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
    { name: "PLE Dashboard", path: "/admin/ple", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    { name: "Authorization", path: "/admin/authorization", icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.336A1.5 1.5 0 0110.233 20h-2.466a1.5 1.5 0 01-1.303-.703l-1.303-2.172a1.5 1.5 0 01-.157-1.348l.78-2.6a6 6 0 018.21-6.177z" },
    { name: "Staff Management", path: "/admin/staff", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { name: "Claims Center", path: "/admin/claims", icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    
    // Include standard admin items for quick access
    { name: "Clients", path: "/admin/clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" },
    { name: "Investors", path: "/admin/investors", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" },
    { name: "Agents", path: "/admin/agents", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { name: "Underwriting", path: "/admin/underwriting", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
  ];

  // 3. BORROWER MENU
  const borrowerMenu = [
    { name: "Dashboard", path: "/client", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
    { name: "Apply for Loan", path: "/client/apply", icon: "M12 6v6l4 2" },
    { name: "Profile & Settings", path: "/client/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { name: "Support", path: "/client/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636" },
  ];

  // 4. PARTNER (AGENT) MENU - (ADDED THIS)
  const partnerMenu = [
    { name: "Dashboard", path: "/partner", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
    { name: "My Referrals", path: "/partner/referrals", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" },
    { name: "Earnings", path: "/partner/earnings", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" },
  ];

  // LOGIC: Choose menu based on role
  let menuToRender = borrowerMenu;
  let portalName = "Borrower Portal";

  if (role === 'admin') {
    menuToRender = adminMenu;
    portalName = "Worker Portal";
  } else if (role === 'super_admin') {
    menuToRender = superAdminMenu;
    portalName = "Super Admin Console";
  } else if (role === 'partner') {
    menuToRender = partnerMenu;
    portalName = "Partner Portal";
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen sticky top-0 overflow-y-auto sidebar-scroll">
      
      {/* Branding */}
      <div className="p-6 mb-2">
        <h2 className="text-xl font-bold text-white tracking-wider">DUNKU</h2>
        <div className="text-xs text-indigo-400 font-semibold tracking-widest">BUSINESS SOLUTIONS</div>
        <p className="text-[10px] text-gray-500 mt-1">Your idea home field with Hope</p>
      </div>

      <div className="px-6 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{portalName}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        {menuToRender.map((item) => (
          <Link 
            key={item.name} 
            to={item.path} 
            className={`${baseLinkStyle} ${isActive(item.path) ? activeLinkStyle : inactiveLinkStyle}`}
          >
            <svg className="w-5 h-5 opacity-75 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
            </svg>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {role === 'partner' ? 'Agent' : user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}