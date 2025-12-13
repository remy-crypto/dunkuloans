import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeVolume: 0,
    totalCollateral: 0,
    upcomingRepayments: 0,
    ltv: 0,
    activeCount: 0,
    totalCount: 0,
    pendingCount: 0,
    settledCount: 0,
    defaultCount: 0,
    investorCapital: 0,
    agentVolume: 0,
    agentCommissions: 0,
    projectedYield: 0
  });

  const fetchData = async () => {
    // 1. Fetch Loans
    const { data: loans } = await supabase.from("loans").select("*");
    
    // 2. Fetch Collateral
    const { data: collateral } = await supabase.from("collateral").select("estimated_value");

    // 3. Fetch Investors
    const { data: investors } = await supabase.from("investors").select("total_invested");

    // 4. Fetch Agents
    const { data: agents } = await supabase.from("agents").select("total_commission");

    if (loans) {
      // Loan Status Counts
      const active = loans.filter(l => l.status === 'active');
      const pending = loans.filter(l => l.status === 'pending');
      const settled = loans.filter(l => l.status === 'settled');
      const defaulted = loans.filter(l => l.status === 'default');

      // Financial Calculations
      const activeVol = active.reduce((sum, l) => sum + Number(l.amount), 0);
      const repayments = active.reduce((sum, l) => sum + Number(l.balance), 0);
      
      const totalCol = collateral ? collateral.reduce((sum, c) => sum + Number(c.estimated_value || 0), 0) : 0;
      const calculatedLtv = totalCol > 0 ? (activeVol / totalCol) * 100 : 0;

      const totalInv = investors ? investors.reduce((sum, i) => sum + Number(i.total_invested || 0), 0) : 0;
      
      const agentLoans = loans.filter(l => l.agent_id !== null);
      const agentVol = agentLoans.reduce((sum, l) => sum + Number(l.amount), 0);
      const totalComm = agents ? agents.reduce((sum, a) => sum + Number(a.total_commission || 0), 0) : 0;

      setStats({
        activeVolume: activeVol,
        totalCollateral: totalCol,
        upcomingRepayments: repayments,
        ltv: calculatedLtv,
        totalCount: loans.length,
        activeCount: active.length,
        pendingCount: pending.length,
        settledCount: settled.length,
        defaultCount: defaulted.length,
        investorCapital: totalInv,
        projectedYield: totalInv * 0.12, 
        agentVolume: agentVol,
        agentCommissions: totalComm
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const sub1 = supabase.channel('super-loans').on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchData).subscribe();
    const sub2 = supabase.channel('super-col').on('postgres_changes', { event: '*', schema: 'public', table: 'collateral' }, fetchData).subscribe();
    const sub3 = supabase.channel('super-inv').on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, fetchData).subscribe();
    const sub4 = supabase.channel('super-agents').on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, fetchData).subscribe();

    return () => { 
      supabase.removeChannel(sub1); supabase.removeChannel(sub2); 
      supabase.removeChannel(sub3); supabase.removeChannel(sub4); 
    };
  }, []);

  const getDonutStrokeDash = (count, total) => {
    if (total === 0) return "0, 100";
    return `${(count / total) * 100}, 100`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading System Data...</div>;

  return (
    // FORCE LIGHT THEME WRAPPER to override global dark theme
    <div className="absolute inset-0 bg-[#f8fafc] text-gray-900 font-sans overflow-y-auto">
      <div className="p-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
            <p className="text-gray-500 mt-1 text-sm">Portfolio performance, risk metrics, and operational stats.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white text-gray-600 text-xs font-medium rounded border border-gray-200 shadow-sm flex items-center gap-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              This Month
            </button>
            <button className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded border border-green-200 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 
              System Healthy
            </button>
          </div>
        </div>

        {/* TOP CARDS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Active Loan Volume */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Loan Volume</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.activeVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                <p className="text-[10px] text-green-600 mt-2 font-bold flex items-center gap-1">
                  <span>↗</span> 12% vs last month
                </p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <span className="text-lg font-bold text-blue-500">$</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Collateral */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Collateral Value</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.totalCollateral.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                <p className="text-[10px] text-gray-400 mt-2">{stats.activeCount} active loans secured</p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
            </div>
          </div>

          {/* Card 3: Upcoming Repayments */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upcoming Repayments</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.upcomingRepayments.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                <p className="text-[10px] text-gray-400 mt-2">Due in next 30 days</p>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
            </div>
          </div>

          {/* Card 4: Portfolio Risk */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Portfolio Risk (LTV)</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">{stats.ltv.toFixed(1)}%</h2>
                <p className="text-[10px] text-green-600 mt-2 font-bold">Low Risk Target: &lt;60%</p>
              </div>
              <div className="bg-orange-50 p-2 rounded-lg">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Revenue & Expenses</h3>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium cursor-pointer border border-gray-200">Revenue</span>
                <span className="px-2 py-1 text-gray-400 cursor-pointer">Volume</span>
              </div>
            </div>
            <div className="h-64 relative w-full">
               <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                 <line x1="0" y1="30" x2="500" y2="30" stroke="#f3f4f6" strokeWidth="1" />
                 <line x1="0" y1="70" x2="500" y2="70" stroke="#f3f4f6" strokeWidth="1" />
                 <line x1="0" y1="110" x2="500" y2="110" stroke="#f3f4f6" strokeWidth="1" />

                 <path d="M0,130 Q125,120 250,80 T500,40" fill="none" stroke="#0ea5e9" strokeWidth="3" />
                 <path d="M0,140 Q125,138 250,135 T500,120" fill="none" stroke="#f43f5e" strokeWidth="3" />
               </svg>
               <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 mt-2 px-2">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
               </div>
               <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 -ml-8 py-4">
                  <span>26000</span><span>19500</span><span>13000</span><span>6500</span><span>0</span>
               </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-gray-900 mb-6 w-full text-left">Loan Status Distribution</h3>
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full rotate-[-90deg]">
                <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                <path className="text-sky-500 transition-all duration-1000 ease-out" 
                      strokeDasharray={getDonutStrokeDash(stats.activeCount, stats.totalCount)} 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" stroke="currentColor" strokeWidth="3.8" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{stats.totalCount}</span>
                <span className="text-xs text-gray-500">Total Loans</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 w-full mt-8 px-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500"></span><span className="text-xs text-gray-600">Active</span><span className="ml-auto text-xs font-bold text-gray-900">{stats.activeCount}</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-500"></span><span className="text-xs text-gray-600">Pending</span><span className="ml-auto text-xs font-bold text-gray-900">{stats.pendingCount}</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-xs text-gray-600">Paid</span><span className="ml-auto text-xs font-bold text-gray-900">{stats.settledCount}</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-xs text-gray-600">Default</span><span className="ml-auto text-xs font-bold text-gray-900">{stats.defaultCount}</span></div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Investors & Agents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Investor Capital Card (Dark Blue Background) */}
          <div className="bg-[#1e1b4b] p-6 rounded-xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <h3 className="font-bold text-lg">Investor Capital</h3>
              </div>
              <p className="text-indigo-200 text-xs mb-8">Capital deployed from external liquidity providers.</p>
              
              <div>
                <h2 className="text-3xl font-bold mb-1">K {stats.investorCapital.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                <p className="text-xs text-indigo-300">Generating K {stats.projectedYield.toLocaleString(undefined, {minimumFractionDigits: 2})} projected annual yield for partners.</p>
              </div>
            </div>
            {/* Decorative Circle */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/30 rounded-full blur-2xl"></div>
          </div>

          {/* Agent Network Card (White Background) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                <h3 className="font-bold text-lg text-gray-900">Agent Network</h3>
              </div>
              <p className="text-gray-500 text-xs mb-8">Performance of field agent origination.</p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Originated Volume</p>
                <h2 className="text-2xl font-bold text-gray-900">K {stats.agentVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Commissions Paid</p>
                <h2 className="text-2xl font-bold text-green-600">K {stats.agentCommissions.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}