import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminKYC() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch all borrowers who are NOT verified
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "borrower")
      .eq("is_verified", false);
    if (data) setUsers(data);
    setLoading(false);
  };

  const verifyUser = async (id) => {
    if(!confirm("Mark this user as Verified?")) return;
    const { error } = await supabase.from("profiles").update({ is_verified: true }).eq("id", id);
    if (!error) fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">KYC Verification Queue</h1>
      
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">ID Number</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan="4" className="p-6 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="4" className="p-6 text-center">No pending verifications.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-white font-medium">{user.full_name || "Unknown"}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.id_number || "Not Submitted"}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => verifyUser(user.id)}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
