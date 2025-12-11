import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminInvestors() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ invested: 0, returns: 0 });

  const fetchInvestors = async () => {
    const { data, error } = await supabase.from('investors').select('*, profiles(full_name, email)');
    if (!error && data) {
      setInvestors(data);
      const totalInv = data.reduce((acc, curr) => acc + Number(curr.total_invested), 0);
      const totalRet = data.reduce((acc, curr) => acc + Number(curr.total_returns), 0);
      setTotals({ invested: totalInv, returns: totalRet });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvestors();
    const subscription = supabase.channel('investors-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, () => fetchInvestors())
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, []);

  const handleAddFunds = async (investorId, currentAmount) => {
    const amount = prompt("Enter amount to add (ZMW):");
    if (!amount || isNaN(amount)) return;
    const newTotal = Number(currentAmount) + Number(amount);
    await supabase.from('investors').update({ total_invested: newTotal }).eq('id', investorId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Investor Management</h1>
        <p className="text-gray-400 mt-1">Track liquidity providers and capital allocation.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30">
          <p className="text-sm font-medium text-indigo-300">Total Capital Raised</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {totals.invested.toLocaleString()}</h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-400">Total Returns Paid</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {totals.returns.toLocaleString()}</h2>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Investor</th>
              <th className="px-6 py-4">Total Invested</th>
              <th className="px-6 py-4">Returns Earned</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {investors.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{inv.profiles?.full_name || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{inv.profiles?.email}</div>
                </td>
                <td className="px-6 py-4 font-bold text-white">K {inv.total_invested.toLocaleString()}</td>
                <td className="px-6 py-4 text-green-400">+ K {inv.total_returns.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleAddFunds(inv.id, inv.total_invested)} className="text-xs border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white px-3 py-1 rounded transition">Add Funds</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}