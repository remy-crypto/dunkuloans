import { useEffect, useState } from "react";
import { supabase } from "../lib/SupabaseClient";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const verifyAdmin = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role !== "admin") {
        alert(`Access Denied.`);
        navigate("/dashboard");
      } else {
        setIsAdmin(true);
        fetchLoans();
      }
    };

    verifyAdmin();
  }, [user, navigate]);

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from("loans")
        .select(`
          *,
          profiles:borrower_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLoans(data || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (loanId, newStatus) => {
    if (!window.confirm(`Mark loan as ${newStatus}?`)) return;

    const { error } = await supabase
      .from("loans")
      .update({ status: newStatus })
      .eq("id", loanId);

    if (error) alert(error.message);
    else fetchLoans();
  };

  if (!isAdmin) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-800">Verifying...</div>;

  const pendingLoans = loans.filter(l => l.status === 'pending');
  const activeLoans = loans.filter(l => l.status === 'active');

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Sidebar - Fixed Left */}
      <Sidebar />

      {/* Main Content - Pushed Right */}
      <div className="flex-1 p-8 ml-0 md:ml-64">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Control</h1>
            <p className="text-gray-500 mt-1">Overview of all loan applications</p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-lg shadow-md border border-slate-700">
            <span className="text-xs font-bold tracking-widest uppercase">Admin Mode</span>
          </div>
        </header>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Requests</h3>
            <p className="text-4xl font-black text-orange-500 mt-2">{pendingLoans.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Portfolio</h3>
            <p className="text-4xl font-black text-blue-600 mt-2">{activeLoans.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Loans</h3>
            <p className="text-4xl font-black text-gray-800 mt-2">{loans.length}</p>
          </div>
        </div>

        {/* Loan Management Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-bold text-lg text-gray-800">Loan Applications</h2>
            <span className="text-sm text-gray-500">{loans.length} records found</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-8 py-4">Client Name</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    
                    {/* Client Info */}
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900 text-base">{loan.profiles?.full_name || "Unknown User"}</div>
                      <div className="text-sm text-gray-500">{loan.profiles?.email}</div>
                    </td>

                    {/* Amount */}
                    <td className="px-8 py-5">
                      <span className="font-bold text-gray-700 text-lg">K {loan.amount.toLocaleString()}</span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        loan.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        loan.status === 'active' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        loan.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                        'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {loan.status}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        {loan.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction(loan.id, 'active')}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-md transition transform hover:scale-105"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleAction(loan.id, 'rejected')}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold shadow-md transition transform hover:scale-105"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {loan.status === 'active' && (
                          <button 
                            onClick={() => handleAction(loan.id, 'settled')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md transition transform hover:scale-105"
                          >
                            Mark Paid
                          </button>
                        )}
                        {loan.status !== 'pending' && loan.status !== 'active' && (
                          <span className="text-gray-400 text-sm font-medium italic">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}