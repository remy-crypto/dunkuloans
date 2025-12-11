import React, { useState } from "react";

export default function AdminAuthorization() {
  const [showSecret, setShowSecret] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Authorization & Keys</h1>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">API Access Keys</h3>
        <div className="space-y-4">
          
          {/* Public Key */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-200">
            <div>
              <p className="font-bold text-gray-700">Public Key (Anon)</p>
              <p className="text-xs text-gray-500 font-mono">pk_test_dunku_public_key_12345</p>
            </div>
            <button 
              onClick={() => copyToClipboard('pk_test_dunku_public_key_12345')}
              className="text-gray-500 hover:text-indigo-600 text-sm font-bold"
            >
              Copy
            </button>
          </div>

          {/* Secret Key */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded border border-red-100">
            <div>
              <p className="font-bold text-red-800">Secret Key (Service Role)</p>
              <p className="text-xs text-red-500 font-mono">
                {showSecret ? "sk_test_dunku_secret_key_98765" : "sk_test_************************"}
              </p>
            </div>
            <button 
              onClick={() => setShowSecret(!showSecret)}
              className="text-red-600 text-sm font-bold border border-red-200 bg-white px-3 py-1 rounded hover:bg-red-100"
            >
              {showSecret ? "Hide" : "Reveal"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Webhook Events</h3>
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-gray-700">Loan Status Updates</p>
                <p className="text-xs text-gray-500">Triggered when loan state changes (Approved/Paid/Default).</p>
            </div>
            <div 
              className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in cursor-pointer"
              onClick={() => setWebhookEnabled(!webhookEnabled)}
            >
                <div className={`block w-12 h-6 rounded-full ${webhookEnabled ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                <div className={`absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 top-0 transition-transform duration-200 ${webhookEnabled ? 'translate-x-full border-green-400' : ''}`}></div>
            </div>
        </div>
      </div>
    </div>
  );
}