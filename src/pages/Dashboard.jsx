import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeAmount: 0,
    totalCount: 0,
    activeCount: 0,
    pendingCount: 0,
    settledCount: 0,
    defaultCount: 0
  });
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    // We don't set loading to true here to avoid flickering on real-time updates
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

  // --- REAL-TIME SUBSCRIPTION ---
  useEffect(() => {
    fetchData(); // Initial load

    const subscription = supabase
      .channel('admin-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        (payload) => {
          fetchData(); // Refresh stats on any loan change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // --- CHART HELPERS ---
  const getDonutStrokeDash = (count, total) => {
    if (total === 0) return "0, 100";
    return `${(count / total) * 100}, 100`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 animate-pulse">Loading Executive Overview...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Executive Overview</h1>
        <p className="text-gray-400 mt-1">Portfolio performance, risk metrics, and operational stats.</p>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Upcoming Repayments */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden shadow-lg">
          <p className="text-sm font-medium text-gray-400">Upcoming Repayments</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {stats.activeAmount.toLocaleString()}</h2>
          <p className="text-xs text-gray-500 mt-2">Due in next 30 days</p>
          <div className="absolute top-6 right-6 p-2 bg-green-900/30 rounded-lg text-green-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>

        {/* Card 2: Portfolio Risk */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <p className="text-sm font-medium text-gray-400">Portfolio Risk (LTV)</p>
          <h2 className="text-3xl font-bold text-white mt-2">40.0%</h2>
          <p className="text-xs text-green-400 mt-2">Low Risk Target: &lt;60%</p>
        </div>
      </div>

      {/* Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart (Visual Simulation) */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Revenue & Expenses</h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">Revenue</span>
              <span className="px-2 py-1 bg-transparent text-gray-500">Volume</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2 relative border-b border-gray-700 pb-6">
             {/* Dynamic Bars based on random visual logic for now, can be connected to transaction table later */}
             {[40, 60, 45, 70, 85, 90].map((h, i) => (
                <div key={i} className="w-full bg-indigo-600/20 hover:bg-indigo-600/40 rounded-t transition-all cursor-pointer" style={{ height: `${h}%` }}></div>
             ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2 px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

        {/* Donut Chart (Real Data) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center shadow-lg">
          <h3 className="text-lg font-bold text-white mb-6 w-full text-left">Loan Status</h3>
          
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              {/* Background Ring */}
              <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
              
              {/* Active Segment (Blue) */}
              <path className="text-sky-500 transition-all duration-1000 ease-out" 
                    strokeDasharray={getDonutStrokeDash(stats.activeCount, stats.totalCount)} 
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" stroke="currentColor" strokeWidth="3.8" />
            </svg>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{stats.totalCount}</span>
              <span className="text-xs text-gray-400">Total Loans</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 w-full mt-8">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span className="text-sm text-gray-300">Active</span>
              <span className="ml-auto text-sm font-bold text-white">{stats.activeCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              <span className="text-sm text-gray-300">Pending</span>
              <span className="ml-auto text-sm font-bold text-white">{stats.pendingCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-300">Paid</span>
              <span className="ml-auto text-sm font-bold text-white">{stats.settledCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-sm text-gray-300">Default</span>
              <span className="ml-auto text-sm font-bold text-white">{stats.defaultCount}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}