import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
    const sub = supabase.channel('payments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchTransactions)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchTransactions = async () => {
    // Join with profiles to get names
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    
    if (data) setTransactions(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Payments & Transactions</h1>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
            <tr>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">User</th>
              <th className="p-4">Type</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td></tr> : 
             transactions.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-gray-500">No transactions recorded.</td></tr> : (
              transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-gray-500">{tx.id.slice(0,8)}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{tx.profiles?.full_name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{tx.profiles?.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                      tx.type === 'repayment' ? 'bg-green-100 text-green-700' : 
                      tx.type === 'disbursement' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-gray-900">K {tx.amount.toLocaleString()}</td>
                  <td className="p-4 text-gray-500">{new Date(tx.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}