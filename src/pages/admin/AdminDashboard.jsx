import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/SupabaseClient";

// ==========================================
// 1. EXECUTIVE OVERVIEW (Real-Time)
// ==========================================
const ExecutiveOverview = () => {
  const [stats, setStats] = useState({
    activeAmount: 0,
    totalCount: 0,
    activeCount: 0,
    pendingCount: 0,
    settledCount: 0,
    defaultCount: 0
  });
  const [loading, setLoading] = useState(true);

  const calculateStats = (data) => {
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
  };

  useEffect(() => {
    // 1. Initial Fetch
    const fetchData = async () => {
      const { data, error } = await supabase.from("loans").select("*");
      if (!error && data) {
        calculateStats(data);
      }
      setLoading(false);
    };
    fetchData();

    // 2. Real-Time Subscription
    const subscription = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        (payload) => {
          // Re-fetch on any change to ensure accuracy
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
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
// MAIN ADMIN DASHBOARD (The Router)
// ==========================================
const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <main className="flex-1 p-8 overflow-y-auto">
        <ExecutiveOverview />
      </main>
    </div>
  );
};

export default AdminDashboard;