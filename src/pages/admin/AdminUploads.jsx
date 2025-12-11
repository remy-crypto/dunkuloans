import React from "react";

export default function AdminUploads() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Document Center</h1>

      {/* Upload Zone */}
      <div className="bg-white p-10 rounded-xl border-2 border-dashed border-gray-300 text-center hover:bg-gray-50 transition cursor-pointer">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
        <h3 className="text-lg font-bold text-gray-700">Upload Documents</h3>
        <p className="text-gray-500 text-sm mt-1">Drag & Drop contracts, policies, or compliance reports here.</p>
        <button className="mt-4 px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold">Select Files</button>
      </div>

      {/* Recent Files */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-gray-700">Recent Uploads</div>
        <div className="divide-y divide-gray-100">
          {[1,2,3].map(i => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Policy_Update_v{i}.pdf</p>
                  <p className="text-xs text-gray-500">Uploaded by Admin • 2 hours ago</p>
                </div>
              </div>
              <button className="text-indigo-600 text-sm font-medium hover:underline">Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}