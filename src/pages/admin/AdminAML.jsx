import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminAML() {
  const [flags, setFlags] = useState([]);

  useEffect(() => {
    fetchFlags();
    const sub = supabase.channel('aml-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchFlags)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchFlags = async () => {
    // Fetch transactions over 10,000 as potential AML flags
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(full_name)')
      .gt('amount', 10000) 
      .order('created_at', { ascending: false });
    
    if (data) setFlags(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AML Monitoring</h1>
          <p className="text-gray-500 text-sm">Automated flags for transactions exceeding K 10,000.</p>
        </div>
        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
          {flags.length} Active Flags
        </div>
      </div>

      <div className="grid gap-4">
        {flags.length === 0 ? (
          <div className="p-10 bg-white border rounded-xl text-center text-gray-500">No suspicious activity detected.</div>
        ) : (
          flags.map(flag => (
            <div key={flag.id} className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900">High Value Transaction Detected</p>
                <p className="text-sm text-gray-600">User: {flag.profiles?.full_name} | Type: {flag.type}</p>
                <p className="text-xs text-gray-400 mt-1">ID: {flag.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-red-600">K {flag.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{new Date(flag.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}