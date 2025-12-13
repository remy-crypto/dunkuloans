import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminLoanDetails() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchLoans();
    // Realtime
    const sub = supabase.channel('master-loans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchLoans)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchLoans = async () => {
    const { data } = await supabase
      .from('loans')
      .select('*, profiles(full_name, email, phone)')
      .order('created_at', { ascending: false });
    
    if (data) setLoans(data);
    setLoading(false);
  };

  const filteredLoans = filter === 'all' ? loans : loans.filter(l => l.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Master Loan Database</h1>
        <select 
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="settled">Settled</option>
          <option value="default">Default</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-800 font-bold border-b border-gray-200">
            <tr>
              <th className="p-4">Loan ID</th>
              <th className="p-4">Borrower</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Balance</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="p-6 text-center">Loading Database...</td></tr>
            ) : filteredLoans.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center">No records found.</td></tr>
            ) : (
              filteredLoans.map(loan => (
                <tr key={loan.id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 font-mono text-xs">{loan.id.slice(0,8)}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{loan.profiles?.full_name}</div>
                    <div className="text-xs text-gray-500">{loan.profiles?.email}</div>
                  </td>
                  <td className="p-4 font-bold text-gray-900">K {loan.amount.toLocaleString()}</td>
                  <td className="p-4 text-indigo-600 font-bold">K {loan.balance.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      loan.status === 'active' ? 'bg-green-100 text-green-700' :
                      loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      loan.status === 'settled' ? 'bg-gray-100 text-gray-600' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs">{new Date(loan.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}