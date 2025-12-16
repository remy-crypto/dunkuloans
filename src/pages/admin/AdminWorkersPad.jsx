import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminWorkersPad() {
  const [activeTab, setActiveTab] = useState('WORKERS');
  const [workers, setWorkers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- REAL-TIME DATA FETCHING ---
  useEffect(() => {
    fetchData();
    const sub = supabase.channel('workers-pad-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchData = async () => {
    // Fetch profiles where role is admin (worker) or partner (agent)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'partner', 'super_admin']); // Assuming super_admin is also a worker

    if (data) {
      // Filter into categories
      // Note: In your system 'admin' = Worker, 'partner' = Agent
      setWorkers(data.filter(u => u.role === 'admin' || u.role === 'super_admin'));
      setAgents(data.filter(u => u.role === 'partner'));
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return "K " + Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const renderCard = (user, type) => (
    <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 ${type === 'WORKER' ? 'bg-purple-600' : 'bg-emerald-600'}`}></div>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${type === 'WORKER' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{user.full_name || "Unknown"}</h3>
            <p className="text-sm text-gray-500">
              {type === 'WORKER' ? (user.position || 'Staff') : 'Field Agent'}
            </p>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 
            {user.email}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> 
            {user.phone || 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> 
            {user.address || 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> 
            {user.gender || 'Not specified'} • {user.marital_status || 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> 
            DOB: {user.dob || 'N/A'}
          </div>
        </div>

        {/* Salary Section (Workers Only) */}
        {type === 'WORKER' && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Salary</span>
              <span className="font-bold text-gray-900 flex items-center gap-1">
                <svg className="w-3 h-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {formatCurrency(user.salary || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Parent/Guardian Contacts */}
        {user.parent_contacts && user.parent_contacts.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg text-xs">
            <p className="font-bold text-gray-500 uppercase mb-1">Guardian / Next of Kin</p>
            {user.parent_contacts.map((p, i) => (
              <div key={i} className="flex justify-between">
                <span>{p.name} ({p.relationship})</span>
                <span className="text-gray-500">{p.phoneNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Worker's Pad</h2>
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('WORKERS')}
          className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'WORKERS' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Worker Admins ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('AGENTS')}
          className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'AGENTS' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Agents ({agents.length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            <p className="text-gray-500 col-span-3 text-center">Loading Staff...</p>
        ) : activeTab === 'WORKERS' ? (
            workers.map(w => renderCard(w, 'WORKER'))
        ) : (
            agents.map(a => renderCard(a, 'AGENT'))
        )}
        
        {!loading && (activeTab === 'WORKERS' ? workers : agents).length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-400">No records found.</div>
        )}
      </div>
    </div>
  );
}