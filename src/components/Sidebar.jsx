// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, FileText, ClipboardList, PieChart, Settings } from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/dashboard/loans", label: "My Loans", icon: FileText },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/loans", label: "All Loans", icon: ClipboardList },
  { to: "/admin/reports", label: "Reports", icon: PieChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Dunkuloans</h1>
        <p className="text-xs text-gray-500">Loan management</p>
      </div>

      <nav className="px-4 py-2 space-y-1">
        {nav.map((n) => {
          const Active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                Active ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{n.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
