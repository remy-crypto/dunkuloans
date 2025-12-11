import React from "react";

export default function AdminAuthorization() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Authorization & Keys</h1>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">API Access Keys</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
            <div>
              <p className="font-bold text-gray-700">Public Key (Anon)</p>
              <p className="text-xs text-gray-500 font-mono">pk_test_************************</p>
            </div>
            <button className="text-gray-500 hover:text-indigo-600">Copy</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded border border-red-100">
            <div>
              <p className="font-bold text-red-800">Secret Key (Service Role)</p>
              <p className="text-xs text-red-500 font-mono">sk_test_************************</p>
            </div>
            <button className="text-red-600 text-sm font-bold border border-red-200 bg-white px-3 py-1 rounded hover:bg-red-100">Reveal</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Webhook Events</h3>
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-gray-700">Loan Status Updates</p>
                <p className="text-xs text-gray-500">Triggered when loan state changes.</p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-green-400 translate-x-6"/>
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-green-400 cursor-pointer"></label>
            </div>
        </div>
      </div>
    </div>
  );
}
