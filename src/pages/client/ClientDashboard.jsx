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

  // --- DYNAMIC NETWORKS STATE ---
  const [networks, setNetworks] = useState({
      MTN: { name: 'MTN MoMo', number: 'Loading...', color: 'bg-yellow-400 text-yellow-900', border: 'border-yellow-400', account: 'Loading...' },
      Airtel: { name: 'Airtel Money', number: 'Loading...', color: 'bg-red-600 text-white', border: 'border-red-600', account: 'Loading...' },
      Zamtel: { name: 'Zamtel Money', number: 'Loading...', color: 'bg-green-600 text-white', border: 'border-green-600', account: 'Loading...' }
  });

  // --- FETCH DATA & REALTIME SUBSCRIPTIONS ---
  useEffect(() => {
    fetchData();
    fetchPaymentSettings();
    
    const subLoans = supabase.channel('client-loans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchData)
      .subscribe();
    
    const subCol = supabase.channel('client-col')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collateral' }, fetchData)
      .subscribe();
    
    return () => { supabase.removeChannel(subLoans); supabase.removeChannel(subCol); };
  }, []);

  // --- FETCH PAYMENT SETTINGS ---
  const fetchPaymentSettings = async () => {
    const { data, error } = await supabase.from('payment_settings').select('*');
    if (!error && data) {
      setNetworks(prev => {
        const updated = { ...prev };
        data.forEach(setting => {
          if (updated[setting.network]) {
            updated[setting.network].number = setting.phone_number;
            updated[setting.network].account = setting.account_name;
          }
        });
        return updated;
      });
    }
  };

  const fetchData = async () => {
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

  // --- HELPER FUNCTIONS FOR DUE DATES ---
  const getDueDate = (loan) => {
    if (!loan?.created_at) return "-";
    const created = new Date(loan.created_at);
    const due = new Date(created);
    due.setDate(due.getDate() + (loan.payment_terms_days || 30));
    return due.toLocaleDateString("en-US");
  };

  const getNextDueDate = () => {
    const activeLoans = loans.filter(l => l.status === 'active');
    if (!activeLoans.length) return "-";
    const dueDates = activeLoans.map(l => {
      const created = new Date(l.created_at);
      const due = new Date(created);
      due.setDate(due.getDate() + (l.payment_terms_days || 30));
      return due;
    });
    const nextDue = dueDates.sort((a,b) => a - b)[0];
    return nextDue.toLocaleDateString("en-US");
  };

  // --- STATS ---
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalRepaymentVal = activeLoans.reduce((sum, l) => sum + (Number(l.total_repayment) || Number(l.amount) * 1.4), 0);
  const totalBalance = activeLoans.reduce((sum, l) => sum + (Number(l.balance) || 0), 0); 
  const totalInterest = totalRepaymentVal - totalPrincipal;

  // --- FILE UPLOAD ---
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

  // --- PAYMENT SUBMIT ---
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

  // --- EXPORT LOAN HISTORY ---
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
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Loan Amount */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Active Loan Amount</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">K {totalPrincipal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs">
                 <span className="text-gray-400">Loan Interest: <span className="text-orange-500 font-medium">K {totalInterest.toLocaleString()}</span></span>
                 <span className="text-gray-500">Total with interest: <b>K {totalRepaymentVal.toLocaleString()}</b></span>
              </div>
          </div>

          {/* Loan Repayment */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Loan Repayment</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">K {totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                 Next Due Date: <span className="text-gray-900 font-medium">{getNextDueDate()}</span>
              </div>
          </div>

          {/* Active Collateral */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-medium text-gray-500">Active Collateral</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{collaterals.length} Items</p>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">Secured Assets</div>
          </div>
      </div>

      {/* Loan List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">My Loans</h2>
                  <button onClick={exportHistory} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">Download History</button>
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
                                  <div className="mt-2 text-xs text-gray-500">
                                      Due Date: <span className="text-gray-900 font-medium">{getDueDate(loan)}</span>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>

          {/* Collateral List */}
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
                                          {item.status.replace('_', ' ')}
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

    </div>
  );
};

export default ClientDashboard;
