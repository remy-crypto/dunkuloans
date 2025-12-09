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

  useEffect(() => {
    if (!user) return;
    checkAdmin();
    fetchLoans();
  }, [user]);

  // Security Check: Kick out non-admins
  const checkAdmin = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (data?.role !== "admin") {
      alert("Access Denied: You are not an Admin");
      navigate("/dashboard");
    }
  };

  const fetchLoans = async () => {
    try {
      // Fetch loans AND the profile info of the borrower
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
    if (!window.confirm(`Are you sure you want to ${newStatus} this loan?`)) return;

    const { error } = await supabase
      .from("loans")
      .update({ status: newStatus })
      .eq("id", loanId);

    if (error) {
      alert("Error: " + error.message);
    } else {
      // Refresh list
      fetchLoans();
    }
  };

  // Stats
  const pendingLoans = loans.filter(l => l.status === 'pending');
  const activeLoans = loans.filter(l => l.status === 'active');

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-8">
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Control</h1>
            <p className="text-slate-500">Manage approvals and loan lifecycle</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200">
            <span className="text-sm font-bold text-slate-600">Admin Mode</span>
          </div>
        </header>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Pending Approvals</h3>
            <p className="text-3xl font-black text-orange-500 mt-2">{pendingLoans.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Active Portfolio</h3>
            <p className="text-3xl font-black text-blue-600 mt-2">{activeLoans.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Total Applications</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">{loans.length}</p>
          </div>
        </div>

        {/* Master Loan Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-700">Loan Applications</h2>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 font-bold">Client</th>
                <th className="px-6 py-3 font-bold">Amount</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{loan.profiles?.full_name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{loan.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    K {loan.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      loan.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      loan.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      loan.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {loan.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleAction(loan.id, 'active')}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-bold shadow-sm"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleAction(loan.id, 'rejected')}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-bold shadow-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {loan.status === 'active' && (
                      <button 
                        onClick={() => handleAction(loan.id, 'settled')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-sm font-bold shadow-sm"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}