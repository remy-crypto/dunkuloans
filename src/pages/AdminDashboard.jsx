import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/SupabaseClient";

const AdminDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeAmount: 0,
    totalCount: 0,
    activeCount: 0,
    pendingCount: 0,
    settledCount: 0,
    defaultCount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch loans
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLoans(data);
      
      // Calculate Stats
      const active = data.filter(l => l.status === 'active');
      const pending = data.filter(l => l.status === 'pending');
      const settled = data.filter(l => l.status === 'settled');
      const defaulted = data.filter(l => l.status === 'default');

      const totalActiveValue = active.reduce((sum, item) => sum + Number(item.amount), 0);

      setStats({
        activeAmount: totalActiveValue,
        totalCount: data.length,
        activeCount: active.length,
        pendingCount: pending.length,
        settledCount: settled.length,
        defaultCount: defaulted.length
      });
    }
    setLoading(false);
  };

  // Helper for Donut Chart calculation
  const getDonutStrokeDash = (count, total) => {
    if (total === 0) return "0, 100";
    const percentage = (count / total) * 100;
    return `${percentage}, 100`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="animate-pulse">Loading Portal...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Executive Overview</h1>
          <p className="text-gray-400 mt-1">Portfolio performance, risk metrics, and operational stats.</p>
        </div>

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Card 1: Upcoming Repayments (Active Amount) */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Upcoming Repayments</p>
                <h2 className="text-3xl font-bold text-white mt-2">
                  K {stats.activeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <p className="text-xs text-gray-500 mt-2">Due in next 30 days</p>
              </div>
              <div className="p-2 bg-green-900/30 rounded-lg text-green-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
            </div>
          </div>

          {/* Card 2: Portfolio Risk (LTV) - Mocked logic for UI matching */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">Portfolio Risk (LTV)</p>
                <h2 className="text-3xl font-bold text-white mt-2">40.0%</h2>
                <p className="text-xs text-green-400 mt-2">Low Risk Target: &lt;60%</p>
              </div>
              <div className="p-2 bg-orange-900/30 rounded-lg text-orange-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
            </div>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue & Expenses (Line Chart - Visual Simulation) */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Revenue & Expenses</h3>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">Revenue</span>
                <span className="px-2 py-1 bg-transparent text-gray-500">Volume</span>
              </div>
            </div>
            
            {/* CSS-Only Line Chart Representation */}
            <div className="h-64 flex items-end justify-between gap-2 px-2 relative">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-600 pointer-events-none">
                <div className="border-b border-gray-700 w-full h-0"></div>
                <div className="border-b border-gray-700 w-full h-0"></div>
                <div className="border-b border-gray-700 w-full h-0"></div>
                <div className="border-b border-gray-700 w-full h-0"></div>
                <div className="border-b border-gray-700 w-full h-0"></div>
              </div>

              {/* Simple SVG Curve */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                <path d="M0,150 C50,140 100,100 150,120 C200,140 250,90 300,80 C350,70 400,50 500,40" 
                      fill="none" stroke="#0ea5e9" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <path d="M0,200 C50,195 100,190 150,190 C200,188 250,185 300,180 C350,175 400,170 500,165" 
                      fill="none" stroke="#ef4444" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>

              {/* X Axis Labels */}
              <div className="w-full absolute bottom-0 flex justify-between text-xs text-gray-500 transform translate-y-6">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
              </div>
            </div>
            <div className="mt-8"></div> {/* Spacer for labels */}
          </div>

          {/* Loan Status Distribution (Donut Chart) */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-white mb-6 w-full text-left">Loan Status Distribution</h3>
            
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                {/* Background Ring */}
                <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                
                {/* Active Segment (Blue) */}
                <path className="text-sky-500" 
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
      </main>
    </div>
  );
};

export default AdminDashboard;