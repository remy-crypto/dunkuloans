// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchLoans = async () => {
      const { data, error } = await supabase.from("loans").select("*");
      if (!error) setLoans(data);
    };
    fetchLoans();
  }, [user]);

  if (!user) return <div className="auth-container">Please login...</div>;

  // Calculate stats
  const activeLoans = loans.filter(l => l.status === 'active');
  const settledLoans = loans.filter(l => l.status === 'settled');
  const totalAmount = activeLoans.reduce((sum, l) => sum + (l.amount || 0), 0);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Welcome back, {user.email.split('@')[0]}</h1>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="card">
            <h3>Active Loan Amount</h3>
            <p className="amount">K {totalAmount.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Active Loans</h3>
            <p className="amount">{activeLoans.length}</p>
          </div>
          <div className="card">
            <h3>Settled Loans</h3>
            <p className="amount">{settledLoans.length}</p>
          </div>
        </div>

        {/* Loan Table */}
        <h2>Loan History</h2>
        <div className="table-container">
          {loans.length === 0 ? (
            <p style={{padding: '1rem'}}>No loans found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>#{loan.id.slice(0, 8)}...</td>
                    <td>K {loan.amount.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge status-${loan.status.toLowerCase()}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>{new Date(loan.created_at).toLocaleDateString()}</td>
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