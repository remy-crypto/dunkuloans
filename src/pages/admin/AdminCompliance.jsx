import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminCompliance() {
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    fetchLogs();
    const sub = supabase.channel('audit-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setLogs(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchLogs = async () => {
    // If you haven't created audit_logs table yet, this will just return empty.
    // Ensure you ran the SQL I provided earlier.
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setLogs(data);
  };

  return (
    <div className="space-y-6 text-gray-100">
      <h1 className="text-2xl font-bold text-white">Compliance & Audits</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-[60vh] flex flex-col">
          <h3 className="text-lg font-bold mb-4 text-white">Live System Logs</h3>
          <div className="flex-1 bg-gray-900 rounded p-4 overflow-y-auto space-y-2 border border-gray-700">
            {logs.length === 0 ? (
              <p className="text-gray-600 text-center mt-10">No recent logs recorded.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="text-xs border-b border-gray-800 pb-2">
                  <span className="text-indigo-400 font-mono">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                  <span className="text-gray-300 ml-2 font-bold uppercase">{log.action}</span>
                  <p className="text-gray-500 mt-1">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-white">Regulatory Reports</h3>
          <p className="text-sm text-gray-400 mb-6">Generate official reports for internal audit.</p>
          <button className="w-full py-3 bg-indigo-600 rounded text-white font-bold hover:bg-indigo-700 mb-3">
            Generate Monthly Report
          </button>
          <button className="w-full py-3 bg-gray-700 rounded text-gray-300 font-bold hover:bg-gray-600">
            View Archive
          </button>
        </div>
      </div>
    </div>
  );
}