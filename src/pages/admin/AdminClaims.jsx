import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
    const sub = supabase.channel('claims').on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, fetchClaims).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchClaims = async () => {
    const { data } = await supabase.from('claims').select('*, loans(id, amount)');
    if (data) setClaims(data);
    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claims Center</h1>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">New Claim</button>
      </div>
      {loading ? <p>Loading...</p> : claims.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">No active claims found. System healthy.</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b"><th className="pb-2">ID</th><th className="pb-2">Type</th><th className="pb-2">Status</th></tr>
          </thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id} className="border-b">
                <td className="py-2">{c.id.slice(0,8)}</td>
                <td className="py-2 capitalize">{c.type}</td>
                <td className="py-2"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs uppercase">{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}