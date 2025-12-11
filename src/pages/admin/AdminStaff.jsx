import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    // Fetch profiles that are NOT borrowers
    const { data } = await supabase.from('profiles').select('*').neq('role', 'borrower');
    if (data) setStaff(data);
  };

  const updateRole = async (id, newRole) => {
    if(!confirm("Change user role?")) return;
    await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    fetchStaff();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Add Staff</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(member => (
          <div key={member.id} className="p-4 border rounded-lg hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                {member.full_name?.[0]}
              </div>
              <div>
                <div className="font-bold text-gray-900">{member.full_name}</div>
                <div className="text-xs text-gray-500 uppercase">{member.role.replace('_', ' ')}</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">{member.email}</div>
            <div className="flex gap-2">
              <button onClick={() => updateRole(member.id, 'admin')} className="flex-1 py-1 text-xs border rounded hover:bg-gray-50">Make Admin</button>
              <button onClick={() => updateRole(member.id, 'borrower')} className="flex-1 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}