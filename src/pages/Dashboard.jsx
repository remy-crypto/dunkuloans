import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/SupabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, Clock, CheckCircle2, TrendingUp, Download, Upload, 
  Smartphone, FileText, Wallet, ShieldAlert, Loader2, Package 
} from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [repaymentType, setRepaymentType] = useState('PARTIAL');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    amountPaid: '',
    paymentDate: '',
    proofFile: null,
    messageFile: null
  });

  // Networks Config
  const NETWORKS = {
    MTN: { name: 'MTN MoMo', number: '096 123 4567', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
    Airtel: { name: 'Airtel Money', number: '097 123 4567', color: 'bg-red-500', textColor: 'text-white' },
    Zamtel: { name: 'Zamtel Money', number: '095 123 4567', color: 'bg-green-600', textColor: 'text-white' }
  };

  // Fetch Data
  useEffect(() => {
    if (!user) return;
    fetchLoans();
  }, [user]);

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('borrower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'pending');
  const totalPrincipal = activeLoans.reduce((sum, l) => sum + l.amount, 0);
  const totalRepaymentWithInterest = activeLoans.reduce((sum, l) => sum + l.total_repayment, 0);
  const totalInterest = totalRepaymentWithInterest - totalPrincipal;

  // Handlers
  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentForm(prev => ({ ...prev, [type === 'proof' ? 'proofFile' : 'messageFile']: file }));
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Upload Proof (Mocking upload for now - you would implement storage here)
      // const proofPath = await uploadFile(paymentForm.proofFile);

      // 2. Create Transaction Record
      const { error } = await supabase.from('transactions').insert([
        {
          loan_id: selectedLoan.id,
          profile_id: user.id,
          amount: parseFloat(paymentForm.amountPaid),
          type: 'repayment',
          // metadata: { network: selectedNetwork, transactionId: paymentForm.transactionId }
        }
      ]);

      if (error) throw error;

      alert('Payment Submitted for Verification!');
      setSelectedLoan(null);
      setStep(1);
      
    } catch (error) {
      alert('Error submitting payment: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-ZM', { style: 'currency', currency: 'ZMW' }).format(amount);

  if (!user) return <div className="p-8 text-center">Please log in.</div>;
  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Loan Amount */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Active Loan Amount</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPrincipal)}</p>
          <div className="mt-4 border-t border-gray-100 pt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Interest:</span>
              <span className="font-medium text-orange-600">{formatCurrency(totalInterest)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Total Due:</span>
              <span className="font-bold text-blue-700">{formatCurrency(totalRepaymentWithInterest)}</span>
            </div>
          </div>
        </div>

        {/* Loan Repayment */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Total Repayment</h3>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalRepaymentWithInterest)}</p>
          <p className="text-sm text-gray-500 mt-2">Next Due: <span className="font-medium text-gray-900">--</span></p>
        </div>

        {/* Active Collateral */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium text-sm">Active Collateral</h3>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">0 Items</p>
          <p className="text-sm text-gray-400 mt-2">Secured Assets</p>
        </div>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">My Loans</h2>
          <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
            <Download className="w-4 h-4" /> Download History
          </button>
        </div>

        {loans.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No active loans found.</div>
        ) : (
          <div className="space-y-4">
            {loans.map(loan => {
              const progress = ((loan.total_repayment - loan.balance) / loan.total_repayment) * 100;
              
              return (
                <div key={loan.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">Loan #{loan.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-gray-500">Status: <span className="capitalize">{loan.status}</span></p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${loan.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {loan.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Remaining Balance</span>
                      <span className="font-bold text-blue-600">{formatCurrency(loan.balance)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{progress.toFixed(0)}% Paid</span>
                      <span>Total: {formatCurrency(loan.total_repayment)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedLoan(loan); setStep(1); }}
                      className="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Wallet className="w-4 h-4" /> Make Payment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Loan Repayment</h3>
                <p className="text-xs text-gray-500">Loan #{selectedLoan.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedLoan(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>

            <div className="p-6">
              {step === 1 ? (
                /* Step 1: Select Network */
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="font-bold text-gray-800">Select Network</h4>
                    <p className="text-sm text-gray-500">Choose your mobile money provider.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {Object.keys(NETWORKS).map(net => (
                      <button
                        key={net}
                        onClick={() => setSelectedNetwork(net)}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${selectedNetwork === net ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-200'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${NETWORKS[net].color}`}>
                          {net[0]}
                        </div>
                        <span className="font-bold text-sm">{NETWORKS[net].name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-bold uppercase">Send Money To</p>
                    <p className="text-2xl font-mono font-bold text-gray-900 my-2">{NETWORKS[selectedNetwork].number}</p>
                    <p className="text-sm text-gray-600">DunkuLoans Ltd</p>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    Continue <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Step 2: Payment Form */
                <form onSubmit={handleSubmitPayment} className="space-y-5">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
                    <ShieldAlert className="w-4 h-4 mt-0.5" />
                    Ensure you have sent the money before submitting.
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (ZMW)</label>
                    <input 
                      type="number" 
                      required 
                      className="w-full border border-gray-300 rounded-lg p-2.5"
                      value={paymentForm.amountPaid}
                      onChange={(e) => setPaymentForm({...paymentForm, amountPaid: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full border border-gray-300 rounded-lg p-2.5 font-mono"
                      placeholder="e.g. 1765432190"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg">Back</button>
                    <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Payment'}
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