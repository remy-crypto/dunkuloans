import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminSystemLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const sub = supabase.channel('sys-logs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, payload => {
      setLogs(prev => [payload.new, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchLogs = async () => {
    // Ensure audit_logs table exists in your Supabase database before this will return data
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setLogs(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr><th className="p-3">Time</th><th className="p-3">Action</th><th className="p-3">Details</th><th className="p-3">Severity</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
                <tr><td colSpan="4" className="p-6 text-center text-gray-500">No logs found.</td></tr>
            ) : (
                logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 text-gray-600">
                    <td className="p-3 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 font-bold uppercase">{log.action}</td>
                    <td className="p-3">{log.details}</td>
                    <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-600'
                    }`}>{log.severity}</span>
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