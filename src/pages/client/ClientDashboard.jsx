import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/SupabaseClient';

const ClientDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- PAYMENT MODAL STATE ---
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [repaymentType, setRepaymentType] = useState('partial'); // 'full' or 'partial'
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form Data
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  
  // File Uploads
  const [proofFile, setProofFile] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const [smsFile, setSmsFile] = useState(null);
  
  // Refs for file inputs
  const proofInputRef = useRef(null);
  const smsInputRef = useRef(null);

  // Network Config (Matching Screenshots)
  const NETWORKS = {
      MTN: { name: 'MTN MoMo', number: '096 123 4567', color: 'bg-yellow-400 text-yellow-900', border: 'border-yellow-400' },
      Airtel: { name: 'Airtel Money', number: '097 123 4567', color: 'bg-red-600 text-white', border: 'border-red-600' },
      Zamtel: { name: 'Zamtel Money', number: '095 123 4567', color: 'bg-green-600 text-white', border: 'border-green-600' }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUser(user);
        const { data: loanData } = await supabase
            .from('loans')
            .select('*, collateral(*)')
            .eq('borrower_id', user.id)
            .order('created_at', { ascending: false });
        
        if (loanData) {
            setLoans(loanData);
            const allCollateral = loanData.flatMap(l => l.collateral || []);
            setCollaterals(allCollateral);
        }
    }
    setLoading(false);
  };

  // --- STATS ---
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalRepayment = activeLoans.reduce((sum, l) => sum + (Number(l.total_repayment) || Number(l.amount) * 1.4), 0);
  const totalBalance = activeLoans.reduce((sum, l) => sum + (Number(l.balance) || 0), 0); 
  const nextPayment = activeLoans.length > 0 ? (totalBalance / 4) : 0; 

  // --- FILE HANDLING ---
  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'proof') setProofFile(file);
    if (type === 'sms') setSmsFile(file);

    // Upload immediately (or you can do it on submit)
    const fileName = `${user.id}/${Date.now()}_${type}_${file.name}`;
    const { data, error } = await supabase.storage.from('payment_proofs').upload(fileName, file);
    
    if (!error) {
       const { data: urlData } = supabase.storage.from('payment_proofs').getPublicUrl(fileName);
       if (type === 'proof') setProofUrl(urlData.publicUrl);
    } else {
       alert("Upload error: " + error.message);
    }
  };

  // --- SUBMIT PAYMENT ---
  const handlePaymentSubmit = async () => {
    if (!amountPaid || !transactionId || !paymentDate || !proofUrl) {
      return alert("Please fill in all required fields and upload proof of payment.");
    }
    
    setIsProcessing(true);

    const currentBalance = Number(selectedLoan.balance);
    const payVal = Number(amountPaid);
    const newBalance = Math.max(0, currentBalance - payVal);
    const newStatus = newBalance === 0 ? 'settled' : 'active';

    // Update Loan
    const { error } = await supabase
        .from('loans')
        .update({ balance: newBalance, status: newStatus })
        .eq('id', selectedLoan.id);

    // Record Transaction (if table exists)
    await supabase.from('transactions').insert([{
        loan_id: selectedLoan.id,
        profile_id: user.id,
        amount: payVal,
        type: 'repayment',
        // metadata: { transactionId, proofUrl } // Store these if you have a json column
    }]);

    if (error) alert("Payment Failed: " + error.message);
    else {
        alert("Payment Submitted for Verification!");
        fetchData();
        resetModal();
    }
    setIsProcessing(false);
  };

  const resetModal = () => {
      setSelectedLoan(null);
      setStep(1);
      setAmountPaid("");
      setTransactionId("");
      setPaymentDate("");
      setProofFile(null);
      setProofUrl("");
  };

  // Auto-fill amount based on type
  useEffect(() => {
    if (selectedLoan) {
        if (repaymentType === 'full') {
            setAmountPaid(selectedLoan.balance);
        } else {
            setAmountPaid(""); // Let user type
        }
    }
  }, [repaymentType, selectedLoan]);


  if (loading) return (
    <div className="flex-1 bg-gray-900 flex items-center justify-center text-white h-screen">
        <div className="animate-pulse">Loading Portal...</div>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
              <p className="text-gray-400 text-sm">Active Loan Amount</p>
              <p className="text-3xl font-bold text-white mt-2">K {totalPrincipal.toLocaleString()}</p>
              <div className="absolute top-6 right-6 p-2 bg-blue-900/30 text-blue-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
              <p className="text-gray-400 text-sm">Next Repayment</p>
              <p className="text-3xl font-bold text-white mt-2">K {nextPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <div className="absolute top-6 right-6 p-2 bg-orange-900/30 text-orange-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 relative">
              <p className="text-gray-400 text-sm">Active Collateral</p>
              <p className="text-3xl font-bold text-white mt-2">{collaterals.length} Items</p>
              <div className="absolute top-6 right-6 p-2 bg-emerald-900/30 text-emerald-400 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
          </div>
      </div>

      {/* Loans List */}
      <div className="grid grid-cols-1 gap-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-white mb-6">My Loans</h2>
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
                                      <span className="font-bold text-white">#{loan.id.slice(0,6)}</span>
                                      <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${loan.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                                          {loan.status}
                                      </span>
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
      </div>

      {/* --- PAYMENT MODAL (MATCHING SCREENSHOTS) --- */}
      {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
                  
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">Loan Repayment</h3>
                          <p className="text-xs text-gray-500">Loan #{selectedLoan.id.slice(0,6)}</p>
                      </div>
                      <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1. Select Network</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2. Verify & Submit</span>
                      </div>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 bg-white min-h-[400px]">
                      
                      {/* STEP 1: NETWORK SELECTION */}
                      {step === 1 && (
                          <div className="space-y-8 text-center animate-in fade-in">
                              <div>
                                  <h4 className="text-lg font-bold text-gray-800">Select Mobile Money Network</h4>
                                  <p className="text-sm text-gray-500">Choose the provider you will use to send the funds.</p>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                  {Object.keys(NETWORKS).map(net => (
                                      <button 
                                        key={net} 
                                        onClick={() => setSelectedNetwork(net)} 
                                        className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedNetwork === net ? `border-indigo-500 bg-indigo-50 shadow-md transform scale-105` : 'border-gray-100 hover:border-gray-300'}`}
                                      >
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${NETWORKS[net].color}`}>
                                              {net[0]}
                                          </div>
                                          <span className="text-sm font-bold text-gray-700">{NETWORKS[net].name}</span>
                                          {selectedNetwork === net && <div className="text-indigo-600"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg></div>}
                                      </button>
                                  ))}
                              </div>
                              
                              <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                      {/* QR Code Placeholder */}
                                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=tel:${NETWORKS[selectedNetwork].number}`} alt="QR" className="w-32 h-32" />
                                  </div>
                                  <div className="text-left space-y-2">
                                      <div>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Official Repayment Number</p>
                                          <p className="text-2xl font-mono font-bold text-gray-900">{NETWORKS[selectedNetwork].number}</p>
                                      </div>
                                      <div>
                                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Name</p>
                                          <p className="text-sm font-bold text-gray-700">DunkuLoans Ltd</p>
                                      </div>
                                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs font-mono inline-block">
                                          Ref: REF-{selectedLoan.id.slice(0,6)}
                                      </div>
                                  </div>
                              </div>

                              <button onClick={() => setStep(2)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">
                                  Continue to Verification
                              </button>
                          </div>
                      )}

                      {/* STEP 2: VERIFY & SUBMIT */}
                      {step === 2 && (
                          <div className="space-y-6 animate-in slide-in-from-right-8">
                              {/* Alert */}
                              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                  <p className="text-xs text-blue-800 leading-relaxed">
                                      Please ensure you have successfully sent the money before submitting this form. False claims will lead to account suspension.
                                  </p>
                              </div>

                              {/* Summary Line */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                      <p className="text-gray-500 text-xs">Selected Network</p>
                                      <p className="font-bold text-gray-800 flex items-center gap-2">
                                          <span className={`w-2 h-2 rounded-full ${NETWORKS[selectedNetwork].color.split(' ')[0]}`}></span>
                                          {NETWORKS[selectedNetwork].name}
                                      </p>
                                  </div>
                                  <div>
                                      <p className="text-gray-500 text-xs">Reference Code</p>
                                      <p className="font-mono text-gray-800">REF-{selectedLoan.id.slice(0,6)}</p>
                                  </div>
                              </div>

                              {/* Repayment Type Toggle */}
                              <div>
                                  <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">Select Repayment Type</label>
                                  <div className="grid grid-cols-2 gap-3">
                                      <button 
                                          onClick={() => setRepaymentType('full')}
                                          className={`p-3 rounded-lg border text-sm font-medium transition ${repaymentType === 'full' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                      >
                                          Full Repayment <br/><span className="text-[10px] font-normal opacity-70">Clear Balance</span>
                                      </button>
                                      <button 
                                          onClick={() => setRepaymentType('partial')}
                                          className={`p-3 rounded-lg border text-sm font-medium transition ${repaymentType === 'partial' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                      >
                                          Flexible Amount <br/><span className="text-[10px] font-normal opacity-70">Partial Pay</span>
                                      </button>
                                  </div>
                              </div>

                              {/* Inputs Row */}
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-bold text-gray-700">Amount Paid (ZMW)</label>
                                      <input 
                                          type="number" 
                                          className="w-full mt-1 p-3 bg-gray-900 text-white rounded-lg font-bold focus:ring-2 focus:ring-indigo-500 outline-none" 
                                          value={amountPaid}
                                          onChange={e => setAmountPaid(e.target.value)}
                                          readOnly={repaymentType === 'full'}
                                      />
                                      <p className="text-[10px] text-gray-400 mt-1">Outstanding: K {selectedLoan.balance.toLocaleString()}</p>
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-gray-700">Transaction ID</label>
                                      <input 
                                          type="text" 
                                          className="w-full mt-1 p-3 bg-gray-900 text-white rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
                                          placeholder="e.g. 1765432190"
                                          value={transactionId}
                                          onChange={e => setTransactionId(e.target.value)}
                                      />
                                      <p className="text-[10px] text-gray-400 mt-1">Found in your SMS receipt.</p>
                                  </div>
                              </div>

                              {/* Date Input */}
                              <div>
                                   <label className="text-xs font-bold text-gray-700">Payment Date & Time</label>
                                   <input 
                                      type="datetime-local" 
                                      className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:border-indigo-500 outline-none"
                                      value={paymentDate}
                                      onChange={e => setPaymentDate(e.target.value)}
                                   />
                              </div>

                              {/* Upload Areas */}
                              <div className="grid grid-cols-2 gap-4">
                                  <div 
                                    onClick={() => proofInputRef.current.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition"
                                  >
                                      <input type="file" hidden ref={proofInputRef} onChange={(e) => handleFileUpload(e, 'proof')} />
                                      {proofFile ? (
                                          <div className="text-green-600 text-xs font-bold flex items-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Uploaded</div>
                                      ) : (
                                          <>
                                            <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                            <span className="text-xs text-gray-500 font-medium">Proof of Payment</span>
                                            <span className="text-[10px] text-gray-400">(Image/PDF)</span>
                                          </>
                                      )}
                                  </div>
                                  <div 
                                    onClick={() => smsInputRef.current.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition"
                                  >
                                      <input type="file" hidden ref={smsInputRef} onChange={(e) => handleFileUpload(e, 'sms')} />
                                      <svg className="w-6 h-6 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                      <span className="text-xs text-gray-500 font-medium">SMS File</span>
                                      <span className="text-[10px] text-gray-400">(Optional)</span>
                                  </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-4 pt-4">
                                  <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Back</button>
                                  <button 
                                      onClick={handlePaymentSubmit}
                                      disabled={isProcessing}
                                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                                  >
                                      {isProcessing ? 'Verifying...' : 'Submit Payment'}
                                  </button>
                              </div>
                          </div>
                      )}

                  </div>

                  {/* Close Button */}
                  <button 
                      onClick={resetModal}
                      className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
              </div>
          </div>
      )}

    </div>
  );
};

export default ClientDashboard;