import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminAuthorization() {
  const [showSecret, setShowSecret] = useState(false);
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [activeCode, setActiveCode] = useState(null);
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    fetchActiveCode();
  }, []);

  const fetchActiveCode = async () => {
    const { data } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      // Check if expired
      const expired = new Date() > new Date(data.expires_at);
      if (!expired) setActiveCode(data);
      else setActiveCode(null); // Code exists but expired
    }
  };

  const generateMatchCode = async () => {
    setLoadingCode(true);
    // Generate random 6 character code
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set expiry 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { error } = await supabase.from('access_codes').insert([
      { code: newCode, expires_at: expiresAt }
    ]);

    if (error) alert("Error generating code: " + error.message);
    else {
      fetchActiveCode();
      alert(`New Match Code Generated: ${newCode}`);
    }
    setLoadingCode(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-gray-900">Authorization & Keys</h1>
         <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-bold border border-indigo-200">SUPER ADMIN ACCESS</span>
      </div>
      
      {/* 1. MATCH CODE GENERATOR (NEW FEATURE) */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 19.336A1.5 1.5 0 0110.233 20h-2.466a1.5 1.5 0 01-1.303-.703l-1.303-2.172a1.5 1.5 0 01-.157-1.348l.78-2.6a6 6 0 018.21-6.177z"></path></svg>
          Worker Access Control
        </h3>
        <p className="text-sm text-gray-500 mb-4">Generate a unique Match Code for Loan Officers (Admins). Expires every 24 hours.</p>
        
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Match Code</p>
              {activeCode ? (
                <div>
                   <p className="text-3xl font-mono font-bold text-gray-900 tracking-widest">{activeCode.code}</p>
                   <p className="text-xs text-green-600 mt-1">Expires: {new Date(activeCode.expires_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-xl font-bold text-red-400">EXPIRED / NONE</p>
              )}
           </div>
           <button 
             onClick={generateMatchCode} 
             disabled={loadingCode}
             className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 shadow-lg transition"
           >
             {loadingCode ? "Generating..." : "Generate New Code"}
           </button>
        </div>
      </div>

      {/* 2. API KEYS */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">API Access Keys</h3>
        <div className="space-y-4">
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

      {/* 3. WEBHOOKS */}
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