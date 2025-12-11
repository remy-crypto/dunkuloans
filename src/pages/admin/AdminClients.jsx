import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState(null); // To store clicked client
  const [clientLoans, setClientLoans] = useState([]); // To store client's loans
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').eq('role', 'borrower');
    if (!error) setClients(data);
    setLoading(false);
  };

  // Function to open details
  const handleRowClick = async (client) => {
    setSelectedClient(client);
    setLoadingDetails(true);
    // Fetch loans for this specific client
    const { data } = await supabase
      .from('loans')
      .select('*, collateral(*)')
      .eq('borrower_id', client.id)
      .order('created_at', { ascending: false });
    
    setClientLoans(data || []);
    setLoadingDetails(false);
  };

  const closeDetails = () => {
    setSelectedClient(null);
    setClientLoans([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Management</h1>
          <p className="text-gray-400 mt-1">View user profiles, KYC status, and financial history.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 flex items-center gap-2 text-sm">
            Export
          </button>
          <input type="text" placeholder="Search clients..." className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded text-sm focus:border-indigo-500 outline-none w-64" />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900/50 text-gray-200 font-medium border-b border-gray-700">
            <tr>
              <th className="px-6 py-4">Client Name</th>
              <th className="px-6 py-4">Verification</th>
              <th className="px-6 py-4">Account Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">Loading clients...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">No clients found.</td></tr>
            ) : (
              clients.map(client => (
                <tr 
                  key={client.id} 
                  onClick={() => handleRowClick(client)} 
                  className="hover:bg-gray-700/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                        {client.full_name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-white font-medium">{client.full_name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {client.is_verified ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">Verified</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-900/30 text-orange-400 border border-orange-800">Pending KYC</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300 bg-gray-700/50 px-2 py-1 rounded text-xs">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(client.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-indigo-400 text-xs hover:underline">View Details</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CLIENT DETAILS MODAL */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-xl w-full max-w-3xl overflow-hidden border border-gray-700 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-900">
              <h3 className="text-xl font-bold text-white">{selectedClient.full_name}</h3>
              <button onClick={closeDetails} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs uppercase">Email</p>
                  <p className="text-white">{selectedClient.email}</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs uppercase">Phone</p>
                  <p className="text-white">{selectedClient.phone || "N/A"}</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs uppercase">ID Number</p>
                  <p className="text-white">{selectedClient.id_number || "N/A"}</p>
                </div>
                <div className="bg-gray-700/30 p-4 rounded-lg">
                  <p className="text-gray-400 text-xs uppercase">Verification</p>
                  <p className={selectedClient.is_verified ? "text-green-400" : "text-orange-400"}>
                    {selectedClient.is_verified ? "Verified" : "Pending"}
                  </p>
                </div>
              </div>

              <h4 className="text-lg font-bold text-white mb-4">Loan History</h4>
              {loadingDetails ? (
                <p className="text-gray-500">Loading loans...</p>
              ) : clientLoans.length === 0 ? (
                <p className="text-gray-500">No loans found for this client.</p>
              ) : (
                <div className="space-y-3">
                  {clientLoans.map(loan => (
                    <div key={loan.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Loan #{loan.id.slice(0,6)}</span>
                          <span className={`px-2 text-[10px] uppercase rounded font-bold ${
                            loan.status === 'active' ? 'bg-green-900 text-green-400' : 
                            loan.status === 'pending' ? 'bg-yellow-900 text-yellow-400' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {loan.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Amount: K {loan.amount.toLocaleString()} | Due: K {loan.total_repayment?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Balance</p>
                        <p className="text-lg font-bold text-indigo-400">K {loan.balance?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}