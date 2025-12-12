import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Realtime listener for requests
    const sub = supabase.channel('staff-requests').on('postgres_changes', { event: '*', schema: 'public', table: 'role_requests' }, fetchData).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchData = async () => {
    // 1. Fetch Staff (Admins/Partners/Investors)
    const { data: staffData } = await supabase.from('profiles').select('*').neq('role', 'borrower');
    if (staffData) setStaff(staffData);

    // 2. Fetch Pending Requests
    const { data: reqData } = await supabase.from('role_requests').select('*, profiles(full_name, email)').eq('status', 'pending');
    if (reqData) setRequests(reqData);
    
    setLoading(false);
  };

  const handleApprove = async (request) => {
    if(!confirm(`Approve ${request.profiles.full_name} as ${request.requested_role}?`)) return;

    // 1. Update Request Status
    await supabase.from('role_requests').update({ status: 'approved' }).eq('id', request.id);

    // 2. Update User Profile Role
    await supabase.from('profiles').update({ role: request.requested_role }).eq('id', request.user_id);

    // 3. Create Specific Table Entry (Agent or Investor)
    if (request.requested_role === 'partner') {
      await supabase.from('agents').insert([{ profile_id: request.user_id, rank: 'Beginner', total_commission: 0 }]);
    } else if (request.requested_role === 'investor') {
      await supabase.from('investors').insert([{ profile_id: request.user_id, total_invested: 0, wallet_balance: 0 }]);
    }

    alert("User Upgraded Successfully!");
    fetchData();
  };

  const handleReject = async (id) => {
    if(!confirm("Reject this request?")) return;
    await supabase.from('role_requests').update({ status: 'rejected' }).eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-8">
      
      {/* 1. REQUESTS QUEUE */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Role Requests</h1>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-4 bg-gray-50 rounded">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-bold text-gray-900">{req.profiles?.full_name} <span className="text-gray-500 font-normal">({req.profiles?.email})</span></p>
                  <p className="text-sm text-gray-600">Requests to become: <span className="font-bold uppercase text-indigo-600">{req.requested_role === 'partner' ? 'Agent' : 'Investor'}</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReject(req.id)} className="px-3 py-1.5 text-sm text-red-600 border border-red-200 bg-white rounded hover:bg-red-50">Reject</button>
                  <button onClick={() => handleApprove(req)} className="px-3 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700 shadow font-bold">Approve & Upgrade</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. ACTIVE STAFF LIST */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Active Staff & Partners</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map(member => (
            <div key={member.id} className="p-4 border rounded-lg hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                  {member.full_name?.[0]}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{member.full_name}</div>
                  <div className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded inline-block mt-0.5">
                    {member.role === 'partner' ? 'Agent' : member.role}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{member.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}