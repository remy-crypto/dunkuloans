import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'borrower');
    if (!error) setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();

    // Real-time subscription to Profiles table
    const subscription = supabase
      .channel('admin-clients-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Management</h1>
          <p className="text-gray-400 mt-1">View user profiles, KYC status, and financial history.</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900/50 text-gray-200 font-medium border-b border-gray-700">
            <tr>
              <th className="px-6 py-4">Client Name</th>
              <th className="px-6 py-4">Verification</th>
              <th className="px-6 py-4">Account Status</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center">Loading clients...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center">No clients found.</td></tr>
            ) : (
              clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                        {client.full_name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-white font-medium">{client.full_name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {client.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">Verified</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-400 border border-orange-800">Pending KYC</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 bg-gray-700/50 px-2 py-1 rounded text-xs">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(client.created_at).toLocaleDateString()}
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