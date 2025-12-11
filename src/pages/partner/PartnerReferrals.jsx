import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function PartnerReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Find Agent ID first
        const { data: agent } = await supabase.from('agents').select('id').eq('profile_id', user.id).single();
        
        if (agent) {
          // Find loans linked to this agent
          const { data } = await supabase
            .from('loans')
            .select('*, profiles(full_name, email, phone)')
            .eq('agent_id', agent.id);
          
          if (data) setReferrals(data);
        }
      }
      setLoading(false);
    };
    fetchReferrals();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Referrals</h1>
      
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4">Loan Amount</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? <tr><td colSpan="4" className="p-6 text-center">Loading...</td></tr> : referrals.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center">No referrals found.</td></tr>
            ) : (
              referrals.map(ref => (
                <tr key={ref.id} className="hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="font-bold text-white">{ref.profiles?.full_name}</div>
                    <div className="text-xs text-gray-500">{ref.profiles?.email}</div>
                  </td>
                  <td className="p-4">K {ref.amount.toLocaleString()}</td>
                  <td className="p-4">{new Date(ref.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                      ref.status === 'active' ? 'bg-green-900 text-green-400' : 
                      ref.status === 'settled' ? 'bg-indigo-900 text-indigo-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {ref.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}