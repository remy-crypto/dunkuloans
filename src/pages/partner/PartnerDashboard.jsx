import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function PartnerDashboard() {
  const [stats, setStats] = useState({ clients: 0, commission: 0, volume: 0 });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchAgentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 1. Get Agent ID safely
          const { data: agent, error: agentError } = await supabase
            .from('agents')
            .select('id, total_commission')
            .eq('profile_id', user.id)
            .maybeSingle(); // <--- FIX: Use maybeSingle() instead of single() to avoid 406 error if not found

          if (agentError) throw agentError;

          if (agent) {
            // 2. Get Loans linked to this Agent
            const { data: loans, error: loansError } = await supabase
              .from('loans')
              .select('*, profiles(full_name, email)')
              .eq('agent_id', agent.id)
              .order('created_at', { ascending: false });

            if (loansError) throw loansError;

            if (mounted && loans) {
              const active = loans.filter(l => l.status === 'active');
              const volume = active.reduce((sum, l) => sum + Number(l.amount), 0);
              
              setStats({
                clients: loans.length,
                commission: agent.total_commission,
                volume: volume
              });
              setRecentLoans(loans.slice(0, 5));
            }
          } else {
            // User is not an agent
            if (mounted) setErrorMsg("No Agent profile found for this user.");
          }
        }
      } catch (err) {
        console.error("Partner Dash Error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAgentData();

    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-white text-center p-10 animate-pulse">Loading Agent Portal...</div>;

  if (errorMsg) return <div className="text-red-400 text-center p-10">{errorMsg}</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Partner Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your originations and earnings.</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded font-bold hover:bg-purple-700 shadow-lg shadow-purple-900/20">
          + New Application
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-400">Total Commission</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">K {stats.commission.toLocaleString()}</h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-400">Active Loan Volume</p>
          <h2 className="text-3xl font-bold text-white mt-2">K {stats.volume.toLocaleString()}</h2>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-400">Total Clients</p>
          <h2 className="text-3xl font-bold text-indigo-400 mt-2">{stats.clients}</h2>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Recent Applications</h3>
        {recentLoans.length === 0 ? (
          <p className="text-gray-500">No recent activity.</p>
        ) : (
          <div className="space-y-4">
            {recentLoans.map(loan => (
              <div key={loan.id} className="flex justify-between items-center p-4 bg-gray-900 rounded-lg border border-gray-700">
                <div>
                  <p className="text-white font-bold">{loan.profiles?.full_name}</p>
                  <p className="text-xs text-gray-400">{loan.profiles?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono">K {loan.amount.toLocaleString()}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                    loan.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
                  }`}>
                    {loan.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}