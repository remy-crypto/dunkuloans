import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function BecomePartner() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    const sub = supabase.channel('requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'role_requests', filter: `user_id=eq.${user.id}` }, fetchRequests)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from('role_requests').select('*').eq('user_id', user.id);
    if (data) setRequests(data);
    setLoading(false);
  };

  const handleApply = async (role) => {
    const confirmMsg = role === 'partner' 
      ? "Apply to become a Field Agent? You will earn commissions on loans you originate." 
      : "Apply to become an Investor? You will be able to fund liquidity pools and earn returns.";
      
    if (!confirm(confirmMsg)) return;

    const { error } = await supabase.from('role_requests').insert([
      { user_id: user.id, requested_role: role, status: 'pending' }
    ]);

    if (error) alert("Error: " + error.message);
    else fetchRequests();
  };

  const getStatus = (role) => {
    const req = requests.find(r => r.requested_role === role);
    return req ? req.status : null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Join the Network</h1>
        <p className="text-gray-400 mt-1">Expand your financial opportunities with Dunkuloans.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Agent Card */}
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center hover:border-indigo-500 transition-colors">
          <div className="w-16 h-16 bg-indigo-900/30 text-indigo-400 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Become an Agent</h3>
          <p className="text-gray-400 text-sm mb-8">
            Refer clients and earn commissions on every disbursed loan. Manage your own client portfolio.
          </p>
          
          {getStatus('partner') === 'pending' ? (
            <button disabled className="w-full py-3 bg-yellow-600/20 text-yellow-500 rounded-lg font-bold border border-yellow-600/50 cursor-not-allowed">
              Application Pending
            </button>
          ) : getStatus('partner') === 'approved' ? (
            <button disabled className="w-full py-3 bg-green-600/20 text-green-500 rounded-lg font-bold border border-green-600/50 cursor-not-allowed">
              You are an Agent
            </button>
          ) : (
            <button onClick={() => handleApply('partner')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition">
              Apply Now
            </button>
          )}
        </div>

        {/* Investor Card */}
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 flex flex-col items-center text-center hover:border-green-500 transition-colors">
          <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Become an Investor</h3>
          <p className="text-gray-400 text-sm mb-8">
            Provide capital for liquidity pools and earn consistent monthly returns. Track portfolio performance.
          </p>
          
          {getStatus('investor') === 'pending' ? (
            <button disabled className="w-full py-3 bg-yellow-600/20 text-yellow-500 rounded-lg font-bold border border-yellow-600/50 cursor-not-allowed">
              Application Pending
            </button>
          ) : getStatus('investor') === 'approved' ? (
            <button disabled className="w-full py-3 bg-green-600/20 text-green-500 rounded-lg font-bold border border-green-600/50 cursor-not-allowed">
              You are an Investor
            </button>
          ) : (
            <button onClick={() => handleApply('investor')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition">
              Apply Now
            </button>
          )}
        </div>

      </div>
    </div>
  );
}