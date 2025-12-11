import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [reply, setReply] = useState("");

  // 1. Fetch & Real-time Subscription
  useEffect(() => {
    fetchTickets();

    const subscription = supabase
      .channel('admin-support-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchTickets = async () => {
    // Fetch tickets + user profile details
    const { data, error } = await supabase
      .from('tickets')
      .select('*, profiles(full_name, role)')
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data);
    setLoading(false);
  };

  const handleResolve = async (id) => {
    await supabase.from('tickets').update({ status: 'resolved' }).eq('id', id);
    if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status: 'resolved' });
  };

  const filteredTickets = tickets.filter(t => 
    t.subject?.toLowerCase().includes(searchText.toLowerCase()) || 
    t.profiles?.full_name?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Desk</h1>
          <p className="text-gray-400 mt-1">Manage and resolve user inquiries.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="bg-gray-800 border border-gray-700 text-white px-4 py-2 pl-10 rounded-lg text-sm w-64 focus:outline-none focus:border-indigo-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: Ticket Queue */}
        <div className="w-1/3 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-gray-800">Ticket Queue</h2>
            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">{filteredTickets.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-400 text-sm">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No tickets found.</div>
            ) : (
              filteredTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {/* Status Dot */}
                      <div className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <h3 className={`text-sm font-bold ${selectedTicket?.id === ticket.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                        {ticket.subject}
                      </h3>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      <span className="text-xs text-gray-500 font-medium">{ticket.profiles?.full_name || "Unknown"}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-wide">
                        {ticket.profiles?.role}
                      </span>
                    </div>
                    
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      ticket.status === 'open' 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Details / Empty State */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col relative overflow-hidden">
          {selectedTicket ? (
            // ACTIVE TICKET VIEW
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Ticket #{selectedTicket.id.slice(0,8)} • via {selectedTicket.profiles?.full_name}
                  </p>
                </div>
                {selectedTicket.status === 'open' && (
                  <button 
                    onClick={() => handleResolve(selectedTicket.id)}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>

              {/* Message Body */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                    {selectedTicket.profiles?.full_name?.[0]}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl rounded-tl-none border border-gray-100 max-w-2xl">
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 text-right">
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reply Box (Visual Only for now) */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="relative">
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                    rows="3"
                    placeholder="Type your reply here..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  ></textarea>
                  <button className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // EMPTY STATE (Matches your screenshot)
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-400">Support Admin Console</h3>
              <p className="text-sm text-gray-400 mt-1">Select a ticket from the queue to view details and respond.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}