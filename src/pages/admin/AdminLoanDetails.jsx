import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminLoanDetails() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
    const sub = supabase.channel('loans-all').on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchLoans).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchLoans = async () => {
    const { data } = await supabase.from('loans').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
    if (data) setLoans(data);
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[80vh]">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Master Loan Database</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
            <tr>
              <th className="p-4">Loan ID</th>
              <th className="p-4">Borrower</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Balance</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr> : loans.map(loan => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs">{loan.id}</td>
                <td className="p-4">
                  <div className="font-bold text-gray-900">{loan.profiles?.full_name}</div>
                  <div className="text-xs">{loan.profiles?.email}</div>
                </td>
                <td className="p-4 font-bold">K {loan.amount.toLocaleString()}</td>
                <td className="p-4 text-indigo-600">K {loan.balance.toLocaleString()}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{loan.status}</span></td>
                <td className="p-4">{new Date(loan.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
