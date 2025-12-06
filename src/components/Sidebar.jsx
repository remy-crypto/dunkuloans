import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <div
      style={{
        width: "220px",
        background: "#2c3e50",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h2 style={{ color: "#ecf0f1", marginBottom: "2rem" }}>Dashboard</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: "1rem" }}>
            <Link to="/dashboard" style={{ color: "#ecf0f1", textDecoration: "none" }}>
              Home
            </Link>
          </li>
        </ul>
      </div>
      <button
        onClick={logout}
        style={{
          padding: "0.5rem",
          background: "#e74c3c",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
