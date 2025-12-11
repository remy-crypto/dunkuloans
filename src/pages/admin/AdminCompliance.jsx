import React from "react";

export default function AdminCompliance() {
  return (
    <div className="space-y-6 text-gray-100">
      <h1 className="text-2xl font-bold text-white">Compliance & Audits</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Audit Logs</h3>
          <div className="text-gray-500 text-center py-10 bg-gray-900/50 rounded">System logs will appear here.</div>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold mb-4">Regulatory Reports</h3>
          <button className="w-full py-2 bg-indigo-600 rounded text-white mb-2">Generate Monthly Report</button>
          <button className="w-full py-2 bg-gray-700 rounded text-gray-300">View Archive</button>
        </div>
      </div>
    </div>
  );
}