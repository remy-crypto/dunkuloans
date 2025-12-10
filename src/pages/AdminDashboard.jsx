import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/SupabaseClient";

const AdminDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLoans: 0,
    pendingRequest: 0,
    activeAmount: 0
  });

  useEffect(() => {
    fetchAllLoans();
  }, []);

  const fetchAllLoans = async () => {
    setLoading(true);
    // Fetch loans with borrower profile info
    const { data, error } = await supabase
      .from("loans")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching loans:", error);
    } else {
      setLoans(data);
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(l => l.status === 'pending').length;
    const activeVal = data
      .filter(l => l.status === 'active')
      .reduce((sum, item) => sum + Number(item.amount), 0);

    setStats({
      totalLoans: total,
      pendingRequest: pending,
      activeAmount: activeVal
    });
  };

  const updateStatus = async (loanId, newStatus) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus.toUpperCase()}?`)) return;

    const { error } = await supabase
      .from("loans")
      .update({ status: newStatus })
      .eq("id", loanId);

    if (error) {
      alert("Error: " + error.message);
    } else {
      fetchAllLoans(); // Refresh UI
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div>Loading Admin Portal...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Portal</h1>
              <p className="text-sm text-gray-400">Manage loans, approvals, and portfolio status.</p>
            </div>
            <button 
              onClick={fetchAllLoans}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-200 border border-gray-700"
            >
              Refresh Data
            </button>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold mt-2 text-white">{stats.totalLoans}</p>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Pending Approvals</p>
              <p className="text-2xl font-bold mt-2 text-yellow-400">{stats.pendingRequest}</p>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
              <p className="text-sm text-gray-400">Active Portfolio Value</p>
              <p className="text-2xl font-bold mt-2 text-green-400">
                K {stats.activeAmount.toLocaleString()}
              </p>
            </div>
          </section>

          {/* Loan Management List */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Loan Applications</h2>
            </div>

            {loans.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center text-gray-300">
                No loans found in the system.
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    {/* User & Loan Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">
                          {loan.profiles?.full_name || "Unknown User"}
                        </span>
                        <span className="text-xs text-gray-500">({loan.profiles?.email})</span>
                      </div>
                      <div className="text-lg font-semibold text-white">
                        K {Number(loan.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Requested: {new Date(loan.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="md:text-center min-w-[100px]">
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                        loan.status === 'active' ? 'bg-green-900 text-green-300 border border-green-700' :
                        loan.status === 'pending' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' :
                        loan.status === 'rejected' ? 'bg-red-900 text-red-300 border border-red-700' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {loan.status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 justify-end min-w-[200px]">
                      {loan.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(loan.id, 'active')}
                            className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded text-white font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(loan.id, 'rejected')}
                            className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 rounded text-white font-medium"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {loan.status === 'active' && (
                        <button
                          onClick={() => updateStatus(loan.id, 'settled')}
                          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 rounded text-white font-medium"
                        >
                          Mark Paid
                        </button>
                      )}
                      {['settled', 'rejected'].includes(loan.status) && (
                        <span className="text-xs text-gray-500 italic">No actions available</span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;