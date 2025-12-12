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
        if (data) setRole(data.role === 'borrower' ? 'client' : data.role);
      };
      fetchRole();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => {
    if (path === '/partner' && location.pathname === '/partner') return true;
    if (path !== '/partner' && location.pathname.startsWith(path)) return true;
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    if (path === '/client' && location.pathname === '/client') return true;
    if (path !== '/client' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const baseLinkStyle = "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium";
  const activeLinkStyle = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20";
  const inactiveLinkStyle = "text-gray-400 hover:bg-gray-800 hover:text-white";

  // --- MENUS ---
  const adminMenu = [
    { name: "Dashboard", path: "/admin", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
    { name: "Clients", path: "/admin/clients", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" },
    { name: "Investors", path: "/admin/investors", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" },
    { name: "KYC Queue", path: "/admin/kyc", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414" },
    { name: "Collateral", path: "/admin/review", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Underwriting", path: "/admin/underwriting", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" },
    { name: "Support", path: "/admin/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536" },
  ];

  const borrowerMenu = [
    { name: "Dashboard", path: "/client", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
    { name: "Apply for Loan", path: "/client/apply", icon: "M12 6v6l4 2" },
    { name: "Profile & Settings", path: "/client/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { name: "Support", path: "/client/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536" },
    { name: "My Activity", path: "/client/activity", icon: "M13 10V3L4 14h7v7l9-11h-7z" }, // New Item
  ];

  const superAdminMenu = [
     // ... (Keep existing super admin items if needed, or use adminMenu as base)
     { name: "Dashboard", path: "/admin", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
     { name: "Loans Details", path: "/admin/loans-details", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414" },
     // ... Add other Super Admin items here as previously defined
  ];

  const partnerMenu = [
    { name: "Dashboard", path: "/partner", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" },
    { name: "My Referrals", path: "/partner/referrals", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" },
    { name: "Earnings", path: "/partner/earnings", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1" },
  ];

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
      <div className="p-6 mb-2">
        <h2 className="text-xl font-bold text-white tracking-wider">DUNKU</h2>
        <div className="text-xs text-indigo-400 font-semibold tracking-widest">BUSINESS SOLUTIONS LTD</div>
        <p className="text-[10px] text-gray-500 mt-1">Your idea home field with Hope</p>
      </div>

      <div className="px-6 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{portalName}</p>
      </div>

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

      {(role === 'client' || role === 'borrower') && (
        <div className="px-6 mt-6 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Need Help?</p>
          <p className="text-xs text-gray-400">Contact support for inquiries.</p>
        </div>
      )}

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