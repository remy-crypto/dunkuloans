import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  CreditCard, Clock, CheckCircle2, TrendingUp, Download, 
  Wallet, ShieldAlert, Loader2, Package 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const NETWORKS = {
    MTN: { name: 'MTN MoMo', number: '096 123 4567', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
    Airtel: { name: 'Airtel Money', number: '097 123 4567', color: 'bg-red-500', textColor: 'text-white' },
    Zamtel: { name: 'Zamtel Money', number: '095 123 4567', color: 'bg-green-600', textColor: 'text-white' }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // 1. Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // 2. Fetch Loans
      const { data: loansData, error } = await supabase
        .from('loans')
        .select('*')
        .eq('borrower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(loansData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      alert("Payment Submitted! Pending Admin Approval.");
      setIsProcessing(false);
      setSelectedLoan(null);
      setStep(1);
    }, 1500);
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(amount);

  // Stats Logic
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'pending');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalRepayment = activeLoans.reduce((sum, l) => sum + (l.total_repayment || 0), 0);
  const totalInterest = totalRepayment - totalPrincipal;

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content */}
      <main className="flex-1 p-8 ml-0 md:ml-64 lg:ml-72 transition-all">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome, {profile?.full_name || "Client"}
            </h1>
            <p className="text-slate-500 text-sm">Your financial overview</p>
          </div>
          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
            {profile?.full_name?.[0] || "U"}
          </div>
        </header>

        {/* Stats Grid - MATCHING SCREENSHOT 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Active Loan Amount */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">Active Loan Amount</h3>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mb-4">{formatCurrency(totalPrincipal)}</p>
            <div className="flex justify-between text-xs border-t border-slate-50 pt-3">
              <span className="text-slate-400">Loan Interest:</span>
              <span className="font-bold text-orange-500">{formatCurrency(totalInterest)}</span>
            </div>
          </div>

          {/* Card 2: Loan Repayment */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">Total Repayment</h3>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mb-4">{formatCurrency(totalRepayment)}</p>
            <div className="flex justify-between text-xs border-t border-slate-50 pt-3">
              <span className="text-slate-400">Total Due:</span>
              <span className="font-bold text-slate-700">{formatCurrency(totalRepayment)}</span>
            </div>
          </div>

          {/* Card 3: Active Collateral */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-slate-500 font-medium text-xs uppercase tracking-wider">Active Collateral</h3>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mb-4">0 Items</p>
            <div className="flex justify-between text-xs border-t border-slate-50 pt-3">
              <span className="text-slate-400">Secured Assets</span>
              <span className="font-bold text-emerald-600">Verified</span>
            </div>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: My Loans List (Matches Screenshot 1) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">My Loans</h2>
              <button className="text-sm text-indigo-600 font-bold flex items-center gap-1 hover:underline">
                <Download className="w-4 h-4" /> Download History
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : loans.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-400 mb-4">No active loans.</p>
                <button className="text-indigo-600 font-bold">Apply Now</button>
              </div>
            ) : (
              <div className="space-y-4">
                {loans.map(loan => {
                  const percent = ((loan.total_repayment - loan.balance) / loan.total_repayment) * 100;
                  return (
                    <div key={loan.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">Loan #{loan.id.slice(0, 4)}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              loan.status === 'active' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                              loan.status === 'settled' ? 'bg-green-50 text-green-600 border border-green-100' :
                              'bg-yellow-50 text-yellow-600 border border-yellow-100'
                            }`}>
                              {loan.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Secured by: Laptop (Example)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Principal + Interest</p>
                          <p className="text-sm font-bold text-slate-800">{formatCurrency(loan.total_repayment)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-bold text-slate-700">Remaining Balance</span>
                          <span className="font-bold text-indigo-600">{formatCurrency(loan.balance)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(5, percent)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>{percent.toFixed(0)}% Paid</span>
                          <span>K 0.00 Paid so far</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {loan.status === 'active' && (
                        <button 
                          onClick={() => { setSelectedLoan(loan); setStep(1); }}
                          className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                        >
                          <Wallet className="w-4 h-4" /> Make Payment
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Collateral (Matches Screenshot 1) */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-6">My Collateral</h2>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">MacBook Pro</h4>
                    <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100 font-bold">APPROVED</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Electronics • Est. K 25,000</p>
                  <button className="text-xs text-indigo-600 font-bold mt-2 hover:underline">View Valuation Report</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Payment Modal (Overlay) */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Make Payment</h3>
              <button onClick={() => setSelectedLoan(null)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
              {step === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 text-center mb-6">Select your mobile money provider</p>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.keys(NETWORKS).map(net => (
                      <button
                        key={net}
                        onClick={() => setSelectedNetwork(net)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                          selectedNetwork === net 
                          ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-105' 
                          : 'border-slate-100 hover:border-indigo-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${NETWORKS[net].color}`}>
                          {net[0]}
                        </div>
                        <span className="font-bold text-xs text-slate-700">{NETWORKS[net].name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100 mt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Send Money To</p>
                    <p className="text-2xl font-mono font-bold text-slate-800 my-1">{NETWORKS[selectedNetwork].number}</p>
                    <p className="text-xs text-slate-500">DunkuLoans Ltd</p>
                  </div>

                  <button onClick={() => setStep(2)} className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 mt-4 shadow-lg shadow-indigo-200">
                    Continue
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Ensure you have sent the money before submitting.
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount Paid</label>
                    <input type="number" required className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction ID</label>
                    <input type="text" required placeholder="e.g. 17654321" className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Back</button>
                    <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Proof'}
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
}