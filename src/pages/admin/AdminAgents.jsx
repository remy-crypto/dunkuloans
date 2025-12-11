import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    const { data } = await supabase.from('agents').select('*, profiles(full_name, email)');
    if (data) setAgents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
    
    // Real-time listener for Agents table
    const sub = supabase.channel('agents-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => fetchAgents())
      .subscribe();
      
    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <div className="space-y-6 text-gray-100">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Network</h1>
        <p className="text-gray-400">Manage field agents and commissions.</p>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 font-bold uppercase">
            <tr><th className="p-4">Agent Name</th><th className="p-4">Clients</th><th className="p-4">Rank</th><th className="p-4 text-right">Commission</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? <tr><td colSpan="4" className="p-6 text-center">Loading...</td></tr> : agents.length === 0 ? <tr><td colSpan="4" className="p-6 text-center">No agents found.</td></tr> : (
              agents.map(agent => (
                <tr key={agent.id} className="hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="font-bold text-white">{agent.profiles?.full_name || "Unknown Agent"}</div>
                    <div className="text-xs text-gray-500">{agent.profiles?.email}</div>
                  </td>
                  <td className="p-4">{agent.clients_count}</td>
                  <td className="p-4"><span className="bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded text-xs uppercase font-bold">{agent.rank}</span></td>
                  <td className="p-4 text-right font-mono text-green-400 font-bold">K {agent.total_commission.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}