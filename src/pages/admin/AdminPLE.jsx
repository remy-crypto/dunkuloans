import React from "react";

export default function AdminPLE() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">P&L Dashboard</h1>
          <p className="text-gray-500">Financial performance and projections.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700">Download PDF Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Statement Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Income Statement (MTD)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Interest Income</span>
              <span className="font-bold text-green-600">+ K 45,200.00</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Processing Fees</span>
              <span className="font-bold text-green-600">+ K 3,500.00</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Late Penalties</span>
              <span className="font-bold text-green-600">+ K 1,200.00</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Agent Commissions</span>
              <span className="font-bold text-red-500">- K 8,400.00</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Investor Returns</span>
              <span className="font-bold text-red-500">- K 5,000.00</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-bold text-gray-900">Net Profit</span>
              <span className="text-xl font-bold text-indigo-600">K 36,500.00</span>
            </div>
          </div>
        </div>

        {/* Projection Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
          </div>
          <h3 className="font-bold text-gray-800">Growth Projection</h3>
          <p className="text-sm text-gray-500 mt-2">Projected 15% growth in net profit next quarter based on current origination volume.</p>
        </div>
      </div>
    </div>
  );
}