import { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const { data, error } = await supabase.from("loans").select("*");
    if (error) console.error(error);
    else setData(data);
  };

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: "2rem", color: "#333" }}>
        Please login first
      </div>
    );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "2rem" }}>
        <h1 style={{ color: "#333", marginBottom: "1rem" }}>
          Welcome, {user.email}
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h2>Total Loans</h2>
            <p>{data.length}</p>
          </div>
          <div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h2>Active Loans</h2>
            <p>{data.filter(loan => loan.status === "active").length}</p>
          </div>
          <div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <h2>Settled Loans</h2>
            <p>{data.filter(loan => loan.status === "settled").length}</p>
          </div>
        </div>
        <h2 style={{ marginTop: "2rem", color: "#333" }}>Loans Data</h2>
        <div style={{ background: "#fff", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)", marginTop: "1rem" }}>
          {data.length === 0 ? (
            <p>No loans available</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Client</th>
                  <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Amount</th>
                  <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map(loan => (
                  <tr key={loan.id}>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{loan.client_name}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{loan.amount}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>{loan.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
