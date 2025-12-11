import React from "react";

export default function AdminCollateral() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Collateral Management</h1>
          <p className="text-gray-400 mt-1">Review submissions and manage asset logistics.</p>
        </div>
        <input type="text" placeholder="Search items..." className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded text-sm w-64" />
      </div>

      <div className="flex gap-6 border-b border-gray-800">
        <button className="pb-3 text-indigo-400 border-b-2 border-indigo-500 font-medium text-sm">Underwriting & Review <span className="ml-2 bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded text-xs">1</span></button>
        <button className="pb-3 text-gray-500 hover:text-gray-300 font-medium text-sm transition">Logistics & Retrieval</button>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-xl overflow-hidden flex flex-col md:flex-row shadow-lg">
        {/* Image Section */}
        <div className="w-full md:w-1/3 h-64 md:h-auto bg-gray-100 relative">
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
             {/* Placeholder for image */}
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 text-xs font-bold rounded uppercase">Jewelry</div>
        </div>

        {/* Details Section */}
        <div className="flex-1 p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gold Necklace 18k</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">JD</div>
                <span className="text-sm text-gray-500">John Doe (View Profile)</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Submitted 10/26/2023</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Client Est. Value</p>
              <p className="text-xl font-bold text-gray-900">K 18,000.00</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Item Specifics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Condition</span><span className="font-medium text-gray-900">Excellent</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Year</span><span className="font-medium text-gray-900">2019</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Serial/IMEI</span><span className="font-medium text-gray-900">N/A</span></div>
              </div>
              <p className="mt-4 text-sm text-gray-600 italic">"15 grams, vintage design."</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center justify-center text-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Valuation & Request</p>
                <p className="text-sm text-gray-500">No AI Valuation requested.</p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded font-medium transition">× Reject</button>
            <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-lg shadow-indigo-200 transition">
              ✓ Approve & Offer Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}