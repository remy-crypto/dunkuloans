import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/SupabaseClient';

const ClientDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [paymentForm, setPaymentForm] = useState({
      transactionId: '',
      amountPaid: '',
      paymentDate: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Network Config
  const NETWORKS = {
      MTN: { name: 'MTN MoMo', number: '096 123 4567', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
      Airtel: { name: 'Airtel Money', number: '097 123 4567', color: 'bg-red-500', textColor: 'text-white' },
      Zamtel: { name: 'Zamtel Money', number: '095 123 4567', color: 'bg-green-600', textColor: 'text-white' }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUser(user);
        // Fetch Loans
        const { data: loanData } = await supabase
            .from('loans')
            .select('*, collateral(*)')
            .eq('borrower_id', user.id)
            .order('created_at', { ascending: false });
        
        if (loanData) {
            setLoans(loanData);
            // Extract collateral from loans
            const allCollateral = loanData.flatMap(l => l.collateral || []);
            setCollaterals(allCollateral);
        }
    }
    setLoading(false);
  };

  // Stats Calculation
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalRepayment = activeLoans.reduce((sum, l) => sum + (Number(l.total_repayment) || Number(l.amount) * 1.4), 0);
  const totalBalance = activeLoans.reduce((sum, l) => sum + (Number(l.balance) || 0), 0); 
  const nextPayment = activeLoans.length > 0 ? (totalBalance / 4) : 0; 

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const currentBalance = Number(selectedLoan.balance);
    const payAmount = Number(paymentForm.amountPaid);
    const newBalance = Math.max(0, currentBalance - payAmount);
    const newStatus = newBalance === 0 ? 'settled' : 'active';

    const { error } = await supabase
        .from('loans')
        .update({ balance: newBalance, status: newStatus })
        .eq('id', selectedLoan.id);

    if (error) alert("Payment Failed: " + error.message);
    else {
        alert("Payment Recorded Successfully!");
        fetchData();
        resetModal();
    }
    setIsProcessing(false);
  };

  const resetModal = () => {
      setSelectedLoan(null);
      setStep(1);
      setPaymentForm({ transactionId: '', amountPaid: '', paymentDate: '' });
  };

  if (loading) return (
    <div className="flex-1 bg-gray-900 flex items-center justify-center text-white h-full">
        <div className="animate-pulse">Loading Borrower Portal...</div>
    </div>
  );

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full bg-gray-900 text-gray-100 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-2xl font-bold text-white">Borrower Portal</h1>
              <p className="text-gray-400 text-sm">Welcome back, {user?.email?.split('@')[0]}</p>
          </div>
          <div className="p-2 bg-gray-800 rounded-full border border-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          </div>
      </div>

      {/* KYC Banner */}
      <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3 mb-8">
        <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-orange-200">Identity Verification</h3>
          <p className="text-sm text-gray-400 mt-1">
            Upload your NRC and a selfie to unlock higher loan limits.
          </p>
        </div>
        <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
          Verify Now
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium text-sm">Active Loan Amount</h3>
                  <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  </div>
              </div>
              <p className="text-3xl font-bold text-white">K {totalPrincipal.toLocaleString()}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                  <span>Total Due:</span>
                  <span className="text-blue-400 font-bold">K {totalRepayment.toLocaleString()}</span>
              </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium text-sm">Next Repayment</h3>
                  <div className="p-2 bg-orange-900/30 text-orange-400 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
              </div>
              <p className="text-3xl font-bold text-white">K {nextPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                  <span>Estimated Weekly</span>
                  <span className="text-orange-400">Due Soon</span>
              </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-medium text-sm">Active Collateral</h3>
                  <div className="p-2 bg-emerald-900/30 text-emerald-400 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
              </div>
              <p className="text-3xl font-bold text-white">{collaterals.length} Items</p>
              <div className="flex justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-700">
                  <span>Status</span>
                  <span className="text-emerald-400">Secured</span>
                </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Loans List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">My Loans</h2>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      Download History
                  </button>
              </div>

              {loans.length === 0 ? <p className="text-gray-500 text-center py-8">No active loans.</p> : (
                  <div className="space-y-4">
                      {loans.map(loan => {
                          const total = Number(loan.total_repayment) || (Number(loan.amount) * 1.4);
                          const balance = Number(loan.balance);
                          const paid = total - balance;
                          const progress = Math.min(100, (paid / total) * 100);

                          return (
                              <div key={loan.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                                  <div className="flex justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                          <span className="font-bold text-white">#{loan.id.slice(0,6)}</span>
                                          <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${loan.status === 'active' ? 'bg-green-900 text-green-400 border border-green-700' : 'bg-gray-700 text-gray-400'}`}>
                                              {loan.status}
                                          </span>
                                      </div>
                                  </div>
                                  
                                  <div className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700">
                                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                                          <span>Remaining: <b className="text-indigo-400">K {balance.toLocaleString()}</b></span>
                                          <span>Total: K {total.toLocaleString()}</span>
                                      </div>
                                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                                          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                      </div>
                                      <div className="text-[10px] text-gray-500 text-right mt-1">{Math.round(progress)}% Paid</div>
                                  </div>

                                  {loan.status === 'active' && (
                                      <button 
                                          onClick={() => { setSelectedLoan(loan); setStep(1); }}
                                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                                      >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                          Make Payment
                                      </button>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>

          {/* Collateral List */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-white mb-6">My Collateral</h2>
              {collaterals.length === 0 ? <p className="text-gray-500 text-center py-8">No collateral recorded.</p> : (
                  <div className="space-y-4">
                      {collaterals.map(item => (
                          <div key={item.id} className="flex gap-4 p-3 bg-gray-900 rounded-lg border border-gray-700 items-center">
                              <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center text-gray-500">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                              </div>
                              <div>
                                  <h4 className="font-bold text-white text-sm">{item.description}</h4>
                                  <p className="text-xs text-gray-500">Est. Value: K {item.estimated_value}</p>
                              </div>
                              <div className="ml-auto">
                                  <span className="text-[10px] bg-green-900 text-green-400 px-2 py-1 rounded border border-green-800">
                                      APPROVED
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* Payment Modal */}
      {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-gray-800 rounded-xl w-full max-w-lg overflow-hidden border border-gray-700 shadow-2xl">
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                      <div>
                          <h3 className="text-lg font-bold text-white">Loan Repayment</h3>
                          <p className="text-xs text-gray-400">Loan #{selectedLoan.id.slice(0,6)}</p>
                      </div>
                      <button onClick={resetModal} className="text-gray-400 hover:text-white">✕</button>
                  </div>

                  <div className="p-6">
                      {step === 1 ? (
                          <div className="space-y-4">
                              <p className="text-gray-400 text-sm text-center mb-4">Select Mobile Money Network</p>
                              <div className="grid grid-cols-3 gap-3">
                                  {Object.keys(NETWORKS).map(net => (
                                      <button key={net} onClick={() => setSelectedNetwork(net)} className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${selectedNetwork === net ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 bg-gray-900 hover:bg-gray-800'}`}>
                                          <div className={`w-8 h-8 rounded-full ${NETWORKS[net].color}`}></div>
                                          <span className="text-xs font-bold text-white">{net}</span>
                                      </button>
                                  ))}
                              </div>
                              
                              <div className="bg-gray-900 p-4 rounded-lg text-center mt-4 border border-gray-700">
                                  <p className="text-xs text-gray-500 uppercase tracking-widest">Send Money To</p>
                                  <p className="text-2xl font-mono font-bold text-white my-2">{NETWORKS[selectedNetwork].number}</p>
                                  <div className="inline-block px-2 py-1 bg-gray-800 rounded text-xs text-indigo-400 font-mono border border-gray-700">
                                      Ref: LOAN-{selectedLoan.id.slice(0,6)}
                                  </div>
                              </div>

                              <button onClick={() => setStep(2)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg mt-4 transition-colors">
                                  Next Step
                              </button>
                          </div>
                      ) : (
                          <form onSubmit={handlePaymentSubmit} className="space-y-4">
                              <div>
                                  <label className="text-xs text-gray-400 uppercase font-bold">Amount Paid (ZMW)</label>
                                  <input type="number" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none mt-1" 
                                      placeholder="0.00"
                                      onChange={e => setPaymentForm({...paymentForm, amountPaid: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-400 uppercase font-bold">Transaction ID</label>
                                  <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none mt-1" 
                                      placeholder="e.g. 234987213"
                                      onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} />
                              </div>
                              
                              <div className="flex gap-2 mt-6">
                                  <button type="button" onClick={() => setStep(1)} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium">Back</button>
                                  <button type="submit" disabled={isProcessing} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-900/20">
                                      {isProcessing ? 'Verifying...' : 'Submit Payment'}
                                  </button>
                              </div>
                          </form>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ClientDashboard;