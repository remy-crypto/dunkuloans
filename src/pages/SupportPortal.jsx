import React, { useState, useEffect } from "react";
import { supabase } from "../lib/SupabaseClient";
import { useAuth } from "../context/AuthContext";

export default function SupportPortal() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    const { data } = await supabase.from("tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setTickets(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("tickets").insert([
      { user_id: user.id, subject, message, status: "open" }
    ]);

    if (error) alert(error.message);
    else {
      alert("Ticket created!");
      setSubject("");
      setMessage("");
      fetchTickets();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Support Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Create Ticket */}
        <div className="md:col-span-1 bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
          <h2 className="text-lg font-bold text-white mb-4">New Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white" 
              placeholder="Subject"
              value={subject} onChange={e => setSubject(e.target.value)} required 
            />
            <textarea 
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white h-32" 
              placeholder="Describe your issue..."
              value={message} onChange={e => setMessage(e.target.value)} required 
            ></textarea>
            <button disabled={loading} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold">
              {loading ? "Sending..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* Ticket List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white">Your History</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-500">No support tickets found.</p>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white">{ticket.subject}</h3>
                  <span className={`px-2 py-1 text-xs rounded uppercase font-bold ${
                    ticket.status === 'open' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'
                  }`}>{ticket.status}</span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{ticket.message}</p>
                <p className="text-xs text-gray-600">{new Date(ticket.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}