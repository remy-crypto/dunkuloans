import React from "react";

export default function AdminCompliance() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Compliance & Regulatory</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Regulatory Reporting</h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">BOZ Monthly Return</span>
                <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Generate</button>
             </div>
             <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Tax Compliance (ZRA)</span>
                <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Generate</button>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">System Health Check</h3>
          <div className="space-y-2">
             <p className="flex items-center gap-2 text-sm text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Data Retention Policy (Active)</p>
             <p className="flex items-center gap-2 text-sm text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Encryption Standards (AES-256)</p>
             <p className="flex items-center gap-2 text-sm text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Access Control Logs (Enabled)</p>
          </div>
        </div>
      </div>
    </div>
  );
}