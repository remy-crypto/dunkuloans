// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2>Dunkuloans</h2>
      <ul className="nav-links">
        <li>
          <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/loans" className={location.pathname === "/loans" ? "active" : ""}>
            My Loans
          </Link>
        </li>
        <li>
          <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>
            Profile
          </Link>
        </li>
      </ul>
      <button onClick={logout} className="logout-btn">Logout</button>
    </div>
  );
}