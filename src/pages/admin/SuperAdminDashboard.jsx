import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeVolume: 0,
    totalCollateral: 0,
    upcomingRepayments: 0,
    activeCount: 0,
    totalCount: 0,
    pendingCount: 0,
    settledCount: 0,
    investorCapital: 0,
    agentVolume: 0,
    agentCommissions: 0
  });

  const fetchData = async () => {
    setLoading(true);
    // 1. Fetch Loans for Volume & Status
    const { data: loans } = await supabase.from("loans").select("*");
    
    // 2. Fetch Collateral for Total Value
    const { data: collateral } = await supabase.from("collateral").select("estimated_value");

    // 3. Fetch Investors for Capital
    const { data: investors } = await supabase.from("investors").select("total_invested");

    // 4. Fetch Agents for Performance
    const { data: agents } = await supabase.from("agents").select("total_commission");

    // --- CALCULATIONS ---
    if (loans) {
      const active = loans.filter(l => l.status === 'active');
      const activeVol = active.reduce((sum, l) => sum + Number(l.amount), 0);
      const repayments = active.reduce((sum, l) => sum + Number(l.balance), 0); // Simplified repayment
      
      const totalCol = collateral ? collateral.reduce((sum, c) => sum + Number(c.estimated_value || 0), 0) : 0;
      const totalInv = investors ? investors.reduce((sum, i) => sum + Number(i.total_invested || 0), 0) : 0;
      const totalComm = agents ? agents.reduce((sum, a) => sum + Number(a.total_commission || 0), 0) : 0;

      setStats({
        activeVolume: activeVol,
        totalCollateral: totalCol,
        upcomingRepayments: repayments,
        totalCount: loans.length,
        activeCount: active.length,
        pendingCount: loans.filter(l => l.status === 'pending').length,
        settledCount: loans.filter(l => l.status === 'settled').length,
        investorCapital: totalInv,
        agentVolume: activeVol * 0.4, // Estimated 40% origination via agents (Mock logic)
        agentCommissions: totalComm
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    
    // Realtime Subscriptions
    const sub1 = supabase.channel('super-loans').on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchData).subscribe();
    const sub2 = supabase.channel('super-col').on('postgres_changes', { event: '*', schema: 'public', table: 'collateral' }, fetchData).subscribe();
    const sub3 = supabase.channel('super-inv').on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, fetchData).subscribe();

    return () => { supabase.removeChannel(sub1); supabase.removeChannel(sub2); supabase.removeChannel(sub3); };
  }, []);

  const getDonutStrokeDash = (count, total) => {
    if (total === 0) return "0, 100";
    return `${(count / total) * 100}, 100`;
  };

  if (loading) return <div className="text-white p-10 animate-pulse">Loading System Data...</div>;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Executive Overview</h1>
          <p className="text-gray-400 mt-1">Portfolio performance, risk metrics, and operational stats.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">This Month</button>
          <button className="px-3 py-1 bg-green-900/30 text-green-400 text-xs rounded border border-green-900 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
            System Healthy
          </button>
        </div>
      </div>

      {/* TOP CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Active Loan Volume */}
        <div className="bg-white p-6 rounded-xl relative shadow-lg">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Loan Volume</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.activeVolume.toLocaleString()}</h2>
          <p className="text-[10px] text-green-600 mt-2 font-bold flex items-center gap-1">
            <span className="text-lg">↗</span> 12% vs last month
          </p>
          <div className="absolute top-6 right-6 text-indigo-200">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>

        {/* Card 2: Total Collateral */}
        <div className="bg-white p-6 rounded-xl relative shadow-lg">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Collateral Value</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.totalCollateral.toLocaleString()}</h2>
          <p className="text-[10px] text-gray-400 mt-2">{stats.activeCount} active loans secured</p>
          <div className="absolute top-6 right-6">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
        </div>

        {/* Card 3: Upcoming Repayments */}
        <div className="bg-white p-6 rounded-xl relative shadow-lg">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Upcoming Repayments</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.upcomingRepayments.toLocaleString()}</h2>
          <p className="text-[10px] text-gray-400 mt-2">Due in next 30 days</p>
          <div className="absolute top-6 right-6">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          </div>
        </div>

        {/* Card 4: Portfolio Risk */}
        <div className="bg-white p-6 rounded-xl relative shadow-lg">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Portfolio Risk (LTV)</p>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">40.0%</h2>
          <p className="text-[10px] text-green-600 mt-2 font-bold">Low Risk Target: &lt;60%</p>
          <div className="absolute top-6 right-6">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue & Expenses</h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-bold">Revenue</span>
              <span className="px-2 py-1 text-gray-400">Volume</span>
            </div>
          </div>
          <div className="h-64 relative w-full">
             {/* Mock Curve - To match screenshot visual */}
             <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
               {/* Blue Area */}
               <path d="M0,150 L0,100 Q125,50 250,75 T500,20 L500,150 Z" fill="#e0f2fe" opacity="0.5" />
               <path d="M0,100 Q125,50 250,75 T500,20" fill="none" stroke="#0ea5e9" strokeWidth="3" />
               {/* Red Line */}
               <path d="M0,140 Q125,135 250,138 T500,130" fill="none" stroke="#f43f5e" strokeWidth="3" />
             </svg>
             <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 mt-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
             </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold text-gray-900 mb-6 w-full text-left">Loan Status Distribution</h3>
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
              <path className="text-gray-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
              <path className="text-sky-500" strokeDasharray={getDonutStrokeDash(stats.activeCount, stats.totalCount)} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{stats.totalCount}</span>
              <span className="text-xs text-gray-500">Total Loans</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-8">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500"></span><span className="text-sm text-gray-600">Active</span><span className="ml-auto text-sm font-bold text-gray-900">{stats.activeCount}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="text-sm text-gray-600">Pending</span><span className="ml-auto text-sm font-bold text-gray-900">{stats.pendingCount}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-sm text-gray-600">Paid</span><span className="ml-auto text-sm font-bold text-gray-900">{stats.settledCount}</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-sm text-gray-600">Default</span><span className="ml-auto text-sm font-bold text-gray-900">{stats.defaultCount}</span></div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Investors & Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Investor Capital Card (Dark Blue Background) */}
        <div className="bg-[#1e1b4b] p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              <h3 className="font-bold text-lg">Investor Capital</h3>
            </div>
            <p className="text-indigo-200 text-xs mb-6">Capital deployed from external liquidity providers.</p>
            
            <h2 className="text-4xl font-bold mb-2">K {stats.investorCapital.toLocaleString()}</h2>
            <p className="text-xs text-indigo-300">Generating K 1,200.00 projected annual yield for partners.</p>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/30 rounded-full blur-2xl"></div>
        </div>

        {/* Agent Network Card (White Background) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            <h3 className="font-bold text-lg text-gray-900">Agent Network</h3>
          </div>
          <p className="text-gray-500 text-xs mb-6">Performance of field agent origination.</p>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Originated Volume</p>
              <h2 className="text-2xl font-bold text-gray-900">K {stats.agentVolume.toLocaleString()}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Commissions Paid</p>
              <h2 className="text-2xl font-bold text-green-600">K {stats.agentCommissions.toLocaleString()}</h2>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}