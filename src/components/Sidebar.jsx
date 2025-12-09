import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  // Helper to highlight active link
  const linkClass = (path) => 
    `block px-4 py-3 rounded-xl transition font-medium ${
      location.pathname === path 
      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
      : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="w-72 bg-slate-900 text-white flex flex-col justify-between h-screen sticky top-0 p-4">
      <div>
        <div className="px-4 py-6 mb-6">
          <h2 className="text-2xl font-black tracking-tight text-white">Dunku<span className="text-indigo-500">loans</span></h2>
        </div>
        
        <nav className="space-y-2">
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>
          <Link to="/apply" className={linkClass("/apply")}>
            Apply for Loan
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button onClick={logout} className="w-full py-3 px-4 bg-slate-800 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}