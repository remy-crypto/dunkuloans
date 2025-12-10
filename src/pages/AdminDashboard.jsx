import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/SupabaseClient";

// ==========================================
// 1. EXECUTIVE OVERVIEW
// ==========================================
const ExecutiveOverview = () => {
  const [stats, setStats] = useState({
    activeAmount: 0, totalCount: 0, activeCount: 0,
    pendingCount: 0, settledCount: 0, defaultCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("loans").select("*");
      if (!error && data) {
        const active = data.filter(l => l.status === 'active');
        const pending = data.filter(l => l.status === 'pending');
        const settled = data.filter(l => l.status === 'settled');
        const defaulted = data.filter(l => l.status === 'default');
        
        setStats({
          activeAmount: active.reduce((sum, item) => sum + Number(item.amount), 0),
          totalCount: data.length,
          activeCount: active.length,
          pendingCount: pending.length,
          settledCount: settled.length,
          defaultCount: defaulted.length
        });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getDonutStrokeDash = (count, total) => {
    if (total === 0) return "0, 100";
    return `${(count / total) * 100}, 100`;
  };

  if (loading) return <div className="p-8 text-gray-400 animate-pulse">Loading Overview...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Executive Overview</h1>
        <p className="text-gray-400 mt-1">Portfolio performance, risk metrics, and operational stats.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
          <p className="text-sm font-medium text-gray-400">Upcoming Repayments</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {stats.activeAmount.toLocaleString()}</h2>
          <div className="absolute top-6 right-6 p-2 bg-green-900/30 rounded-lg text-green-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-400">Portfolio Risk (LTV)</p>
          <h2 className="text-3xl font-bold text-white mt-2">40.0%</h2>
          <p className="text-xs text-green-400 mt-2">Low Risk Target: &lt;60%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-6">Revenue & Expenses</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-2 relative border-b border-gray-700 pb-6">
             {[40, 60, 45, 70, 85, 90].map((h, i) => (
                <div key={i} className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t transition-all" style={{ height: `${h}%` }}></div>
             ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-white mb-6 w-full text-left">Distribution</h3>
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
              <path className="text-sky-500" strokeDasharray={getDonutStrokeDash(stats.activeCount, stats.totalCount)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{stats.totalCount}</span>
              <span className="text-xs text-gray-400">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. CLIENTS VIEW
// ==========================================
const ClientsView = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'borrower');
      if (!error) setClients(data);
      setLoading(false);
    };
    fetchClients();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Client Management</h1>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center">Loading clients...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center">No clients found.</td></tr>
            ) : (
              clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{client.full_name || "Unknown"}</td>
                  <td className="px-6 py-4">{client.email}</td>
                  <td className="px-6 py-4">{new Date(client.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs">Active</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 3. INVESTORS VIEW
// ==========================================
const InvestorsView = () => {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ invested: 0, returns: 0 });

  const fetchInvestors = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('investors').select('*, profiles(full_name, email)');
    if (!error && data) {
      setInvestors(data);
      const totalInv = data.reduce((acc, curr) => acc + Number(curr.total_invested), 0);
      const totalRet = data.reduce((acc, curr) => acc + Number(curr.total_returns), 0);
      setTotals({ invested: totalInv, returns: totalRet });
    }
    setLoading(false);
  };

  useEffect(() => { fetchInvestors(); }, []);

  const handleAddFunds = async (investorId, currentAmount) => {
    const amount = prompt("Enter amount to add (ZMW):");
    if (!amount || isNaN(amount)) return;
    const newTotal = Number(currentAmount) + Number(amount);
    const { error } = await supabase.from('investors').update({ total_invested: newTotal }).eq('id', investorId);
    if (error) alert("Error: " + error.message);
    else { alert("Funds added!"); fetchInvestors(); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Investor Management</h1>
        <p className="text-gray-400 mt-1">Track liquidity providers and capital allocation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30">
          <p className="text-sm font-medium text-indigo-300">Total Capital Raised</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {totals.invested.toLocaleString()}</h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-400">Total Returns Paid</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {totals.returns.toLocaleString()}</h2>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Investor</th>
              <th className="px-6 py-4">Total Invested</th>
              <th className="px-6 py-4">Returns Earned</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {investors.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{inv.profiles?.full_name || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{inv.profiles?.email}</div>
                </td>
                <td className="px-6 py-4 font-bold text-white">K {inv.total_invested.toLocaleString()}</td>
                <td className="px-6 py-4 text-green-400">+ K {inv.total_returns.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleAddFunds(inv.id, inv.total_invested)} className="text-xs border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-3 py-1 rounded transition">Add Funds</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 4. UNDERWRITING VIEW (NEWLY BUILT)
// ==========================================
const UnderwritingView = () => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    // Fetch pending loans + borrower details
    const { data, error } = await supabase
      .from('loans')
      .select('*, profiles(full_name, email, phone)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (!error) setPendingLoans(data);
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const processLoan = async (id, decision) => {
    if (!confirm(`Are you sure you want to ${decision.toUpperCase()} this loan?`)) return;
    
    const { error } = await supabase
      .from('loans')
      .update({ status: decision === 'approve' ? 'active' : 'rejected' })
      .eq('id', id);

    if (error) alert(error.message);
    else fetchPending();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Underwriting Desk</h1>
        <p className="text-gray-400 mt-1">Review pending applications and assess risk.</p>
      </div>

      {loading ? <p className="text-gray-500">Loading queue...</p> : pendingLoans.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
          <p className="text-gray-400">No pending loan applications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingLoans.map(loan => (
            <div key={loan.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{loan.profiles?.full_name}</h3>
                  <p className="text-sm text-gray-400">{loan.profiles?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Requested Amount</p>
                  <p className="text-2xl font-bold text-indigo-400">K {loan.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-900 p-3 rounded border border-gray-800">
                  <p className="text-gray-500">Repayment Total</p>
                  <p className="text-white font-medium">K {(loan.amount * 1.4).toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-800">
                  <p className="text-gray-500">Interest Rate</p>
                  <p className="text-white font-medium">40% Flat</p>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-800">
                  <p className="text-gray-500">Risk Score</p>
                  <p className="text-green-400 font-medium">Low (Simulated)</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button 
                  onClick={() => processLoan(loan.id, 'reject')}
                  className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => processLoan(loan.id, 'approve')}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition shadow-lg shadow-green-900/20"
                >
                  Approve & Disburse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. PLACEHOLDER VIEW 
// ==========================================
const ComingSoonView = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-indigo-500">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
    </div>
    <h2 className="text-2xl font-bold text-white">{title}</h2>
    <p className="text-gray-400 mt-2 max-w-md">This module is currently under development.</p>
  </div>
);

// ==========================================
// 6. MAIN ADMIN DASHBOARD (The Router)
// ==========================================
const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;

  const renderContent = () => {
    switch (path) {
      case '/dashboard': return <ExecutiveOverview />;
      case '/clients': return <ClientsView />;
      case '/investors': return <InvestorsView />;
      case '/kyc': return <ComingSoonView title="KYC Verification Queue" />;
      case '/collateral': return <ComingSoonView title="Collateral Review" />;
      case '/underwriting': return <UnderwritingView />; // <--- NOW ACTIVE
      case '/support': return <ComingSoonView title="Support Tickets" />;
      default: return <ExecutiveOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;