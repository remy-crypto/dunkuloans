import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminWorkersPad() {
  const [activeTab, setActiveTab] = useState('WORKERS');
  const [workers, setWorkers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New State for the Modal
  const [selectedProfile, setSelectedProfile] = useState(null);

  // --- REAL-TIME DATA FETCHING ---
  useEffect(() => {
    fetchData();
    const sub = supabase.channel('workers-pad-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'partner', 'super_admin']);

    if (data) {
      setWorkers(data.filter(u => u.role === 'admin' || u.role === 'super_admin'));
      setAgents(data.filter(u => u.role === 'partner'));
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return "K " + Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const renderCard = (user, type) => (
    <div 
      key={user.id} 
      onClick={() => setSelectedProfile(user)} // <--- CLICK TO OPEN MODAL
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
    >
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
              {type === 'WORKER' ? (user.position || 'Staff') : 'filled Agent'}
            </p>
          </div>
        </div>

        {/* Preview Details */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2 truncate">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> 
            {user.email}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> 
            {user.phone || 'N/A'}
          </div>
        </div>

        {/* View More Indication */}
        <div className="pt-2 text-xs text-indigo-500 font-bold uppercase tracking-wider text-right">
          View Full Details →
        </div>
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

      {/* --- DETAIL MODAL (Pop-up when card is clicked) --- */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Modal Header */}
            <div className={`p-6 text-white flex justify-between items-start ${selectedProfile.role === 'partner' ? 'bg-emerald-600' : 'bg-purple-600'}`}>
               <div>
                  <h3 className="text-2xl font-bold">{selectedProfile.full_name}</h3>
                  <p className="text-white/80 text-sm uppercase tracking-wider font-bold mt-1">
                    {selectedProfile.role === 'partner' ? 'filled Agent' : selectedProfile.position || 'Staff Member'}
                  </p>
               </div>
               <button onClick={() => setSelectedProfile(null)} className="text-white/70 hover:text-white">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
               
               {/* Contact Info */}
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Contact Information</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                     <p className="flex items-center gap-2"><span className="font-bold w-20">Email:</span> {selectedProfile.email}</p>
                     <p className="flex items-center gap-2"><span className="font-bold w-20">Phone:</span> {selectedProfile.phone || 'N/A'}</p>
                     <p className="flex items-center gap-2"><span className="font-bold w-20">Address:</span> {selectedProfile.address || 'N/A'}</p>
                  </div>
               </div>

               {/* Personal Info */}
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Personal Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                     <p><span className="font-bold block text-gray-500 text-xs">Gender</span> {selectedProfile.gender || 'N/A'}</p>
                     <p><span className="font-bold block text-gray-500 text-xs">Marital Status</span> {selectedProfile.marital_status || 'N/A'}</p>
                     <p><span className="font-bold block text-gray-500 text-xs">Date of Birth</span> {selectedProfile.dob || 'N/A'}</p>
                     
                     {/* Show Salary only for Workers */}
                     {(selectedProfile.role === 'admin' || selectedProfile.role === 'super_admin') && (
                        <p><span className="font-bold block text-gray-500 text-xs">Salary</span> <span className="text-green-600 font-mono font-bold">{formatCurrency(selectedProfile.salary || 0)}</span></p>
                     )}
                  </div>
               </div>

               {/* Next of Kin / Guardian */}
               {selectedProfile.parent_contacts && selectedProfile.parent_contacts.length > 0 && (
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Guardians / Next of Kin</h4>
                    {selectedProfile.parent_contacts.map((p, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                         <p className="font-bold text-gray-900">{p.name}</p>
                         <p className="text-gray-500 text-xs">{p.relationship} • {p.phoneNumber}</p>
                      </div>
                    ))}
                 </div>
               )}

            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button onClick={() => setSelectedProfile(null)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}