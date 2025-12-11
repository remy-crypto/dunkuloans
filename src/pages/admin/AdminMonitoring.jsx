import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminMonitoring() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
    const sub = supabase.channel('monitoring').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
      setLogs(prev => [payload.new, ...prev]);
    }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setLogs(data);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>

      {/* System Status Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h3 className="font-bold text-gray-700">API Status</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Operational</p>
          <p className="text-xs text-gray-500">99.9% Uptime</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h3 className="font-bold text-gray-700">Database</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Healthy</p>
          <p className="text-xs text-gray-500">Latency: 45ms</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h3 className="font-bold text-gray-700">Active Sessions</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">24</p>
          <p className="text-xs text-gray-500">Current concurrent users</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800">Live Audit Trail</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 sticky top-0">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
                <th className="p-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">No logs generated yet.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-4 font-bold text-gray-900 uppercase">{log.action}</td>
                    <td className="p-4 text-gray-600">{log.details}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
