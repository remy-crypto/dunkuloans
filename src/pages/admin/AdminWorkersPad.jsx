import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function AdminWorkersPad() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    fetchNotes();
    // Real-time listener
    const sub = supabase.channel('notes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_notes' }, (payload) => {
        // Optimistic update or refetch
        fetchNotes();
      })
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchNotes = async () => {
    const { data } = await supabase.from('admin_notes').select('*').order('created_at', { ascending: false });
    if (data) setNotes(data);
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    await supabase.from('admin_notes').insert([{ author_id: user.id, content: newNote }]);
    setNewNote(""); // Clear input
  };

  const deleteNote = async (id) => {
    await supabase.from('admin_notes').delete().eq('id', id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80vh]">
      {/* Input Section */}
      <div className="md:col-span-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-gray-900">New Note</h2>
        <textarea 
          className="flex-1 w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-indigo-500 text-gray-900 bg-white" 
          placeholder="Type update here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          style={{ color: 'black' }} // Force black text
        ></textarea>
        <button onClick={addNote} className="mt-4 w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium">
          Post Note
        </button>
      </div>
      
      {/* Notes List */}
      <div className="md:col-span-2 space-y-4 overflow-y-auto pr-2">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No active notes.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm relative group">
              <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
              <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                <span>{new Date(note.created_at).toLocaleString()}</span>
                <button onClick={() => deleteNote(note.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition font-bold">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}