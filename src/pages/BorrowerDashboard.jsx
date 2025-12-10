import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/SupabaseClient';
import Sidebar from '../components/Sidebar';
import { CreditCard, Clock, CheckCircle2, TrendingUp, Download, ShieldAlert, Upload, Smartphone, FileText, Wallet, Loader2, Package } from 'lucide-react';

const BorrowerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [collaterals, setCollaterals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [repaymentType, setRepaymentType] = useState('PARTIAL');
  const [paymentForm, setPaymentForm] = useState({
      transactionId: '',
      amountPaid: '',
      paymentDate: '',
      proofFile: null
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
            .select('*')
            .eq('borrower_id', user.id)
            .order('created_at', { ascending: false });
        
        if (loanData) setLoans(loanData);

        // Fetch Collateral (Mock logic if table not fully linked yet, or fetch from collateral table)
        const { data: colData } = await supabase
            .from('collateral')
            .select('*')
            //.eq('owner_id', user.id); // Uncomment if owner_id exists
        
        if (colData) setCollaterals(colData);
    }
    setLoading(false);
  };

  // Stats
  const activeLoans = loans.filter(l => l.status === 'active');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalRepayment = activeLoans.reduce((sum, l) => sum + (Number(l.balance) || 0), 0); // Using balance as repayment needed
  const nextPayment = activeLoans.length > 0 ? (Number(activeLoans[0].balance) / 4) : 0; // Mock weekly payment

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Payment Processing
    const newBalance = Math.max(0, (selectedLoan.balance || selectedLoan.amount) - Number(paymentForm.amountPaid));
    const newStatus = newBalance === 0 ? 'settled' : 'active';

    const { error } = await supabase
        .from('loans')
        .update({ balance: newBalance, status: newStatus })
        .eq('id', selectedLoan.id);

    if (error) alert("Payment Failed: " + error.message);
    else {
        alert("Payment Recorded! Pending Verification.");
        fetchData();
        resetModal();
    }
    setIsProcessing(false);
  };

  const resetModal = () => {
      setSelectedLoan(null);
      setStep(1);
      setPaymentForm({ transactionId: '', amountPaid: '', paymentDate: '', proofFile: null });
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* KYC Banner (Mock Check) */}
        <div className="bg-orange-900/30 border border-orange-700/50 rounded-xl p-4 flex items-start gap-3 mb-8">
          <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-200">Identity Verification Required</h3>
            <p className="text-sm text-gray-400 mt-1">
              Your account is limited. Upload ID to unlock higher limits.
            </p>
          </div>
          <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
            Verify Now
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium text-sm">Active Loan Amount</h3>
                    <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-white">K {totalPrincipal.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Total Due: <span className="text-blue-400">K {totalRepayment.toLocaleString()}</span></p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium text-sm">Next Repayment</h3>
                    <div className="p-2 bg-orange-900/30 text-orange-400 rounded-lg"><Clock className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-white">K {nextPayment.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">Estimated Weekly</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 font-medium text-sm">Active Collateral</h3>
                    <div className="p-2 bg-emerald-900/30 text-emerald-400 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
                </div>
                <p className="text-3xl font-bold text-white">{collaterals.length} Items</p>
                <p className="text-xs text-gray-500 mt-2">Secured Assets</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Loans List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">My Loans</h2>
                    <button className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <Download className="w-4 h-4" /> History
                    </button>
                </div>

                {loans.length === 0 ? <p className="text-gray-500">No active loans.</p> : (
                    <div className="space-y-4">
                        {loans.map(loan => {
                            const total = Number(loan.amount) * 1.4; // Mock Interest
                            const balance = Number(loan.balance) || total;
                            const paid = total - balance;
                            const progress = (paid / total) * 100;

                            return (
                                <div key={loan.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-white">#{loan.id.slice(0,6)}</span>
                                        <span className={`px-2 text-xs rounded uppercase font-bold ${loan.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'}`}>{loan.status}</span>
                                    </div>
                                    
                                    <div className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700">
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Remaining: <b className="text-indigo-400">K {balance.toLocaleString()}</b></span>
                                            <span>Total: K {total.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>

                                    {loan.status === 'active' && (
                                        <button 
                                            onClick={() => { setSelectedLoan(loan); setStep(1); }}
                                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center justify-center gap-2 text-sm font-bold"
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

            {/* Collateral List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h2 className="text-lg font-bold text-white mb-6">My Collateral</h2>
                {collaterals.length === 0 ? <p className="text-gray-500">No collateral recorded.</p> : (
                    <div className="space-y-4">
                        {collaterals.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                                <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                                    <Package className="text-gray-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{item.description}</h4>
                                    <p className="text-xs text-gray-500">Est. Value: K {item.estimated_value}</p>
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
                <div className="bg-gray-800 rounded-xl w-full max-w-lg overflow-hidden border border-gray-700">
                    <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Loan Repayment</h3>
                        <button onClick={resetModal} className="text-gray-400 hover:text-white">✕</button>
                    </div>

                    <div className="p-6">
                        {step === 1 ? (
                            <div className="space-y-4">
                                <p className="text-gray-400 text-sm text-center mb-4">Select Mobile Money Network</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {Object.keys(NETWORKS).map(net => (
                                        <button key={net} onClick={() => setSelectedNetwork(net)} className={`p-4 rounded-lg border-2 flex flex-col items-center gap-2 ${selectedNetwork === net ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 bg-gray-900'}`}>
                                            <div className={`w-8 h-8 rounded-full ${NETWORKS[net].color}`}></div>
                                            <span className="text-xs font-bold text-white">{net}</span>
                                        </button>
                                    ))}
                                </div>
                                
                                <div className="bg-gray-900 p-4 rounded-lg text-center mt-4">
                                    <p className="text-xs text-gray-500 uppercase">Send Money To</p>
                                    <p className="text-xl font-mono font-bold text-white my-1">{NETWORKS[selectedNetwork].number}</p>
                                    <p className="text-xs text-indigo-400">Ref: LOAN-{selectedLoan.id.slice(0,6)}</p>
                                </div>

                                <button onClick={() => setStep(2)} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg mt-4">Next Step</button>
                            </div>
                        ) : (
                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400">Amount Paid (ZMW)</label>
                                    <input type="number" required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" 
                                        onChange={e => setPaymentForm({...paymentForm, amountPaid: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400">Transaction ID</label>
                                    <input type="text" required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" 
                                        onChange={e => setPaymentForm({...paymentForm, transactionId: e.target.value})} />
                                </div>
                                
                                <div className="flex gap-2 mt-4">
                                    <button type="button" onClick={() => setStep(1)} className="px-4 py-2 bg-gray-700 text-white rounded">Back</button>
                                    <button type="submit" disabled={isProcessing} className="flex-1 py-2 bg-green-600 text-white rounded font-bold">
                                        {isProcessing ? 'Verifying...' : 'Submit Payment'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default BorrowerDashboard;