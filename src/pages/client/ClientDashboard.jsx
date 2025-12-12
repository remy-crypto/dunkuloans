import React, { useState, useEffect, useRef } from 'react';
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
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [repaymentType, setRepaymentType] = useState('partial');
  const [isProcessing, setIsProcessing] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [proofUrl, setProofUrl] = useState("");
  const proofInputRef = useRef(null);
  const smsInputRef = useRef(null);

  const NETWORKS = {
      MTN: { name: 'MTN MoMo', number: '096 123 4567', color: 'bg-yellow-400 text-yellow-900', border: 'border-yellow-400' },
      Airtel: { name: 'Airtel Money', number: '097 123 4567', color: 'bg-red-600 text-white', border: 'border-red-600' },
      Zamtel: { name: 'Zamtel Money', number: '095 123 4567', color: 'bg-green-600 text-white', border: 'border-green-600' }
  };

  useEffect(() => {
    fetchData();
    // Realtime subscription for loans and collateral updates
    const subLoans = supabase.channel('client-loans').on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchData).subscribe();
    const subCol = supabase.channel('client-col').on('postgres_changes', { event: '*', schema: 'public', table: 'collateral' }, fetchData).subscribe();

    return () => { supabase.removeChannel(subLoans); supabase.removeChannel(subCol); };
  }, []);

  const fetchData = async () => {
    // setLoading(true); // Don't block UI on refresh
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

  // Stats
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0);
  // Using total_repayment if available, else calculate standard 40% interest
  const totalRepaymentVal = activeLoans.reduce((sum, l) => sum + (Number(l.total_repayment) || Number(l.amount) * 1.4), 0);
  const totalBalance = activeLoans.reduce((sum, l) => sum + (Number(l.balance) || 0), 0); 
  const totalInterest = totalRepaymentVal - totalPrincipal;
  
  // File Upload Handler
  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;
    if (type === 'proof') setProofFile(file);

    const fileName = `${user.id}/${Date.now()}_${type}_${file.name}`;
    const { data, error } = await supabase.storage.from('payment_proofs').upload(fileName, file);
    
    if (!error) {
       const { data: urlData } = supabase.storage.from('payment_proofs').getPublicUrl(fileName);
       if (type === 'proof') setProofUrl(urlData.publicUrl);
    } else {
       alert("Upload error: " + error.message);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!amountPaid || !transactionId || !paymentDate) return alert("Please fill all fields.");
    setIsProcessing(true);

    const currentBalance = Number(selectedLoan.balance);
    const payVal = Number(amountPaid);
    const newBalance = Math.max(0, currentBalance - payVal);
    const newStatus = newBalance === 0 ? 'settled' : 'active';

    const { error } = await supabase.from('loans').update({ balance: newBalance, status: newStatus }).eq('id', selectedLoan.id);

    if (error) alert("Payment Failed: " + error.message);
    else {
        alert("Payment Submitted!");
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

  const exportHistory = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Loan ID,Amount,Balance,Status,Date\n"
      + loans.map(l => `${l.id},${l.amount},${l.balance},${l.status},${new Date(l.created_at).toLocaleDateString()}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "loan_history.csv");
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white animate-pulse">Loading Portal...</div>;

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full bg-gray-900 text-gray-100 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-2xl font-bold text-white">Welcome, {user?.email?.split('@')[0]}</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="p-2 bg-gray-800 rounded-full border border-gray-700 cursor-pointer">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
             </div>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Loan Amount */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-500">Active Loan Amount</p>
                  <div className="p-1.5 bg-blue-50 text-blue-500 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">K {totalPrincipal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs">
                 <span className="text-gray-400">Loan Interest: <span className="text-orange-500 font-medium">K {totalInterest.toLocaleString()}</span></span>
                 <span className="text-gray-500">Total with interest: <b>K {totalRepaymentVal.toLocaleString()}</b></span>
              </div>
          </div>

          {/* Loan Repayment */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-500">Loan Repayment</p>
                  <div className="p-1.5 bg-orange-50 text-orange-500 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">K {totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                 Due Date: <span className="text-gray-900 font-medium">11/16/2023</span>
              </div>
          </div>

          {/* Active Collateral */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-gray-500">Active Collateral</p>
                  <div className="p-1.5 bg-green-50 text-green-500 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-2">{collaterals.length} Items</p>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                 Secured Assets
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Loans List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">My Loans</h2>
                  <button onClick={exportHistory} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Download History
                  </button>
              </div>

              {loans.length === 0 ? <p className="text-gray-400 text-center py-8">No active loans.</p> : (
                  <div className="space-y-6">
                      {loans.map(loan => {
                          const total = Number(loan.total_repayment) || (Number(loan.amount) * 1.4);
                          const balance = Number(loan.balance);
                          const paid = total - balance;
                          const progress = Math.min(100, (paid / total) * 100);
                          const collateralDesc = loan.collateral?.[0]?.description || "Unsecured";

                          return (
                              <div key={loan.id} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <h4 className="font-bold text-gray-900">Loan #{loan.id.slice(0,2).toUpperCase()}1</h4>
                                          <p className="text-xs text-gray-500 mt-1">Secured by: {collateralDesc}</p>
                                      </div>
                                      <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${loan.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                          {loan.status}
                                      </span>
                                  </div>
                                  
                                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                                      <span>Remaining Balance <br/><b className="text-lg text-indigo-600">K {balance.toLocaleString()}</b></span>
                                      <span className="text-right">Principal + Interest <br/><b className="text-gray-800">K {total.toLocaleString()}</b></span>
                                  </div>

                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                      <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                  </div>
                                  <div className="flex justify-between text-[10px] text-gray-400 mt-1 mb-4">
                                      <span>{Math.round(progress)}% Paid</span>
                                      <span>K {paid.toLocaleString()} Paid so far</span>
                                  </div>

                                  {loan.status === 'active' && (
                                      <button 
                                          onClick={() => { setSelectedLoan(loan); setStep(1); }}
                                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
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

          {/* My Collateral List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-6">My Collateral</h2>
              {collaterals.length === 0 ? <p className="text-gray-400 text-center py-8">No collateral recorded.</p> : (
                  <div className="space-y-4">
                      {collaterals.map(item => (
                          <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {item.image_url ? (
                                      <img src={item.image_url} alt="Item" className="w-full h-full object-cover" />
                                  ) : (
                                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                  )}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <h4 className="font-bold text-gray-900 text-sm">{item.description}</h4>
                                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">
                                          APPROVED
                                      </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Electronics • Est. K {item.estimated_value}</p>
                                  <button className="text-xs text-indigo-600 hover:underline mt-2">View Valuation Report</button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* Payment Modal */}
      {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95">
                  <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">Loan Repayment</h3>
                          <p className="text-xs text-gray-500">Loan #{selectedLoan.id.slice(0,6)}</p>
                      </div>
                      <div className="flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1. Select Network</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2. Verify & Submit</span>
                      </div>
                      <button onClick={resetModal} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                  </div>

                  <div className="p-8 bg-white min-h-[400px]">
                      {step === 1 ? (
                          <div className="space-y-8 text-center">
                              <div>
                                  <h4 className="text-lg font-bold text-gray-800">Select Mobile Money Network</h4>
                                  <p className="text-sm text-gray-500">Choose the provider you will use to send the funds.</p>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                  {Object.keys(NETWORKS).map(net => (
                                      <button key={net} onClick={() => setSelectedNetwork(net)} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selectedNetwork === net ? `border-indigo-500 bg-indigo-50 shadow-md transform scale-105` : 'border-gray-100 hover:border-gray-300'}`}>
                                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${NETWORKS[net].color}`}>{net[0]}</div>
                                          <span className="text-sm font-bold text-gray-700">{NETWORKS[net].name}</span>
                                      </button>
                                  ))}
                              </div>
                              <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=tel:${NETWORKS[selectedNetwork].number}`} alt="QR" className="w-32 h-32" />
                                  </div>
                                  <div className="text-left space-y-2">
                                      <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Official Repayment Number</p><p className="text-2xl font-mono font-bold text-gray-900">{NETWORKS[selectedNetwork].number}</p></div>
                                      <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Account Name</p><p className="text-sm font-bold text-gray-700">DunkuLoans Ltd</p></div>
                                      <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs font-mono inline-block">Ref: REF-{selectedLoan.id.slice(0,6)}</div>
                                  </div>
                              </div>
                              <button onClick={() => setStep(2)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">Continue</button>
                          </div>
                      ) : (
                          <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                  <div><label className="text-xs font-bold text-gray-700">Amount Paid (ZMW)</label><input type="number" className="w-full mt-1 p-3 bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-900 outline-none" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} /></div>
                                  <div><label className="text-xs font-bold text-gray-700">Transaction ID</label><input type="text" className="w-full mt-1 p-3 bg-gray-100 border border-gray-300 rounded-lg font-mono text-gray-900 outline-none" placeholder="e.g. 1765432190" value={transactionId} onChange={e => setTransactionId(e.target.value)} /></div>
                              </div>
                              <div><label className="text-xs font-bold text-gray-700">Payment Date</label><input type="datetime-local" className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm text-gray-700 outline-none" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} /></div>
                              <div className="grid grid-cols-2 gap-4">
                                  <div onClick={() => proofInputRef.current.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
                                      <input type="file" hidden ref={proofInputRef} onChange={(e) => handleFileUpload(e, 'proof')} />
                                      {proofFile ? <div className="text-green-600 text-xs font-bold">Uploaded</div> : <><span className="text-xs text-gray-500 font-medium">Proof of Payment</span><span className="text-[10px] text-gray-400">(Image/PDF)</span></>}
                                  </div>
                                  <div onClick={() => smsInputRef.current.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
                                      <input type="file" hidden ref={smsInputRef} />
                                      <span className="text-xs text-gray-500 font-medium">SMS File</span><span className="text-[10px] text-gray-400">(Optional)</span>
                                  </div>
                              </div>
                              <div className="flex gap-4 pt-4">
                                  <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50">Back</button>
                                  <button onClick={handlePaymentSubmit} disabled={isProcessing} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50">{isProcessing ? 'Verifying...' : 'Submit Payment'}</button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ClientDashboard;