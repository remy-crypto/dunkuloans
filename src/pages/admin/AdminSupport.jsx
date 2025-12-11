import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function AdminSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]); // Store conversation
  const [searchText, setSearchText] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Fetch Tickets & Listen for Updates
  useEffect(() => {
    fetchTickets();

    const subscription = supabase
      .channel('support-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => fetchTickets())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_replies' }, (payload) => {
        // If the new reply belongs to the currently open ticket, add it
        if (selectedTicket && payload.new.ticket_id === selectedTicket.id) {
          fetchReplies(selectedTicket.id);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [selectedTicket]); // Re-subscribe if selected ticket changes to ensure scope

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, profiles(full_name, role)')
      .order('created_at', { ascending: false });
    
    if (!error) setTickets(data);
    setLoading(false);
  };

  // Fetch replies when a ticket is clicked
  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    fetchReplies(ticket.id);
  };

  const fetchReplies = async (ticketId) => {
    const { data } = await supabase
      .from('ticket_replies')
      .select('*, profiles(full_name, role)') // Join to get sender name
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (data) setReplies(data);
    scrollToBottom();
  };

  const handleResolve = async (id) => {
    await supabase.from('tickets').update({ status: 'resolved' }).eq('id', id);
    if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status: 'resolved' });
    fetchTickets();
  };

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);

    const { error } = await supabase.from('ticket_replies').insert([
      {
        ticket_id: selectedTicket.id,
        user_id: user.id,
        message: reply
      }
    ]);

    if (!error) {
      setReply(""); // Clear input
      fetchReplies(selectedTicket.id); // Refresh chat
    } else {
      alert("Failed to send: " + error.message);
    }
    setSending(false);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* LEFT: Ticket Queue */}
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
                  onClick={() => handleSelectTicket(ticket)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
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
                    <span className="text-xs text-gray-500 font-medium">{ticket.profiles?.full_name || "Unknown"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${ticket.status === 'open' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Chat Console */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col relative overflow-hidden">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Ticket #{selectedTicket.id.slice(0,8)} • {selectedTicket.profiles?.full_name}
                  </p>
                </div>
                {selectedTicket.status === 'open' && (
                  <button onClick={() => handleResolve(selectedTicket.id)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition">
                    Mark Resolved
                  </button>
                )}
              </div>

              {/* Conversation Area */}
              <div className="flex-1 p-8 overflow-y-auto bg-gray-50 space-y-6">
                {/* 1. Original Issue */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                    {selectedTicket.profiles?.full_name?.[0]}
                  </div>
                  <div className="bg-white p-4 rounded-xl rounded-tl-none border border-gray-200 shadow-sm max-w-2xl">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                    <p className="text-xs text-gray-400 mt-2 text-right">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* 2. Replies */}
                {replies.map((rep) => (
                  <div key={rep.id} className={`flex gap-4 ${rep.user_id === user.id ? 'justify-end' : ''}`}>
                    {rep.user_id !== user.id && (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                        {rep.profiles?.full_name?.[0] || "U"}
                      </div>
                    )}
                    <div className={`p-4 rounded-xl border max-w-2xl shadow-sm ${
                      rep.user_id === user.id 
                        ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-600' 
                        : 'bg-white text-gray-800 rounded-tl-none border-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{rep.message}</p>
                      <p className={`text-xs mt-2 text-right ${rep.user_id === user.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(rep.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="relative">
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-3 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-gray-900" 
                    rows="3"
                    placeholder="Type your reply here..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  ></textarea>
                  <button 
                    onClick={handleSendReply}
                    disabled={sending}
                    className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
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