import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
    // Real-time listener
    const sub = supabase.channel('claims-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => {
        fetchClaims();
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchClaims = async () => {
    const { data } = await supabase.from('claims').select('*, loans(id, amount)');
    if (data) setClaims(data);
    setLoading(false);
  };

  // Mock function to simulate adding a claim for testing real-time
  const simulateClaim = async () => {
    const type = prompt("Enter Claim Type (insurance, default, error):", "default");
    if (!type) return;
    
    // Create a dummy claim linked to the first loan found (or null if none)
    const { data: loan } = await supabase.from('loans').select('id').limit(1).single();
    
    await supabase.from('claims').insert([{
      loan_id: loan?.id,
      type: type,
      status: 'open',
      amount: 0,
      notes: 'New automated claim report'
    }]);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Claims Center</h1>
           <p className="text-gray-500 text-sm">Manage insurance and default claims.</p>
        </div>
        <button onClick={simulateClaim} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium">
          + New Claim
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading...</p> : claims.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">No active claims found. System healthy.</div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700 font-bold">
            <tr className="border-b border-gray-200">
              <th className="p-3">Claim ID</th>
              <th className="p-3">Loan ID</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 text-gray-800">
                <td className="p-3 font-mono text-xs">{c.id.slice(0,8)}</td>
                <td className="p-3 font-mono text-xs">{c.loan_id ? c.loan_id.slice(0,8) : 'N/A'}</td>
                <td className="p-3 capitalize">{c.type}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                    c.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}