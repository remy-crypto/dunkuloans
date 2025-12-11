import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function PartnerEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEarnings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch transactions for this user where type is 'commission'
        const { data } = await supabase
          .from('transactions') // Assuming you use transactions table for payouts
          .select('*')
          .eq('profile_id', user.id)
          .eq('type', 'commission_payout') // Ensure this matches your enum/text
          .order('created_at', { ascending: false });

        if (data) {
          setEarnings(data);
          setTotal(data.reduce((sum, tx) => sum + Number(tx.amount), 0));
        }
      }
    };
    fetchEarnings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Earnings</h1>
          <p className="text-gray-400">Commission payout history.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase">Total Paid Out</p>
          <h2 className="text-3xl font-bold text-green-400">K {total.toLocaleString()}</h2>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200">
            <tr>
              <th className="p-4">Transaction ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Method</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {earnings.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center">No payouts recorded yet.</td></tr>
            ) : (
              earnings.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-700/50">
                  <td className="p-4 font-mono text-xs">{tx.id.slice(0,8)}</td>
                  <td className="p-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="p-4">Mobile Money</td>
                  <td className="p-4 text-right text-white font-bold">K {tx.amount.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}