import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import Sidebar from "../../components/Sidebar";

export default function InvestorDashboard() {
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Calculator State
  const [calcAmount, setCalcAmount] = useState(1000);
  const monthlyPayout = calcAmount * 0.25; // 25% monthly
  const totalReturn = calcAmount * 2; // 200% Total

  useEffect(() => {
    fetchInvestorData();
    // Real-time subscription for wallet balance updates
    const sub = supabase.channel('investor-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, fetchInvestorData)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchInvestorData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('investors').select('*').eq('profile_id', user.id).single();
      if (data) setInvestor(data);
    }
    setLoading(false);
  };

  const handleTransaction = async (type) => {
    const amount = prompt(`Enter amount to ${type} (ZMW):`);
    if (!amount || isNaN(amount)) return;
    
    // Logic to update wallet would go here. For now we simulate UI update.
    let newBalance = Number(investor.wallet_balance);
    if (type === 'Deposit') newBalance += Number(amount);
    if (type === 'Withdraw' || type === 'Invest') newBalance -= Number(amount);

    await supabase.from('investors').update({ wallet_balance: newBalance }).eq('id', investor.id);
  };

  if (loading) return <div className="text-center p-10 bg-gray-50 h-screen">Loading Portal...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-gray-900">Investor Portal</h1>
             <p className="text-sm text-gray-500">Welcome, Investor One</p>
          </div>
          <div className="flex flex-col items-end">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">WALLET</p>
             <h2 className="text-2xl font-bold text-gray-900">K {investor?.wallet_balance?.toLocaleString() || "0.00"}</h2>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end gap-3 mb-8">
           <button className="px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded font-bold text-sm hover:bg-gray-50 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Support
           </button>
           <button onClick={() => handleTransaction('Withdraw')} className="px-4 py-2 border border-gray-300 bg-white text-gray-600 rounded font-bold text-sm hover:bg-gray-50">↑ Withdraw</button>
           <button onClick={() => handleTransaction('Reinvest')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold text-sm flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Reinvest
           </button>
           <button onClick={() => handleTransaction('Invest')} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-200">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Invest
           </button>
           <button onClick={() => handleTransaction('Deposit')} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-200">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Deposit
           </button>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left: Investment Tester (Dark Blue Card) */}
           <div className="bg-[#1e1b4b] rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-indigo-300 uppercase text-xs font-bold tracking-widest">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                 Investment Tester
              </div>
              
              <div className="mb-6">
                 <label className="text-xs text-indigo-200 block mb-2">Test Investment Amount (ZMW)</label>
                 <input 
                   type="number" 
                   value={calcAmount} 
                   onChange={(e) => setCalcAmount(e.target.value)}
                   className="w-full bg-indigo-900/50 border border-indigo-700 rounded p-3 text-white font-bold outline-none focus:border-indigo-400"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="bg-indigo-900/30 p-3 rounded border border-indigo-800">
                    <p className="text-[10px] text-indigo-300 uppercase">Monthly Payout</p>
                    <p className="text-xl font-bold">K {monthlyPayout.toLocaleString()}</p>
                    <p className="text-[10px] text-green-400">+25% Monthly</p>
                 </div>
                 <div className="bg-indigo-900/30 p-3 rounded border border-indigo-800">
                    <p className="text-[10px] text-indigo-300 uppercase">Total Return (8 Mo)</p>
                    <p className="text-xl font-bold">K {totalReturn.toLocaleString()}</p>
                    <p className="text-[10px] text-green-400">200% Total</p>
                 </div>
              </div>

              <p className="text-[10px] text-indigo-400 border-t border-indigo-900 pt-4">
                *Returns calculated at 25% of principal monthly for a fixed term of 8 months.
              </p>
           </div>

           {/* Right: Performance Stats */}
           <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-2 mb-2">
                 <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                 <h2 className="text-lg font-bold text-gray-900">Investment Performance</h2>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Invested</p>
                    <h3 className="text-2xl font-bold text-gray-900">K {Number(investor?.total_invested || 0).toLocaleString()}</h3>
                 </div>
                 <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Expected Return</p>
                    <h3 className="text-2xl font-bold text-gray-900">K {Number(investor?.expected_return || (investor?.total_invested * 2)).toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Over 8 Months</p>
                 </div>
                 <div className="bg-green-50 p-5 rounded-xl border border-green-100 shadow-sm">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Ready to Withdraw</p>
                    <h3 className="text-2xl font-bold text-gray-900">K {Number(investor?.wallet_balance || 0).toLocaleString()}</h3>
                    <div className="mt-2 flex gap-3 text-[10px] font-bold text-green-700 underline cursor-pointer">
                       <span>Withdraw</span>
                       <span>Reinvest</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100 text-xs text-orange-800">
                 <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 Payouts are processed automatically every month. Withdrawals typically take 24 hours.
              </div>

              {/* Tabs Section */}
              <div>
                 <div className="flex gap-8 border-b border-gray-200 mb-6">
                    <button className="pb-3 text-indigo-600 border-b-2 border-indigo-600 font-bold text-sm">Investment Opportunities</button>
                    <button className="pb-3 text-gray-500 hover:text-gray-700 font-medium text-sm">Active Portfolio (1)</button>
                    <button className="pb-3 text-gray-500 hover:text-gray-700 font-medium text-sm">Transaction History</button>
                 </div>

                 {/* Empty State */}
                 <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p className="text-gray-500">No new loan requests at the moment.</p>
                    <p className="text-xs text-gray-400">Check back later for approved loans.</p>
                 </div>
              </div>

           </div>
        </div>

      </main>
    </div>
  );
}