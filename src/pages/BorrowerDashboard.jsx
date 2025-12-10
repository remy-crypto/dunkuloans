import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/SupabaseClient";

const BorrowerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [collateral, setCollateral] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeAmount: 0, repayment: 0, collateralCount: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setUser(user);
      
      // 1. Fetch Loans & Collateral linked to loans
      const { data: loanData, error } = await supabase
        .from("loans")
        .select("*, collateral(*)")
        .eq("borrower_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && loanData) {
        setLoans(loanData);

        // Flatten collateral for the "My Collateral" list
        const allCollateral = loanData.flatMap(l => l.collateral || []);
        setCollateral(allCollateral);

        // Calculate Stats
        const active = loanData.filter(l => l.status === 'active');
        const activeAmt = active.reduce((sum, l) => sum + Number(l.amount), 0);
        const repaymentAmt = active.reduce((sum, l) => sum + Number(l.balance), 0); // Balance implies repayment needed

        setStats({
          activeAmount: activeAmt,
          repayment: repaymentAmt,
          collateralCount: allCollateral.length
        });
      }
    }
    setLoading(false);
  };

  const handlePayment = async (loan) => {
    const amount = prompt("Enter amount to pay (ZMW):");
    if (!amount || isNaN(amount)) return;

    // Simulate payment logic (Update balance)
    const newBalance = Math.max(0, loan.balance - Number(amount));
    const newStatus = newBalance === 0 ? 'settled' : loan.status;

    const { error } = await supabase
      .from('loans')
      .update({ balance: newBalance, status: newStatus })
      .eq('id', loan.id);

    if (error) alert("Payment failed: " + error.message);
    else {
      alert("Payment Successful!");
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
        <div className="animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome, <span className="text-indigo-400">{user?.email?.split('@')[0]}</span>
          </h1>
          <div className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 cursor-pointer relative">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Loan Amount */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-400">Active Loan Amount</p>
              <div className="p-1.5 bg-sky-900/30 rounded text-sky-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">K {stats.activeAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
              <span>Loan Interest:</span>
              <span className="text-gray-300 font-medium">K {(stats.activeAmount * 0.4).toLocaleString()}</span>
            </div>
          </div>

          {/* Loan Repayment */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-400">Loan Repayment</p>
              <div className="p-1.5 bg-orange-900/30 rounded text-orange-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">K {stats.repayment.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
            <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
              <span>Due Date:</span>
              <span className="text-gray-300 font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Active Collateral */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-gray-400">Active Collateral</p>
              <div className="p-1.5 bg-green-900/30 rounded text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{stats.collateralCount} Items</h2>
            <p className="text-xs text-gray-500 mt-2">Secured Assets</p>
          </div>
        </div>

        {/* Main Content Grid (Loans & Collateral) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: My Loans */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">My Loans</h3>
              <button className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download History
              </button>
            </div>

            {loans.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active loans found. <br/><a href="/apply" className="text-indigo-400 underline">Apply for one?</a></p>
            ) : (
              <div className="space-y-6">
                {loans.map(loan => {
                  const total = loan.total_repayment || (loan.amount * 1.4);
                  const paid = total - loan.balance;
                  const progress = Math.min(100, (paid / total) * 100);
                  const collateralName = loan.collateral?.[0]?.description || "Unsecured";

                  return (
                    <div key={loan.id} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-white">Loan #{loan.id.slice(0,6).toUpperCase()}</h4>
                          <p className="text-xs text-gray-400 mt-1">Secured by: {collateralName}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${
                          loan.status === 'active' ? 'bg-sky-900 text-sky-300 border border-sky-700' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {loan.status}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm mb-2">
                        <div>
                          <p className="text-xs text-gray-500">Remaining Balance</p>
                          <p className="text-xl font-bold text-sky-400">K {loan.balance.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Principal + Interest</p>
                          <p className="text-white font-medium">K {total.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div className="bg-sky-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span>{Math.round(progress)}% Paid</span>
                        <span>K {paid.toLocaleString()} Paid so far</span>
                      </div>

                      {loan.status === 'active' && (
                        <button 
                          onClick={() => handlePayment(loan)}
                          className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded font-medium transition shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                          Make Payment
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: My Collateral */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-bold text-white mb-6">My Collateral</h3>
            
            {collateral.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No collateral recorded.</p>
            ) : (
              <div className="space-y-4">
                {collateral.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 items-center">
                    {/* Placeholder Image (or real URL if exists) */}
                    <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt="Item" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-white text-sm">{item.description}</h4>
                        <span className="text-[10px] bg-green-900 text-green-400 px-1.5 py-0.5 rounded border border-green-800 uppercase">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Est. Value: K {item.estimated_value?.toLocaleString()}</p>
                      <button className="text-xs text-sky-400 hover:text-sky-300 mt-2">View Valuation Report</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default BorrowerDashboard;