import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminUnderwriting() {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('loans')
      .select('*, profiles(full_name, email, phone)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (!error) setPendingLoans(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();

    const subscription = supabase
      .channel('underwriting-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => {
        fetchPending();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const processLoan = async (id, decision) => {
    const status = decision === 'approve' ? 'active' : 'rejected';
    if (!confirm(`Are you sure you want to ${status.toUpperCase()} this loan?`)) return;
    
    await supabase.from('loans').update({ status }).eq('id', id);
    // Realtime listener will handle the refresh
  };

  if (loading && pendingLoans.length === 0) return <div className="text-white text-center p-10">Loading queue...</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-white">Underwriting Desk</h1>
        <p className="text-gray-400 mt-1">Manual review for loans flagged by decision engine.</p>
      </div>

      {pendingLoans.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 rounded-full bg-green-900/20 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">All Caught Up!</h2>
          <p className="text-gray-500 text-center max-w-md">
            Queue empty. All loans automatically processed. <br/>
            Check back later for new applications requiring manual review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingLoans.map(loan => (
            <div key={loan.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{loan.profiles?.full_name}</h3>
                  <p className="text-sm text-gray-400">{loan.profiles?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase">Requested Amount</p>
                  <p className="text-2xl font-bold text-indigo-400">K {loan.amount.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
                <div className="bg-gray-900 p-3 rounded border border-gray-800">
                  <p className="text-gray-500">Repayment Total</p>
                  <p className="text-white font-medium">K {(loan.amount * 1.4).toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-800">
                  <p className="text-gray-500">Interest Rate</p>
                  <p className="text-white font-medium">40% Flat</p>
                </div>
                <div className="bg-gray-900 p-3 rounded border border-gray-800">
                  <p className="text-gray-500">Date Applied</p>
                  <p className="text-white font-medium">{new Date(loan.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button 
                  onClick={() => processLoan(loan.id, 'reject')}
                  className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => processLoan(loan.id, 'approve')}
                  className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition shadow-lg shadow-green-900/20"
                >
                  Approve & Disburse
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}