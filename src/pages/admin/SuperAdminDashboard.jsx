import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { 
  Activity, Calendar, DollarSign, Briefcase, TrendingUp, ShieldAlert, 
  ArrowUpRight, Users, ArrowRight 
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [showHealthModal, setShowHealthModal] = useState(false);
  
  // Stats State
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

  // Mock System Health (for the modal)
  const [sysStats, setSysStats] = useState({ cpu: 12, mem: 45, latency: 24 });

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
      const active = loans.filter(l => l.status === 'active');
      const pending = loans.filter(l => l.status === 'pending');
      const settled = loans.filter(l => l.status === 'settled');
      const defaulted = loans.filter(l => l.status === 'default');

      // Calculate Active Volume (Sum of active loan amounts)
      const activeVol = active.reduce((sum, l) => sum + Number(l.amount), 0);
      
      // Calculate Repayments (Sum of balances due)
      const repayments = active.reduce((sum, l) => sum + Number(l.balance), 0);
      
      // Calculate Total Collateral
      const totalCol = collateral ? collateral.reduce((sum, c) => sum + Number(c.estimated_value || 0), 0) : 0;
      
      // Calculate LTV
      const calculatedLtv = totalCol > 0 ? (activeVol / totalCol) * 100 : 0;

      // Investor & Agent Stats
      const totalInv = investors ? investors.reduce((sum, i) => sum + Number(i.total_invested || 0), 0) : 0;
      
      // Agent Volume (loans with agent_id)
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
    
    // Realtime Subscriptions
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] text-gray-500">Loading System Data...</div>;

  return (
    // Outer container forces light theme background
    <div className="bg-[#f8fafc] min-h-full p-8 text-gray-900 font-sans overflow-y-auto">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Portfolio performance, risk metrics, and operational stats.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-medium flex items-center gap-2 hover:bg-gray-50 shadow-sm">
             <Calendar className="w-3.5 h-3.5 text-gray-400" /> This Month
           </button>
           <button 
             onClick={() => setShowHealthModal(true)}
             className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-md text-xs font-medium flex items-center gap-1 hover:bg-green-100 shadow-sm"
           >
             <Activity className="w-3.5 h-3.5" /> System Healthy
           </button>
        </div>
      </div>

      {/* --- TOP ROW: 4 STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* 1. Active Loan Volume */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Loan Volume</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.activeVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[10px] font-bold text-green-600 flex items-center">
                   <ArrowUpRight className="w-3 h-3" /> 12%
                </span>
                <span className="text-[10px] text-gray-400">vs last month</span>
              </div>
            </div>
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
               <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 2. Total Collateral Value */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Collateral Value</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.totalCollateral.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              <p className="text-[10px] text-gray-400 mt-2">{stats.activeCount} active loans secured</p>
            </div>
            <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
               <Briefcase className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 3. Upcoming Repayments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Upcoming Repayments</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">K {stats.upcomingRepayments.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              <p className="text-[10px] text-gray-400 mt-2">Due in next 30 days</p>
            </div>
            <div className="p-2 bg-green-50 text-green-500 rounded-lg">
               <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4. Portfolio Risk (LTV) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Portfolio Risk (LTV)</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">{stats.ltv.toFixed(1)}%</h2>
              <p className="text-[10px] text-green-600 mt-2 font-bold">Low Risk Target: &lt;60%</p>
            </div>
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
               <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* --- MIDDLE ROW: CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue & Expenses</h3>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-white border border-gray-200 text-gray-600 rounded font-medium shadow-sm">Revenue</span>
              <span className="px-2 py-1 text-gray-400">Volume</span>
            </div>
          </div>
          
          <div className="h-64 w-full relative">
             <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
               {/* Grid Lines */}
               <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" />
               <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" />
               <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" />
               
               {/* Blue Curve (Revenue) */}
               <path d="M0,180 C80,170 150,120 250,140 C350,160 420,50 500,20" fill="none" stroke="#0ea5e9" strokeWidth="3" />
               {/* Red Curve (Expenses) */}
               <path d="M0,190 C100,185 200,188 300,180 C400,170 450,160 500,155" fill="none" stroke="#f43f5e" strokeWidth="2" />
             </svg>
             
             {/* X-Axis */}
             <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
             </div>
             {/* Y-Axis Labels */}
             <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 -ml-8 py-6">
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
               <path className="text-sky-500" 
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
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500"></div><span className="text-xs text-gray-600 flex-1">Active</span><span className="text-xs font-bold text-gray-900">{stats.activeCount}</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-xs text-gray-600 flex-1">Pending</span><span className="text-xs font-bold text-gray-900">{stats.pendingCount}</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-xs text-gray-600 flex-1">Paid</span><span className="text-xs font-bold text-gray-900">{stats.settledCount}</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-xs text-gray-600 flex-1">Default</span><span className="text-xs font-bold text-gray-900">{stats.defaultCount}</span></div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: INVESTOR & AGENT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Investor Capital (Dark Blue) */}
        <div className="bg-[#1e1b4b] rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-48 cursor-pointer hover:bg-[#2e2a6b] transition-colors" onClick={() => window.location.href='/admin/investors'}>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                 <Users className="w-5 h-5 text-indigo-300" />
                 <h3 className="font-bold text-lg">Investor Capital</h3>
              </div>
              <p className="text-indigo-200 text-xs">Capital deployed from external liquidity providers.</p>
           </div>
           <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-1">K {stats.investorCapital.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              <p className="text-xs text-indigo-300">Generating K {stats.projectedYield.toLocaleString(undefined, {minimumFractionDigits: 2})} projected annual yield for partners.</p>
           </div>
           <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/30 rounded-full blur-2xl"></div>
        </div>

        {/* Agent Network (White) */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-48 cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => window.location.href='/admin/agents'}>
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-lg text-gray-900">Agent Network</h3>
                </div>
                <p className="text-gray-500 text-xs">Performance of filled agent origination.</p>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Originated Volume</p>
                    <h2 className="text-2xl font-bold text-gray-900">K {stats.agentVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Commissions Paid</p>
                    <h2 className="text-2xl font-bold text-emerald-600">K {stats.agentCommissions.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                </div>
            </div>
        </div>

      </div>

    </div>
  );
}