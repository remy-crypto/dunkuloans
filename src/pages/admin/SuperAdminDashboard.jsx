import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { 
  Activity, Globe, Database, Cpu, X, Users, Briefcase, 
  ShieldAlert, TrendingUp, DollarSign, ArrowUpRight, Calendar 
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [chartView, setChartView] = useState('revenue');
  
  // Real-time Stats State
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

  // Mock System Health Data (Simulated Real-time)
  const [sysStats, setSysStats] = useState({ cpu: 12, mem: 45, latency: 24 });

  // 1. Fetch Data from Supabase
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

      const activeVol = active.reduce((sum, l) => sum + Number(l.amount), 0);
      const repayments = active.reduce((sum, l) => sum + Number(l.balance), 0); // Using balance as repayment needed
      
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
    
    // Realtime Subscriptions
    const sub1 = supabase.channel('super-loans').on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchData).subscribe();
    const sub2 = supabase.channel('super-col').on('postgres_changes', { event: '*', schema: 'public', table: 'collateral' }, fetchData).subscribe();
    const sub3 = supabase.channel('super-inv').on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, fetchData).subscribe();
    const sub4 = supabase.channel('super-agents').on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, fetchData).subscribe();

    // System Health Simulation Interval
    const healthInterval = setInterval(() => {
      setSysStats({
        cpu: Math.floor(Math.random() * (15 - 10 + 1) + 10),
        mem: Math.floor(Math.random() * (48 - 42 + 1) + 42),
        latency: Math.floor(Math.random() * (30 - 20 + 1) + 20),
      });
    }, 3000);

    return () => { 
      supabase.removeChannel(sub1); supabase.removeChannel(sub2); 
      supabase.removeChannel(sub3); supabase.removeChannel(sub4); 
      clearInterval(healthInterval);
    };
  }, []);

  // Helper for Donut Chart
  const getDonutStrokeDash = (count, total) => {
    if (total === 0) return "0, 100";
    return `${(count / total) * 100}, 100`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading System Data...</div>;

  return (
    // Light Theme Layout
    <div className="bg-[#f8fafc] min-h-full p-8 text-gray-900 font-sans overflow-y-auto">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Portfolio performance, risk metrics, and operational stats.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-medium flex items-center gap-2 hover:bg-gray-50 shadow-sm">
             <Calendar className="w-3.5 h-3.5 text-gray-500" /> This Month
           </button>
           <button 
             onClick={() => setShowHealthModal(true)}
             className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-green-200 transition-colors shadow-sm"
           >
             <Activity className="w-3.5 h-3.5" /> System Healthy
           </button>
        </div>
      </div>

      {/* TOP CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Active Loan Volume */}
        <div onClick={() => window.location.href='/admin/clients'} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors uppercase tracking-wide">Active Loan Volume</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">K {stats.activeVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
               <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
             <ArrowUpRight className="w-3 h-3" /> 12% <span className="text-gray-400 font-normal">vs last month</span>
          </p>
        </div>

        {/* Card 2: Total Collateral */}
        <div onClick={() => window.location.href='/admin/review'} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 group-hover:text-purple-600 transition-colors uppercase tracking-wide">Total Collateral Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">K {stats.totalCollateral.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
               <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400">
             <span className="text-gray-600 font-bold">{stats.activeCount}</span> active loans secured
          </p>
        </div>

        {/* Card 3: Upcoming Repayments */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 group-hover:text-emerald-600 transition-colors uppercase tracking-wide">Upcoming Repayments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">K {stats.upcomingRepayments.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
               <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Due in next 30 days</p>
        </div>

        {/* Card 4: Portfolio Risk */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Portfolio Risk (LTV)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.ltv.toFixed(1)}%</h3>
            </div>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
               <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] flex items-center gap-1">
             <span className={`font-bold ${stats.ltv < 60 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.ltv < 60 ? 'Low Risk' : 'High Risk'}
             </span>
             <span className="text-gray-400">Target: &lt;60%</span>
          </p>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Revenue Chart (Replicating Area Chart Look with SVG) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">
               {chartView === 'revenue' ? 'Revenue & Expenses' : 'Loan Volume Trends'}
            </h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setChartView('revenue')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartView === 'revenue' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Revenue</button>
                <button onClick={() => setChartView('volume')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${chartView === 'volume' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Volume</button>
            </div>
          </div>
          
          <div className="h-72 w-full relative">
             <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
               {/* Grid */}
               <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" />
               <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" />
               <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" />
               
               {/* Blue Area (Revenue) - Mocked Curve matching screenshot */}
               <path d="M0,180 C80,170 150,120 250,140 C350,160 420,50 500,20 L500,200 L0,200 Z" fill="#e0f2fe" opacity="0.4" />
               <path d="M0,180 C80,170 150,120 250,140 C350,160 420,50 500,20" fill="none" stroke="#0ea5e9" strokeWidth="3" />

               {/* Red Line (Expenses) - Only show on Revenue View */}
               {chartView === 'revenue' && (
                  <path d="M0,190 C100,185 200,188 300,180 C400,170 450,160 500,155" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
               )}
             </svg>
             <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
             </div>
          </div>
        </div>

        {/* Loan Status Distribution (Pie/Donut) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Loan Status Distribution</h3>
          
          <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
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
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500"></div><span className="text-gray-600 flex-1">Active</span><span className="font-bold text-gray-900">{stats.activeCount}</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className="text-gray-600 flex-1">Pending</span><span className="font-bold text-gray-900">{stats.pendingCount}</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-gray-600 flex-1">Paid</span><span className="font-bold text-gray-900">{stats.settledCount}</span></div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div><span className="text-gray-600 flex-1">Default</span><span className="font-bold text-gray-900">{stats.defaultCount}</span></div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Investors & Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Investor Capital (Dark Blue) */}
        <div onClick={() => window.location.href='/admin/investors'} className="bg-[#1e1b4b] rounded-xl p-6 text-white relative overflow-hidden cursor-pointer hover:bg-[#2e2a6b] transition-colors group shadow-lg">
           <div className="relative z-10">
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2 group-hover:gap-3 transition-all">
                  <Users className="w-5 h-5 text-indigo-300" /> Investor Capital
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-indigo-200 text-sm mb-6">Capital deployed from external liquidity providers.</p>
              
              <div className="flex items-end gap-2 mb-2">
                  <span className="text-4xl font-bold">K {stats.investorCapital.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="text-xs text-indigo-300">
                  Generating <span className="text-white font-bold">K {stats.projectedYield.toLocaleString(undefined, {minimumFractionDigits: 2})}</span> projected annual yield.
              </div>
           </div>
           <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mb-10"></div>
        </div>

        {/* Agent Network (White) */}
        <div onClick={() => window.location.href='/admin/agents'} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden cursor-pointer hover:border-emerald-300 transition-colors group">
            <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2 group-hover:gap-3 transition-all">
                    <Briefcase className="w-5 h-5 text-emerald-600" /> Agent Network
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                </h3>
                <p className="text-gray-500 text-sm mb-6">Performance of field agent origination.</p>
                
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                    <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold">Originated Volume</span>
                        <span className="block text-2xl font-bold text-gray-900 mt-1">K {stats.agentVolume.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                    <div>
                        <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold">Commissions Paid</span>
                        <span className="block text-2xl font-bold text-emerald-600 mt-1">K {stats.agentCommissions.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- SYSTEM HEALTH MODAL --- */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHealthModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600" />
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">System Status</h3>
                    <p className="text-xs text-gray-500">Live Diagnostics</p>
                 </div>
              </div>
              <button onClick={() => setShowHealthModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                   {/* API Gateway */}
                   <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-green-200 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Globe className="w-4 h-4" /></div>
                         <span className="font-medium text-gray-700">API Gateway</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-mono text-gray-400">{sysStats.latency}ms latency</span>
                         <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Operational</span>
                      </div>
                   </div>
                   {/* Database */}
                   <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-green-200 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Database className="w-4 h-4" /></div>
                         <span className="font-medium text-gray-700">Primary Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-mono text-gray-400">99.9% uptime</span>
                         <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Connected</span>
                      </div>
                   </div>
                   {/* AI Engine */}
                   <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:border-green-200 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Cpu className="w-4 h-4" /></div>
                         <span className="font-medium text-gray-700">AI Scoring Engine</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Online</span>
                      </div>
                   </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Server Load</h4>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">CPU Usage</span>
                                <span className="font-bold text-gray-900">{sysStats.cpu}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{width: `${sysStats.cpu}%`}}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-600">Memory Usage</span>
                                <span className="font-bold text-gray-900">{sysStats.mem}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{width: `${sysStats.mem}%`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
                <p className="text-xs text-gray-400">System Version: v2.4.0-stable • Region: Africa-South-1</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}